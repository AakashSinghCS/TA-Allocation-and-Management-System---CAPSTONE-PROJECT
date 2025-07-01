package com.infinity.courseservice.services;

import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedRequest;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.CourseNeed;
import com.infinity.courseservice.models.Need;
import com.infinity.courseservice.repositories.CourseNeedRepository;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.NeedRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NeedService {

    private final CourseRepository courseRepository;
    private final NeedRepository needRepository;
    private final CourseNeedRepository courseNeedRepository;

    public NeedDto addNeed(NeedRequest request, Long courseId) {
        Course course = courseRepository.findById(courseId)
                        .orElseThrow(() -> new NotFoundException("No course with id " + courseId));
        if (courseNeedRepository.existsByCourseAndYearAndSemester(course, request.year(), request.semester())) {
                throw new BadRequestException("Need already exists for course that year and semester");
        }
        Need need = new Need(request.description(), request.requiredGradingHours(),
                request.numHoursCurrentlyAllocated());
        need = needRepository.save(need);

        CourseNeed courseNeed = new CourseNeed(course, need, request.year(), request.semester());
        courseNeedRepository.save(courseNeed);
        return new NeedDto(need.getId(), courseId, need.getDescription(), need.getRequiredGradingHours(),
                need.getNumHoursCurrentlyAllocated(), request.year(), request.semester());
    }

    public NeedDto getNeed(Long courseId, Integer year, String semester) {
            CourseNeed courseNeed = courseNeedRepository.findByCourseIdAndYearAndSemester(courseId, year, semester)
                .orElseThrow(() -> new NotFoundException("Course has no need for that year and semester"));
        return new NeedDto(courseNeed.getNeed().getId(), courseNeed.getCourse().getId(),
                         courseNeed.getNeed().getDescription(), courseNeed.getNeed().getRequiredGradingHours(),
                courseNeed.getNeed().getNumHoursCurrentlyAllocated(), courseNeed.getYear(), courseNeed.getSemester());
    }

    public NeedDto updateNeed(NeedRequest request, Long courseId, Integer year, String semester) {
        CourseNeed courseNeed = courseNeedRepository.findByCourseIdAndYearAndSemester(courseId, year, semester)
                        .orElseThrow(() -> new NotFoundException("Course has no need for that year and semester"));
        
        courseNeed.getNeed().setDescription(request.description());
        courseNeed.getNeed().setRequiredGradingHours(request.requiredGradingHours());
        courseNeed.getNeed().setNumHoursCurrentlyAllocated(request.numHoursCurrentlyAllocated());
        courseNeed.setYear(request.year());
        courseNeed.setSemester(request.semester());

        needRepository.save(courseNeed.getNeed());
        courseNeedRepository.save(courseNeed);
        return new NeedDto(courseNeed.getNeed().getId(), courseNeed.getCourse().getId(),
                        courseNeed.getNeed().getDescription(), courseNeed.getNeed().getRequiredGradingHours(),
        courseNeed.getNeed().getNumHoursCurrentlyAllocated(), courseNeed.getYear(), courseNeed.getSemester());
    }

    public String deleteNeed(Long courseId, Integer year, String semester) {
            CourseNeed courseNeed = courseNeedRepository
                        .findByCourseIdAndYearAndSemester(courseId, year, semester)
                        .orElseThrow(() -> new NotFoundException("Course has no need for that year and semester"));
        needRepository.delete(courseNeed.getNeed());
        return "Need deleted";
    }

}
