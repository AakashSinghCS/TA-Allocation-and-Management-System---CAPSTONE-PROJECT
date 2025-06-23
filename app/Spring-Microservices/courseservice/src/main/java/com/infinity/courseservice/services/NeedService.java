package com.infinity.courseservice.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.NeedDto;
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

    public NeedDto addNeed(NeedDto request, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("No course with id " + courseId));
        Need need = new Need(request.description(), request.requiredGradingHours(),
                request.numHoursCurrentlyAllocated());
        need = needRepository.save(need);

        CourseNeed courseNeed = new CourseNeed(course, need, request.year(), request.semester());
        courseNeedRepository.save(courseNeed);
        return request;
    }

    public NeedDto updateNeed(NeedDto request, Long requesterId, List<String> roles) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'updateNeed'");
    }

}
