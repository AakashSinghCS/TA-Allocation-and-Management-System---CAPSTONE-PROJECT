package com.infinity.applicationservice.services;


import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;


import com.infinity.applicationservice.dtos.Allocations.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationRequest;
import com.infinity.applicationservice.dtos.Allocations.ImportCourseRequest;
import com.infinity.applicationservice.dtos.Allocations.ImportSectionRequest;
import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Courses.CourseDto;
import com.infinity.applicationservice.dtos.Courses.SectionDto;
import com.infinity.applicationservice.dtos.Users.StudentDto;
import com.infinity.applicationservice.enums.ApplicationStatus;
import com.infinity.applicationservice.exceptions.AuthorizationException;
import com.infinity.applicationservice.exceptions.BadRequestException;
import com.infinity.applicationservice.exceptions.NotFoundException;
import com.infinity.applicationservice.feign.SectionInterface;
import com.infinity.applicationservice.feign.UserInterface;
import com.infinity.applicationservice.models.Allocation;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.repositories.AllocationRepository;
import com.infinity.applicationservice.repositories.ApplicationRepository;
import com.infinity.applicationservice.utility.AllocationMapper;
import com.infinity.applicationservice.utility.ApplicationMapper;

import feign.FeignException;

import com.infinity.applicationservice.exceptions.NotFoundException;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AllocationService {

    private final AllocationRepository allocationRepository;
    private final ApplicationRepository applicationRepository;
    private final SectionInterface sectionInterface;
    private final UserInterface studentInterface;
    private final ApplicationMapper applicationMapper;
    private final AllocationMapper allocationMapper;

    public List<AllocationHistoryDto> getAllocationsByStudentId(Long studentId) {
        List<Allocation> allocations = allocationRepository.findByStudentId(studentId);
        StudentDto student = studentInterface.getStudentById(studentId).getBody();

        return allocations.stream().map(allocation -> {
            SectionDto section = sectionInterface.getSectionById(allocation.getSectionId());
            ApplicationDto applicationDto = null;
            if (allocation.getApplication() != null && allocation.getApplication().getId() != null) {
                applicationDto = applicationMapper.toDto(allocation.getApplication());
            }
            return allocationMapper.toDto(allocation, student, applicationDto, section);
        }).collect(Collectors.toList());
    }

    public AllocationHistoryDto allocateStudent(AllocationRequest request) {
        Application application = applicationRepository.findById(request.applicationId())
                .orElseThrow(() -> new EntityNotFoundException("Application not found"));
        if (allocationRepository.existsByApplicationIdAndSectionIdAndStudentId(
                request.applicationId(), request.sectionId(), request.studentId())) {
            throw new BadRequestException("You have already allocated this student to that section");
        }

        Allocation allocation = new Allocation();
        allocation.setApplication(application);
        allocation.setStudentId(request.studentId());
        allocation.setStatus(ApplicationStatus.SENT);
        allocation.setNumberOfHours(request.numberOfHours());
        allocation.setSectionId(request.sectionId());

        Allocation saved = allocationRepository.save(allocation);
        StudentDto student = studentInterface.getStudentById(request.studentId()).getBody();
        SectionDto section = sectionInterface.getSectionById(request.sectionId());

        ApplicationDto applicationDto = null;
        //If it's preferable to throw an exception than let Application be null, change please change this to an NotFoundException.
        if (allocation.getApplication() != null && allocation.getApplication().getId() != null) {
            applicationDto = applicationMapper.toDto(allocation.getApplication());
        }

        return allocationMapper.toDto(saved, student, applicationDto, section);
    }
    
    public String deallocateStudent(Long allocationId) {
        if (!allocationRepository.existsById(allocationId)) {
            throw new NotFoundException("No allocation with id " + allocationId);
        }
        allocationRepository.deleteById(allocationId);
        return "Student deallocated";
    }


    public void updateConfirmationStatus(Long allocationId, ApplicationStatus status) {
        Allocation allocation = allocationRepository.findById(allocationId)
            .orElseThrow(() -> new EntityNotFoundException("Allocation not found"));

        allocation.setStatus(status);
        allocationRepository.save(allocation);
    }

    public List<AllocationHistoryDto> getAllocationsByConfirmationStatus(ApplicationStatus status) {
        return allocationRepository.findAll().stream()
            .filter(a -> a.getStatus() == status)
            .map(allocation -> {
                StudentDto student = studentInterface.getStudentById(allocation.getStudentId()).getBody();
                SectionDto section = sectionInterface.getSectionById(allocation.getSectionId());
                ApplicationDto applicationDto = null;
                //If it's preferable to throw an exception than let Application be null, change please change this to an NotFoundException.
                if (allocation.getApplication() != null && allocation.getApplication().getId() != null) {
                    applicationDto = applicationMapper.toDto(allocation.getApplication());
                }
                return allocationMapper.toDto(allocation, student, applicationDto, section);
            })
            .collect(Collectors.toList());
    }

    public List<AllocationHistoryDto> getAllocationsBySectionId(Long sectionId) {
        return allocationRepository.findAll().stream()
            .filter(a -> a.getSectionId().equals(sectionId))
            .map(allocation -> {
                StudentDto student = studentInterface.getStudentById(allocation.getStudentId()).getBody();
                SectionDto section = sectionInterface.getSectionById(allocation.getSectionId());
                ApplicationDto applicationDto = null;
                //If application is not null, the TA requirements (needs) page does not work after importing allocations through csv.
                if (allocation.getApplication() != null && allocation.getApplication().getId() != null) {
                    applicationDto = applicationMapper.toDto(allocation.getApplication());
                }
                return allocationMapper.toDto(allocation, student, applicationDto, section);
            })
            .collect(Collectors.toList());
    }

    public List<AllocationHistoryDto> getAllocationsByApplicationId(Long appId, Long userIdFromHeader,
            List<String> headerRoles) {
        if (!allocationRepository.existsByStudentIdAndApplicationId(userIdFromHeader, appId) && !headerRoles.contains("ROLE_COORDINATOR")) {
                    throw new AuthorizationException("You don't have permission to access this application");
                }
        return allocationRepository.findAll().stream()
            .filter(a -> a.getApplication() != null && a.getApplication().getId().equals(appId))
            .map(allocation -> {
                StudentDto student = studentInterface.getStudentById(allocation.getStudentId()).getBody();
                SectionDto section = sectionInterface.getSectionById(allocation.getSectionId());
                ApplicationDto applicationDto = null;
                //If it's preferable to throw an exception than let Application be null, change please change this to an NotFoundException.
                if (allocation.getApplication() != null && allocation.getApplication().getId() != null) {
                    applicationDto = applicationMapper.toDto(allocation.getApplication());
                }
                return allocationMapper.toDto(allocation, student, applicationDto, section);
            })
            .collect(Collectors.toList());
        }

    public List<AllocationHistoryDto> getAllocationsByApplicationYear(int year) {
        return allocationRepository.findAll().stream()
            .filter(a -> a.getApplication() != null &&
                        a.getApplication().getSubmittedAt().getYear() == year)
            .map(allocation -> {
                StudentDto student = studentInterface.getStudentById(allocation.getStudentId()).getBody();
                SectionDto section = sectionInterface.getSectionById(allocation.getSectionId());
                ApplicationDto applicationDto = null;
                //If it's preferable to throw an exception than let Application be null, change please change this to an NotFoundException.
                if (allocation.getApplication() != null && allocation.getApplication().getId() != null) {
                    applicationDto = applicationMapper.toDto(allocation.getApplication());
                }
                return allocationMapper.toDto(allocation, student, applicationDto, section);
            })
            .collect(Collectors.toList());
        }

        public List<AllocationHistoryDto> getAllocationsBySectionIdWithCourse(Long sectionId) {
        return allocationRepository.findAll().stream()
            .filter(a -> a.getSectionId().equals(sectionId))
            .map(allocation -> {
                StudentDto student = studentInterface.getStudentById(allocation.getStudentId()).getBody();
                SectionDto section = sectionInterface.getSectionById(allocation.getSectionId());
                ApplicationDto applicationDto = null;
                //If it's preferable to throw an exception than let Application be null, change please change this to an NotFoundException.
                if (allocation.getApplication() != null && allocation.getApplication().getId() != null) {
                    applicationDto = applicationMapper.toDto(allocation.getApplication());
                }
                return allocationMapper.toDto(allocation, student, applicationDto, section );
            })
            .collect(Collectors.toList());
    }

    public List<AllocationHistoryDto> importPreviousAllocations(List<Map<String, String>> allocationDataList, boolean autoCreate) {
        List<AllocationHistoryDto> importedAllocations = new ArrayList<>();

        for (Map<String, String> data : allocationDataList) {
            Integer studentNum = Integer.parseInt(data.get("studentNum").trim());
            String deptCode = data.get("deptCode").trim();
            String courseNum = data.get("courseNum").trim();
            String section = data.get("section").trim();
            int year = Integer.parseInt(data.get("year").trim());
            String semester = data.get("semester").trim();

            StudentDto studentDto = studentInterface.getStudentByNum(studentNum).getBody();
            if (studentDto == null) {
                throw new NotFoundException("Student not found: " + studentNum);
            }
            

            CourseDto courseDto;
            try {
                courseDto = sectionInterface.getCourseByDeptCodeAndCourseNum(deptCode, courseNum).getBody();
            } catch (Exception e) {
                if (autoCreate) {
                    courseDto = sectionInterface.addCourse(new ImportCourseRequest(deptCode, courseNum));
                } else {
                    throw new NotFoundException("Course not found:" + deptCode + " " + courseNum);
                }
            }

            SectionDto sectionDto;
            try {
                sectionDto = sectionInterface.getByCourseIdSectionYearSemester(courseDto.id(), section, year, semester);
            } catch (Exception e) {
                if (autoCreate) {
                    sectionDto = sectionInterface.addSection(courseDto.id(), new ImportSectionRequest(section, year, semester)); 
                } else {
                    throw new NotFoundException("Section " + section + " " +  year + " " + semester + " not found for Course " + courseDto.deptCode() + " " + courseDto.courseNum());
                }
            }

            Allocation allocation = new Allocation();
            allocation.setStudentId(studentDto.id());
            allocation.setSectionId(sectionDto.id());
            allocation.setStatus(ApplicationStatus.CONFIRMED);
            allocation.setNumberOfHours(0);

            Allocation saved = allocationRepository.save(allocation);
            importedAllocations.add(allocationMapper.toDto(saved, studentDto, null, sectionDto));
        }

        return importedAllocations;
    }

}
