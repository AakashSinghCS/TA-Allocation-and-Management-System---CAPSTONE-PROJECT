package com.infinity.applicationservice.services;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;

import com.infinity.applicationservice.dtos.Allocations.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationRequest;
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

        ApplicationDto applicationDto = applicationMapper.toDto(application);

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
                ApplicationDto applicationDto = applicationMapper.toDto(allocation.getApplication());
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
                ApplicationDto applicationDto = applicationMapper.toDto(allocation.getApplication());
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
                ApplicationDto applicationDto = applicationMapper.toDto(allocation.getApplication());
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
                ApplicationDto applicationDto = applicationMapper.toDto(allocation.getApplication());
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
                ApplicationDto applicationDto = applicationMapper.toDto(allocation.getApplication());
                return allocationMapper.toDto(allocation, student, applicationDto, section );
            })
            .collect(Collectors.toList());
    }

    public void importPreviousAllocations(MultipartFile file) {
        try (Reader reader = new InputStreamReader(file.getInputStream())) {

            CSVFormat format = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .get();

            Iterable<CSVRecord> records = format.parse(reader);

            for (CSVRecord record : records) {
                Integer studentNum = Integer.parseInt(record.get("studentNum").trim());
                String deptCode = record.get("deptCode").trim();
                String courseNum = record.get("courseNum").trim();
                String sectionName = record.get("section").trim();
                int year = Integer.parseInt(record.get("year").trim());
                String semester = record.get("semester").trim();

                StudentDto studentDto = studentInterface
                        .getStudentByNum(studentNum)
                        .getBody();

                if (studentDto == null) {
                    throw new RuntimeException("Student not found with studentNum: " + studentNum);
                }

                CourseDto courseDto = sectionInterface
                        .getCourseByDeptCodeAndCourseNum(deptCode, courseNum)
                        .getBody();

                if (courseDto == null) {
                    throw new RuntimeException("Course not found: " + deptCode + " " + courseNum);
                }

                SectionDto sectionDto = sectionInterface
                        .getByCourseIdSectionYearSemester(courseDto.id(), sectionName, year, semester);
                Allocation allocation = new Allocation();
                allocation.setStudentId(studentDto.id());
                allocation.setSectionId(sectionDto.id());
                allocation.setStatus(ApplicationStatus.CONFIRMED);

                allocationRepository.save(allocation);
            }

        } catch (IOException e) {
            throw new RuntimeException("Failed to parse CSV: " + e.getMessage(), e);
        }
    }
}
