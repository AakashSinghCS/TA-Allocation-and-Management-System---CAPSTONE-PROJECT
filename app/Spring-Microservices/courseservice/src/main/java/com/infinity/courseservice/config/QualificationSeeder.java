package com.infinity.courseservice.config;

import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Qualification;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.QualificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Order(3)
public class QualificationSeeder implements ApplicationListener<ApplicationReadyEvent> {

    private final QualificationRepository qualificationRepository;
    private final CourseRepository courseRepository;

    @Override
    public void onApplicationEvent(@NonNull ApplicationReadyEvent event) {
        if (qualificationRepository.count() > 0)
            return;

        List<Course> courses = courseRepository.findAll();

        for (Course course : courses) {
            for (int i = 1; i <= 3; i++) {
                Qualification qualification = new Qualification(
                        course,
                        "Qualification " + i + " for " + course.getDeptCode(),
                        course.getDeptCode());
                qualificationRepository.save(qualification);
            }
        }

        System.out.println("Seeded qualifications for " + courses.size() + " courses.");
    }
}
