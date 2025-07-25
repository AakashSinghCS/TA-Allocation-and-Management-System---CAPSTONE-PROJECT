package com.infinity.applicationservice.services;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.infinity.applicationservice.dtos.Allocations.AllocatedSectionDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationRequest;
import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Courses.SectionDto;
import com.infinity.applicationservice.dtos.Needs.NeedDto;
import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.enums.ApplicationStatus;
import com.infinity.applicationservice.exceptions.AuthorizationException;
import com.infinity.applicationservice.exceptions.BadRequestException;
import com.infinity.applicationservice.exceptions.NotFoundException;
import com.infinity.applicationservice.feign.CourseInterface;
import com.infinity.applicationservice.feign.NotificationClient;
import com.infinity.applicationservice.feign.UserInterface;
import com.infinity.applicationservice.models.AllocatedSection;
import com.infinity.applicationservice.models.Allocation;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.repositories.AllocatedSectionRepository;
import com.infinity.applicationservice.repositories.AllocationRepository;
import com.infinity.applicationservice.repositories.ApplicationRepository;
import com.infinity.applicationservice.utility.AllocationMapper;
import com.infinity.applicationservice.utility.ApplicationMapper;
import com.infinity.applicationservice.utility.EmailMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AllocationService {

    private final AllocationRepository allocationRepository;
    private final ApplicationRepository applicationRepository;
    private final CourseInterface courseInterface;
    private final UserInterface studentInterface;
    private final ConfigService configService;
    private final ApplicationMapper applicationMapper;
    private final AllocationMapper allocationMapper;
    private final NotificationClient notificationClient;
    private final EmailMapper emailMapper;
    private final AllocatedSectionRepository allocatedSectionRepository;

    public AllocationHistoryDto getAllocationByStudentId(Long studentId) {
        Allocation allocation = allocationRepository.findByStudentId(studentId);
        UserDto student = studentInterface.getStudentById(studentId).getBody();
        List<Long> sectionIds = allocation.getAllocatedSections().stream()
                    .map(AllocatedSection::getSectionId)
                    .collect(Collectors.toList());
        if (sectionIds.isEmpty()) {
                throw new NotFoundException("Allocation ID " + allocation.getId() + " has no associated sectionId.");
        }

        ApplicationDto applicationDto = null;
        if (allocation.getApplication() != null && allocation.getApplication().getId() != null) {
                applicationDto = applicationMapper.toDto(allocation.getApplication());
        } else {
            throw new NotFoundException("Application not found for allocation ID " + allocation.getId());
        }
        if (allocation.getAllocatedSections().isEmpty()) {
            throw new NotFoundException("Allocation ID " + allocation.getId() + " has no associated sections.");
        }
        return allocationMapper.toDto(allocation, student, applicationDto);
    }

    public AllocationHistoryDto allocateStudent(AllocationRequest request) {
        Application application = applicationRepository.findById(request.applicationId())
                .orElseThrow(() -> new NotFoundException("Application not found"));
        
        Allocation allocation;
        if (!allocationRepository.existsByApplicationId(request.applicationId())) {
            allocation = new Allocation();
            allocation.setApplication(application);
            allocation.setStudentId(request.studentId());
            allocation.setStatus(ApplicationStatus.SENT);
            allocation.setLabPrepHours(
            Optional.ofNullable(allocation.getLabPrepHours()).orElse(0) + request.labPrepHours());
            allocation.setGradingHours(
            Optional.ofNullable(allocation.getGradingHours()).orElse(0) + request.gradingHours());
            allocation.setSectionHours(
            Optional.ofNullable(allocation.getSectionHours()).orElse(0) + request.sectionHours());

        } else {
            allocation = allocationRepository.findByStudentId(request.studentId());
            if (allocation == null) {
                throw new NotFoundException("No allocation found for student ID: " + request.studentId());
            }
            if (allocation.getApplication().getId() != request.applicationId()) {
                throw new BadRequestException("Student already has an allocation for a different application.");
            }
            allocation.setLabPrepHours(
            Optional.ofNullable(allocation.getLabPrepHours()).orElse(0) + request.labPrepHours());
            allocation.setGradingHours(
            Optional.ofNullable(allocation.getGradingHours()).orElse(0) + request.gradingHours());
            allocation.setSectionHours(
            Optional.ofNullable(allocation.getSectionHours()).orElse(0) + request.sectionHours());
            // allocation.setStatus(ApplicationStatus.UPDATED);
        }
        if (allocatedSectionRepository.existsBySectionIdAndAllocationId(
            request.sectionId(), allocation.getId())) {
            throw new BadRequestException("You have already allocated this student to that section");
        }
        AllocatedSection savedAllocatedSection = new AllocatedSection();
        savedAllocatedSection.setTask(request.task());
        savedAllocatedSection.setSectionId(request.sectionId());
        savedAllocatedSection.setAllocation(allocation);
        allocationRepository.save(allocation);
        allocatedSectionRepository.save(savedAllocatedSection);
        
        UserDto student = studentInterface.getStudentById(request.studentId()).getBody();

        ApplicationDto applicationDto = null;
        //If it's preferable to throw an exception than let Application be null, change please change this to an NotFoundException.
        if (allocation.getApplication() != null && allocation.getApplication().getId() != null) {
            applicationDto = applicationMapper.toDto(allocation.getApplication());
            notificationClient.sendEmail(emailMapper.allocationEmailRequest(student));
        }
        allocation = allocationRepository.findByStudentId(request.studentId());
        return allocationMapper.toDto(allocation, student, applicationDto);
    }
    
    public String deallocateStudent(Long allocatedSectionId) {
        AllocatedSection allocatedSection = allocatedSectionRepository.findById(allocatedSectionId)
            .orElseThrow(() -> new NotFoundException("Allocated section not found"));
        Allocation allocation = allocationRepository.findById(allocatedSection.getAllocation().getId())
            .orElseThrow(() -> new NotFoundException("Allocation not found"));
        if (allocation.getStatus() == ApplicationStatus.CONFIRMED) {
            SectionDto section = courseInterface.getSectionById(allocatedSection.getSectionId());
            NeedDto need = courseInterface.getNeed(allocation.getApplication().getId(), section.year(),
                    section.semester());
            courseInterface.updateNeedAllocatedHours(need.id(),
                    need.numHoursCurrentlyAllocated() - allocation.getGradingHours());
        }
        allocatedSectionRepository.delete(allocatedSection);
        return "Student deallocated";
    }


    @Transactional
    public void updateConfirmationStatus(Long allocationId, ApplicationStatus status) {
        Allocation allocation = allocationRepository.findById(allocationId)
            .orElseThrow(() -> new NotFoundException("Allocation not found"));
        if (LocalDateTime.now()
                .isBefore(configService.getDeadlineByName("student_offer_accept_deadline").startTime())) {
            throw new BadRequestException("The application is not open yet.");
        }
        if (LocalDateTime.now().isAfter(configService.getDeadlineByName("student_offer_accept_deadline").endTime())) {
            throw new BadRequestException("The application deadline has passed.");
        }
        if (status == ApplicationStatus.CONFIRMED) {
            SectionDto section = courseInterface.getSectionById(
                allocation.getAllocatedSections().stream()
                    .filter(as -> as.getSectionId() != null)
                    .findFirst()
                    .orElseThrow(() -> new NotFoundException("No allocated section with non-null sectionId"))
                    .getSectionId());
            NeedDto need = courseInterface.getNeed(allocation.getApplication().getId(), section.year(),
                    section.semester());
            courseInterface.updateNeedAllocatedHours(need.id(), need.numHoursCurrentlyAllocated() + allocation.getGradingHours());
        }        
        allocation.setStatus(status);
        allocationRepository.save(allocation);
    }

    public List<AllocationHistoryDto> getAllocationsByConfirmationStatus(ApplicationStatus status) {
        return allocationRepository.findAll().stream()
            .filter(a -> a.getStatus() == status)
            .map(allocation -> {
                UserDto student = studentInterface.getStudentById(allocation.getStudentId()).getBody();
                ApplicationDto applicationDto = null;
                //If it's preferable to throw an exception than let Application be null, change please change this to an NotFoundException.
                if (allocation.getApplication() != null && allocation.getApplication().getId() != null) {
                    applicationDto = applicationMapper.toDto(allocation.getApplication());
                }
                return allocationMapper.toDto(allocation, student, applicationDto);
            })
            .collect(Collectors.toList());
    }

    public List<AllocatedSectionDto> getAllocationsBySectionId(Long sectionId) {
        // return allocationRepository.findAll().stream()
        //     .filter(a -> a.getSectionId().equals(sectionId))
        //     .map(allocation -> {
        //         UserDto student = studentInterface.getStudentById(allocation.getStudentId()).getBody();
        //         SectionDto section = courseInterface.getSectionById(allocation.getSectionId());
        //         ApplicationDto applicationDto = null;
        //         //If application is not null, the TA requirements (needs) page does not work after importing allocations through csv.
        //         if (allocation.getApplication() != null && allocation.getApplication().getId() != null) {
        //             applicationDto = applicationMapper.toDto(allocation.getApplication());
        //         }
        //         return allocationMapper.toDto(allocation, student, applicationDto);
        //     })
        //     .collect(Collectors.toList()); 
        return allocatedSectionRepository.findAllBySectionId(sectionId).stream()
            .map(allocatedSection -> {
                Allocation allocation = allocationRepository.findById(allocatedSection.getAllocation().getId())
                    .orElseThrow(() -> new NotFoundException("Allocation not found with ID: " + allocatedSection.getAllocation().getId()));
                UserDto student = studentInterface.getStudentById(allocation.getStudentId()).getBody();
                return new AllocatedSectionDto(
                    allocatedSection.getId(),
                    allocation.getId(),
                    allocatedSection.getSectionId(),
                    allocatedSection.getTask()
                );
            })
            .collect(Collectors.toList());
    }

    public AllocationHistoryDto getAllocationByApplicationId(Long appId, Long userIdFromHeader,
            List<String> headerRoles) {
        if (!allocationRepository.existsByStudentIdAndApplicationId(userIdFromHeader, appId) && !headerRoles.contains("ROLE_COORDINATOR")) {
                    throw new AuthorizationException("You don't have permission to access this application");
                }
        Allocation allocation = allocationRepository.findByApplicationId(appId);
        return allocationMapper.toDto(allocation, studentInterface.getStudentById(userIdFromHeader).getBody(), applicationMapper.toDto(allocation.getApplication()));
        }

    public List<AllocationHistoryDto> getAllocationsByApplicationYear(int year) {
        return allocationRepository.findAll().stream()
            .filter(a -> a.getApplication() != null &&
                        a.getApplication().getSubmittedAt().getYear() == year)
            .map(allocation -> {
                UserDto student = studentInterface.getStudentById(allocation.getStudentId()).getBody();
                ApplicationDto applicationDto = null;
                //If it's preferable to throw an exception than let Application be null, change please change this to an NotFoundException.
                if (allocation.getApplication() != null && allocation.getApplication().getId() != null) {
                    applicationDto = applicationMapper.toDto(allocation.getApplication());
                }
                return allocationMapper.toDto(allocation, student, applicationDto);
            })
            .collect(Collectors.toList());
    }

    public List<AllocatedSectionDto> getAllocationsBySectionIdWithCourse(Long sectionId) {
        return allocatedSectionRepository.findAllBySectionId(sectionId).stream()
            .map(allocatedSection -> {
                Allocation allocation = allocationRepository.findById(allocatedSection.getAllocation().getId())
                    .orElseThrow(() -> new NotFoundException("Allocation not found with ID: " + allocatedSection.getAllocation().getId()));
                return new AllocatedSectionDto(
                    allocatedSection.getId(),
                    allocation.getId(),
                    allocatedSection.getSectionId(),
                    allocatedSection.getTask()
                );
            })
            .collect(Collectors.toList());
    }


    @Transactional
    public Integer deleteSection(Long sectionId) {
        return allocatedSectionRepository.deleteAllBySectionId(sectionId);
    }

    // public List<AllocationHistoryDto> importPreviousAllocations(List<Map<String, String>> allocationDataList, boolean autoCreate) {

    //     List<AllocationHistoryDto> importedAllocations = new ArrayList<>();

    //     for (Map<String, String> data : allocationDataList) {
    //         Integer studentNum = Integer.parseInt(data.get("studentNum").trim());
    //         String deptCode = data.get("deptCode").trim();
    //         String courseNum = data.get("courseNum").trim();
    //         String section = data.get("section").trim();
    //         int year = Integer.parseInt(data.get("year").trim());
    //         String semester = data.get("semester").trim();

    //         UserDto studentDto = studentInterface.getStudentByNum(studentNum).getBody();
    //         if (studentDto == null) {
    //             throw new NotFoundException("Student not found: " + studentNum);
    //         }
            

    //         CourseDto courseDto;
    //         try {
    //             courseDto = courseInterface.getCourseByDeptCodeAndCourseNum(deptCode, courseNum).getBody();
    //         } catch (Exception e) {
    //             if (autoCreate) {
    //                 courseDto = courseInterface.addCourse(new ImportCourseRequest(deptCode, courseNum));
    //             } else {
    //                 throw new NotFoundException("Course not found:" + deptCode + " " + courseNum);
    //             }
    //         }

    //         SectionDto sectionDto;
    //         try {
    //             sectionDto = courseInterface.getByCourseIdSectionYearSemester(courseDto.id(), section, year, semester);
    //         } catch (Exception e) {
    //             if (autoCreate) {
    //                 sectionDto = courseInterface.addSection(courseDto.id(), new ImportSectionRequest(section, year, semester)); 
    //             } else {
    //                 throw new NotFoundException("Section " + section + " " +  year + " " + semester + " not found for Course " + courseDto.deptCode() + " " + courseDto.courseNum());
    //             }
    //         }

    //         Allocation allocation = new Allocation();
    //         allocation.setStudentId(studentDto.id());
    //         allocation.setSectionId(sectionDto.id());
    //         allocation.setStatus(ApplicationStatus.CONFIRMED);
    //         allocation.setNumberOfHours(0);

    //         Allocation saved = allocationRepository.save(allocation);
    //         importedAllocations.add(allocationMapper.toDto(saved, studentDto, null, sectionDto));
    //     }

    //     return importedAllocations;
    // }

}
