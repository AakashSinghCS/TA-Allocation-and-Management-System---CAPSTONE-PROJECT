package com.infinity.courseservice.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedRequest;
import com.infinity.courseservice.enums.ActionOptions;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.ApplicationInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.CourseNeed;
import com.infinity.courseservice.models.Need;
import com.infinity.courseservice.models.Prereq;
import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.repositories.CourseNeedRepository;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.NeedRepository;
import com.infinity.courseservice.repositories.SemesterRepository;
import com.infinity.courseservice.utility.NeedMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NeedService {

    private final CourseRepository courseRepository;
    private final NeedRepository needRepository;
    private final CourseNeedRepository courseNeedRepository;
    private final SemesterRepository semesterRepository;
    private final NeedMapper needMapper;
    private final ApplicationInterface applicationInterface;
    private final AuditService auditService;

    public NeedDto addNeed(NeedRequest request, Long courseId, Long userIdFromHeader) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("No course with id " + courseId));
        Semester semester = semesterRepository.findByYearAndSemester(request.year(), request.semester())
                .orElseThrow(() -> new NotFoundException("That semester doesn't exist"));

        if (courseNeedRepository.existsByCourseAndSemester(course, semester)) {
            throw new BadRequestException("Need already exists for course that year and semester");
        }

        if (LocalDateTime.now()
                .isAfter(applicationInterface.getDeadlineByName("student_application_deadline").getBody().endTime())) {
            throw new BadRequestException("The need update deadline has passed.");
        }
        if (LocalDateTime.now().isBefore(
                applicationInterface.getDeadlineByName("student_application_deadline").getBody().startTime())) {
            throw new BadRequestException("The need update is not open yet.");
        }

        Need need = new Need(request.description(), request.requiredGradingHours(),
                request.numHoursCurrentlyAllocated());
        need = needRepository.save(need);

        auditService.record(
            userIdFromHeader,
            ActionOptions.CREATE,
            "Need",   
            null,               
            need,           
            need.getId()   
        );

        CourseNeed courseNeed = new CourseNeed(course, need, semester);
        courseNeed = courseNeedRepository.save(courseNeed);

        if (request.prerequisiteCourseIds() != null) {
            List<Course> prereqCourses = courseRepository.findAllById(request.prerequisiteCourseIds());
            for (Course prereq : prereqCourses) {
                Prereq p = new Prereq();
                p.setCourseNeed(courseNeed);
                p.setPrerequisite(prereq);
                courseNeed.getPrerequisites().add(p);
            }
        }

        courseNeed = courseNeedRepository.save(courseNeed);
        auditService.record(
            userIdFromHeader,
            ActionOptions.CREATE,
            "CourseNeed",   
            null,               
            courseNeed,           
            courseNeed.getId()   
        );

        return needMapper.courseNeedToDto(courseNeed);
    }

    public NeedDto getNeed(Long courseId, Integer year, String semester) {
        CourseNeed courseNeed = courseNeedRepository
                .findByCourseIdAndSemester_YearAndSemester_Semester(courseId, year, semester)
                .orElseThrow(() -> new NotFoundException("Course has no need for that year and semester"));
        return needMapper.courseNeedToDto(courseNeed);
    }

    public NeedDto updateNeed(NeedRequest request, Long courseId, Integer year, String semester, Long userIdFromHeader) {
        CourseNeed courseNeed = courseNeedRepository
                .findByCourseIdAndSemester_YearAndSemester_Semester(courseId, year, semester)
                .orElseThrow(() -> new NotFoundException("Course has no need for that year and semester"));
        CourseNeed before = new CourseNeed(courseNeed);
        if (LocalDateTime.now().isAfter(
                applicationInterface.getDeadlineByName("instructor_need_update_deadline").getBody().endTime())) {
            throw new BadRequestException("The application deadline has passed.");
        }
        if (LocalDateTime.now().isBefore(
                applicationInterface.getDeadlineByName("instructor_need_update_deadline").getBody().startTime())) {
            throw new BadRequestException("The application is not open yet.");
        }
        Semester semesterObj = semesterRepository.findByYearAndSemester(year, semester)
                .orElseThrow(() -> new NotFoundException("That semester doesn't exist"));
        Need beforeNeed = new Need(courseNeed.getNeed());
        courseNeed.getNeed().setDescription(request.description());
        courseNeed.getNeed().setRequiredGradingHours(request.requiredGradingHours());
        courseNeed.getNeed().setNumHoursCurrentlyAllocated(request.numHoursCurrentlyAllocated());
        courseNeed.setSemester(semesterObj);

        courseNeed.getPrerequisites().clear();
        courseNeedRepository.save(courseNeed);
        auditService.record(
            userIdFromHeader,
            ActionOptions.UPDATE,
            "CourseNeed",   
            before,               
            courseNeed,           
            courseNeed.getId()   
        );
        if (request.prerequisiteCourseIds() != null) {
            List<Course> prereqCourses = courseRepository.findAllById(request.prerequisiteCourseIds());
            for (Course prereq : prereqCourses) {
                Prereq p = new Prereq();
                p.setCourseNeed(courseNeed);
                p.setPrerequisite(prereq);
                courseNeed.getPrerequisites().add(p);
            }
        }
        
        Need savedNeed = needRepository.save(courseNeed.getNeed());
        auditService.record(
            userIdFromHeader,
            ActionOptions.UPDATE,
            "Need",   
            beforeNeed,               
            savedNeed,           
            savedNeed.getId()   
        );
        courseNeed = courseNeedRepository.save(courseNeed);
        auditService.record(
            userIdFromHeader,
            ActionOptions.UPDATE,
            "CourseNeed",   
            before,               
            courseNeed,           
            courseNeed.getId()   
        );
        return needMapper.courseNeedToDto(courseNeed);
    }

    public String deleteNeed(Long courseId, Integer year, String semester,Long userIdFromHeader) {
        CourseNeed courseNeed = courseNeedRepository
                .findByCourseIdAndSemester_YearAndSemester_Semester(courseId, year, semester)
                .orElseThrow(() -> new NotFoundException("Course has no need for that year and semester"));
        Need need = courseNeed.getNeed();

        Need snapshotNeed = new Need(need);  
        List<CourseNeed> snapshotCourseNeeds = new ArrayList<>(need.getCourseNeeds());

        needRepository.delete(need);

        auditService.record(
            userIdFromHeader,
            ActionOptions.DELETE,
            "Need",            
            snapshotNeed, 
            null,          
            snapshotNeed.getId()   
        );
        snapshotCourseNeeds.forEach(cn -> 
            auditService.record(
                userIdFromHeader,
                ActionOptions.DELETE,
                "CourseNeed",
                cn,
                null,
                cn.getId()
            )
        );
        return "Need deleted";
    }

    public String updateAllocatedHours(Long needId, Integer numHoursAllocated,Long userIdFromHeader) {
        if (!needRepository.existsById(needId)) {
            throw new NotFoundException("No need with id " + needId);
        }
        needRepository.updateNeedAllocatedHours(needId, numHoursAllocated);
        return "Need updated";
    }

}
