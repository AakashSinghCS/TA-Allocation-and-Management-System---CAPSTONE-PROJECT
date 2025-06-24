package com.infinity.courseservice.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedRequest;
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
        Need need = new Need(request.description(), request.requiredGradingHours(),
                request.numHoursCurrentlyAllocated());
        need = needRepository.save(need);

        CourseNeed courseNeed = new CourseNeed(course, need, request.year(), request.semester());
        courseNeedRepository.save(courseNeed);
        return new NeedDto(need.getId(), need.getDescription(), need.getRequiredGradingHours(),
                need.getNumHoursCurrentlyAllocated());
    }

    public NeedDto getNeed(Long needId) {
        Need need = needRepository.findById(needId)
                .orElseThrow(() -> new NotFoundException("No need with id " + needId));
        return new NeedDto(need.getId(), need.getDescription(), need.getRequiredGradingHours(),
                need.getNumHoursCurrentlyAllocated());
    }

    public NeedDto updateNeed(NeedRequest request, Long needId) {
        Need need = needRepository.findById(needId)
                .orElseThrow(() -> new NotFoundException("No need with id " + needId));
        need.setDescription(request.description());
        need.setRequiredGradingHours(request.requiredGradingHours());
        need.setNumHoursCurrentlyAllocated(request.numHoursCurrentlyAllocated());

        needRepository.save(need);
        return new NeedDto(need.getId(), need.getDescription(), need.getRequiredGradingHours(),
                need.getNumHoursCurrentlyAllocated());
    }

    public String deleteNeed(Long needId) {
        if (!needRepository.existsById(needId)) {
            throw new NotFoundException("No need with id " + needId);
        }
        needRepository.deleteById(needId);
        return "Need deleted";
    }

    public List<NeedDto> getAllNeedsByCourseId(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new NotFoundException("No course with id " + courseId);
        }
        List<CourseNeed> courseNeeds = courseNeedRepository.findByCourseId(courseId);
        
        return courseNeeds.stream()
                .map(cn -> new NeedDto(
                        cn.getNeed().getId(),
                        cn.getNeed().getDescription(),
                        cn.getNeed().getRequiredGradingHours(),
                        cn.getNeed().getNumHoursCurrentlyAllocated()))
                .toList();
    }

}
