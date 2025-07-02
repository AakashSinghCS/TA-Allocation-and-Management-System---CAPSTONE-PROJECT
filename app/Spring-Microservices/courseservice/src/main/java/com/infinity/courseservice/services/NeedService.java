package com.infinity.courseservice.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedRequest;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
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

   public NeedDto addNeed(NeedRequest request, Long courseId) {
    Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new NotFoundException("No course with id " + courseId));
    
    if (courseNeedRepository.existsByCourseAndYearAndSemester(course, request.year(), request.semester())) {
        throw new BadRequestException("Need already exists for course that year and semester");
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

            courseNeed.getNeed().setDescription(request.description());
            courseNeed.getNeed().setRequiredGradingHours(request.requiredGradingHours());
            courseNeed.getNeed().setNumHoursCurrentlyAllocated(request.numHoursCurrentlyAllocated());
            courseNeed.setYear(request.year());
            courseNeed.setSemester(request.semester());

            courseNeed.getPrerequisites().clear();
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
