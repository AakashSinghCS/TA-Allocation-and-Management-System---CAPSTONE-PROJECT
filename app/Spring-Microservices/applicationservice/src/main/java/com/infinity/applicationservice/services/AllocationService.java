package com.infinity.applicationservice.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.infinity.applicationservice.dtos.Allocations.AllocatedSectionDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationCsvDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationRequest;
import com.infinity.applicationservice.dtos.Allocations.ImportCourseRequest;
import com.infinity.applicationservice.dtos.Allocations.ImportSectionRequest;
import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Courses.CourseDto;
import com.infinity.applicationservice.dtos.Courses.SectionDto;
import com.infinity.applicationservice.dtos.Needs.NeedDto;
import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.enums.ApplicationStatus;
import com.infinity.applicationservice.enums.TaskType;
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

    public AllocationHistoryDto getAllocationByStudentId(Long studentId, Boolean noContentAllowed) {
        Allocation allocation = allocationRepository.findByStudentId(studentId);
        if (allocation == null) {
            if (noContentAllowed != null && noContentAllowed) {
                return null;
            } else {
                throw new NotFoundException("Allocation not found for student ID: " + studentId);
            }
        }
        if (allocation.getAllocatedSections().isEmpty()) {
            throw new NotFoundException("Allocation ID " + allocation.getId() + " has no associated sections.");
        }
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
        } else {
            allocation = allocationRepository.findByApplicationId(request.applicationId());
            if (allocation == null) {
                throw new NotFoundException("No allocation found for student ID: " + request.studentId());
            }
            if (allocation.getApplication().getId() != request.applicationId()) {
                throw new BadRequestException("Student already has an allocation for a different application.");
            }
            if (allocation.getStatus() == ApplicationStatus.CONFIRMED) {
                allocationRepository.delete(allocation);
                allocation = new Allocation();
                allocation.setApplication(application);
                allocation.setStudentId(request.studentId());
                allocation.setStatus(ApplicationStatus.SENT);
            }
        }
        if (allocatedSectionRepository.existsBySectionIdAndAllocationIdAndTask(
            request.sectionId(), allocation.getId(), request.task())) {
            throw new BadRequestException("You have already allocated this student to that section");
        }
        AllocatedSection savedAllocatedSection = new AllocatedSection();
        savedAllocatedSection.setTask(request.task());
        savedAllocatedSection.setSectionId(request.sectionId());
        savedAllocatedSection.setAllocation(allocation);
        savedAllocatedSection.setHours(request.hours());
        allocationRepository.save(allocation);
        allocatedSectionRepository.save(savedAllocatedSection);
        
        courseInterface.incrementNumberOfTAs(request.sectionId());
        UserDto student = studentInterface.getStudentById(request.studentId()).getBody();

        ApplicationDto applicationDto = null;
        // If it's preferable to throw an exception than let Application be null, change
        // please change this to an NotFoundException.
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
            if (allocatedSection.getTask() == TaskType.GRADING) {
                allocation.setGradingHours(
                Optional.ofNullable(allocation.getGradingHours()).orElse(0) - (int) allocatedSection.getHours());
            } else if (allocatedSection.getTask() == TaskType.LAB_PREP) {
                allocation.setLabPrepHours(
                Optional.ofNullable(allocation.getLabPrepHours()).orElse(0.0) - allocatedSection.getHours());
            } else if (allocatedSection.getTask() == TaskType.LAB) {
                allocation.setSectionHours(
                Optional.ofNullable(allocation.getSectionHours()).orElse(0.0) - allocatedSection.getHours());
            }
            SectionDto section = courseInterface.getSectionById(allocatedSection.getSectionId());
            NeedDto need = courseInterface.getNeed(section.course().id(), section.year(), section.semester());
            courseInterface.updateNeedAllocatedHours(need.id(),
                    need.numHoursCurrentlyAllocated() - allocation.getGradingHours());
        }
        Long sectionId = allocatedSection.getSectionId();

        allocatedSectionRepository.delete(allocatedSection);
        allocation = allocationRepository.findById(allocatedSection.getAllocation().getId())
            .orElseThrow(() -> new NotFoundException("Allocation not found"));
        if (allocation.getAllocatedSections().isEmpty()) {
            allocationRepository.delete(allocation);
        }

        courseInterface.decrementNumberOfTAs(sectionId);
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
            NeedDto need = courseInterface.getNeed(section.course().id(), section.year(), section.semester());
            courseInterface.updateNeedAllocatedHours(need.id(),
                    need.numHoursCurrentlyAllocated() + allocation.getGradingHours());
            for (AllocatedSection allocatedSection : allocation.getAllocatedSections()) {
                if (allocatedSection.getTask() == TaskType.GRADING) {
                    allocation.setGradingHours(
                        Optional.ofNullable(allocation.getGradingHours()).orElse(0) + (int) allocatedSection.getHours());
                } else if (allocatedSection.getTask() == TaskType.LAB_PREP) {
                    allocation.setLabPrepHours(
                        Optional.ofNullable(allocation.getLabPrepHours()).orElse(0.0) + allocatedSection.getHours());
                } else if (allocatedSection.getTask() == TaskType.LAB) {
                    allocation.setSectionHours(
                        Optional.ofNullable(allocation.getSectionHours()).orElse(0.0) + allocatedSection.getHours());
                }
            }
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
                    // If it's preferable to throw an exception than let Application be null, change
                    // please change this to an NotFoundException.
                    if (allocation.getApplication() != null && allocation.getApplication().getId() != null) {
                        applicationDto = applicationMapper.toDto(allocation.getApplication());
                    }
                    return allocationMapper.toDto(allocation, student, applicationDto);
                })
                .collect(Collectors.toList());
    }

    public List<AllocatedSectionDto> getAllocationsBySectionId(Long sectionId) {
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

    public AllocationHistoryDto getAllocationByApplicationId(Long appId, Long userIdFromHeader,
            List<String> headerRoles) {
        if (!allocationRepository.existsByStudentIdAndApplicationId(userIdFromHeader, appId) && !headerRoles.contains("ROLE_COORDINATOR")) {
                    throw new AuthorizationException("You don't have permission to access this application");
                }
        Allocation allocation = allocationRepository.findByApplicationId(appId);
        return allocationMapper.toDto(allocation, studentInterface.getStudentById(allocation.getStudentId()).getBody(), applicationMapper.toDto(allocation.getApplication()));
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

    public List<AllocationHistoryDto> importPreviousAllocations(List<Map<String, String>> allocationDataList,
            boolean autoCreate) {

        List<AllocationHistoryDto> importedAllocations = new ArrayList<>();
        HashMap<AllocationCsvDto, List<AllocatedSectionDto>> allocationMap = new HashMap<>();
        for (Map<String, String> data : allocationDataList) {
            Integer studentNum = Integer.parseInt(data.get("studentNum").trim());
            String deptCode = data.get("deptCode").trim();
            String courseNum = data.get("courseNum").trim();
            String section = data.get("section").trim();
            int year = Integer.parseInt(data.get("year").trim());
            String semester = data.get("semester").trim();

            

            UserDto studentDto = studentInterface.getStudentByNum(studentNum).getBody();
            if (studentDto == null) {
                throw new NotFoundException("Student not found: " + studentNum);
            }

            CourseDto courseDto;
            try {
                courseDto = courseInterface.getCourseByDeptCodeAndCourseNum(deptCode, courseNum).getBody();
            } catch (Exception e) {
                if (autoCreate) {
                    courseDto = courseInterface.addCourse(new ImportCourseRequest(deptCode, courseNum));
                } else {
                    throw new NotFoundException("Course not found:" + deptCode + " " + courseNum);
                }
            }

            SectionDto sectionDto;
            try {
                sectionDto = courseInterface.getByCourseIdSectionYearSemester(courseDto.id(), section, year, semester);
            } catch (Exception e) {
                if (autoCreate) {
                    sectionDto = courseInterface.addSection(courseDto.id(),
                            new ImportSectionRequest(section, year, semester));
                } else {
                    throw new NotFoundException("Section " + section + " " + year + " " + semester
                            + " not found for Course " + courseDto.deptCode() + " " + courseDto.courseNum());
                }
            }
            
            Application application = new Application(studentDto.id(), List.of(), null, false, null, year, semester);
            Allocation allocation = new Allocation();
            allocation.setStudentId(studentDto.id());
            allocation.setApplication(application);
            allocation.setStatus(ApplicationStatus.CONFIRMED);
            AllocationCsvDto key = new AllocationCsvDto(studentNum, studentDto.id(), year, semester);

            if (allocationMap.containsKey(key)) {
                AllocatedSectionDto allocatedSection = new AllocatedSectionDto(null, allocation.getId(), sectionDto.id(), null);
                allocationMap.get(key).add(allocatedSection);
            } else {
                AllocatedSectionDto allocatedSection = new AllocatedSectionDto(null, allocation.getId(), sectionDto.id(), null);
                allocationMap.put(key, List.of(allocatedSection));
            }
        }
        for (Map.Entry<AllocationCsvDto, List<AllocatedSectionDto>> entry : allocationMap.entrySet()) {
            AllocationCsvDto key = entry.getKey();
            List<AllocatedSectionDto> allocatedSectionDtos = entry.getValue();

            Allocation allocation = new Allocation();
            allocation.setStudentId(key.studentId());
            allocation.setStatus(ApplicationStatus.CONFIRMED);
            Allocation savedAllocation = allocationRepository.save(allocation);
            
            List<AllocatedSection> allocatedSections = new ArrayList<>();
            for (AllocatedSectionDto allocatedSectionDto : allocatedSectionDtos) {
                AllocatedSection allocatedSection = new AllocatedSection();
                allocatedSection.setSectionId(allocatedSectionDto.sectionId());
                allocatedSection.setHours(0.0);
                allocatedSection.setTask(null);
                allocatedSection.setAllocation(savedAllocation);
                allocatedSections.add(allocatedSection);
                allocatedSectionRepository.save(allocatedSection);
            }
            importedAllocations.add(allocationMapper.toDto(savedAllocation, studentInterface.getStudentByNum(key.studentNum()).getBody(), null));
        }
        return importedAllocations;
    }

}
