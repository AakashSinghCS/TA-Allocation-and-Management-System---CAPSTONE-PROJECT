package com.infinity.courseservice.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedRequest;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.ApplicationInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.CourseNeed;
import com.infinity.courseservice.models.Need;
import com.infinity.courseservice.models.Prereq;
import com.infinity.courseservice.repositories.CourseNeedRepository;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.NeedRepository;
import com.infinity.courseservice.utility.NeedMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NeedService {

    private final CourseRepository courseRepository;
    private final NeedRepository needRepository;
    private final CourseNeedRepository courseNeedRepository;
    private final NeedMapper needMapper;
    private final ApplicationInterface applicationInterface;

    public NeedDto addNeed(NeedRequest request, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("No course with id " + courseId));
        
        if (courseNeedRepository.existsByCourseAndYearAndSemester(course, request.year(), request.semester())) {
            throw new BadRequestException("Need already exists for course that year and semester");
        }

        if (LocalDateTime.now().isAfter(applicationInterface.getDeadlineByName("student_application_deadline").getBody().endTime())) {
                throw new BadRequestException("The need update deadline has passed.");
            }
        if (LocalDateTime.now().isBefore(applicationInterface.getDeadlineByName("student_application_deadline").getBody().startTime())) {
            throw new BadRequestException("The need update is not open yet.");
        }

        Need need = new Need(request.description(), request.requiredGradingHours(), request.numHoursCurrentlyAllocated());
        need = needRepository.save(need);

        CourseNeed courseNeed = new CourseNeed(course, need, request.year(), request.semester());
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
        return needMapper.courseNeedToDto(courseNeed);
    }


    public NeedDto getNeed(Long courseId, Integer year, String semester) {
        CourseNeed courseNeed = courseNeedRepository.findByCourseIdAndYearAndSemester(courseId, year, semester)
                .orElseThrow(() -> new NotFoundException("Course has no need for that year and semester"));
        return needMapper.courseNeedToDto(courseNeed);
    }

    public NeedDto updateNeed(NeedRequest request, Long courseId, Integer year, String semester) {
        CourseNeed courseNeed = courseNeedRepository.findByCourseIdAndYearAndSemester(courseId, year, semester)
                        .orElseThrow(() -> new NotFoundException("Course has no need for that year and semester"));
        if (LocalDateTime.now().isAfter(applicationInterface.getDeadlineByName("instructor_need_update_deadline").getBody().endTime())) {
            throw new BadRequestException("The application deadline has passed.");
        }
        if (LocalDateTime.now().isBefore(applicationInterface.getDeadlineByName("instructor_need_update_deadline").getBody().startTime())) {
            throw new BadRequestException("The application is not open yet.");
        }
        courseNeed.getNeed().setDescription(request.description());
        courseNeed.getNeed().setRequiredGradingHours(request.requiredGradingHours());
        courseNeed.getNeed().setNumHoursCurrentlyAllocated(request.numHoursCurrentlyAllocated());
        courseNeed.setYear(request.year());
        courseNeed.setSemester(request.semester());

        courseNeed.getPrerequisites().clear();
        courseNeedRepository.save(courseNeed);
        if (request.prerequisiteCourseIds() != null) {
                List<Course> prereqCourses = courseRepository.findAllById(request.prerequisiteCourseIds());
                for (Course prereq : prereqCourses) {
                        Prereq p = new Prereq();
                        p.setCourseNeed(courseNeed);
                        p.setPrerequisite(prereq);
                        courseNeed.getPrerequisites().add(p);
                }
        }
        needRepository.save(courseNeed.getNeed());
        courseNeed = courseNeedRepository.save(courseNeed);
        return needMapper.courseNeedToDto(courseNeed);
    }

    public String deleteNeed(Long courseId, Integer year, String semester) {
            CourseNeed courseNeed = courseNeedRepository
                        .findByCourseIdAndYearAndSemester(courseId, year, semester)
                        .orElseThrow(() -> new NotFoundException("Course has no need for that year and semester"));
        needRepository.delete(courseNeed.getNeed());
        return "Need deleted";
    }

}
