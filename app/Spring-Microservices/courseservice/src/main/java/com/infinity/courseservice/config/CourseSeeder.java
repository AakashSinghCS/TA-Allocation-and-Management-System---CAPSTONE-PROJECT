package com.infinity.courseservice.config;

import java.time.LocalTime;
import java.util.List;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.SectionSchedule;
import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.SemesterRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@Order(2)
public class CourseSeeder implements ApplicationListener<ApplicationReadyEvent>{

    private final CourseRepository courseRepository;
    private final SemesterRepository semesterRepository;

    @Override
    public void onApplicationEvent(@NonNull ApplicationReadyEvent event) {
        List<Semester> semesters = semesterRepository.findByIsActiveOrderByStartDateAsc(true);
        if (semesters.isEmpty()) {
            System.out.println("No semester found; skipping seeding.");
            return;
        }

        if (courseRepository.count() > 0)
            return;

        Course cosc = new Course("COSC", "Capstone", "499");
        Course phys = new Course("PHYS", "Introduction to Physics", "111");
        Course math = new Course("MATH", "Calculus I", "100");

        Section coscLecture = new Section(semesters.get(0), "001", SectionType.LECTURE, cosc, 3L);
        coscLecture.setSectionSchedules(List.of(
                new SectionSchedule("MONDAY", LocalTime.of(9, 0), LocalTime.of(10, 30), coscLecture),
                new SectionSchedule("WEDNESDAY", LocalTime.of(9, 0), LocalTime.of(10, 30), coscLecture)));

        Section coscLab = new Section(semesters.get(0), "L01", SectionType.LABORATORY, cosc, 3L);
        coscLab.setSectionSchedules(List.of(
                new SectionSchedule("FRIDAY", LocalTime.of(14, 0), LocalTime.of(16, 0), coscLab)));

        cosc.setSections(List.of(coscLecture, coscLab));

        Section physLecture = new Section(semesters.get(0), "001", SectionType.LECTURE, phys, 3L);
        physLecture.setSectionSchedules(List.of(
                new SectionSchedule("TUESDAY", LocalTime.of(11, 0), LocalTime.of(12, 30), physLecture),
                new SectionSchedule("THURSDAY", LocalTime.of(11, 0), LocalTime.of(12, 30), physLecture)));

        Section physLab = new Section(semesters.get(0), "L01", SectionType.LABORATORY, phys, 3L);
        physLab.setSectionSchedules(List.of(
                new SectionSchedule("WEDNESDAY", LocalTime.of(13, 0), LocalTime.of(15, 0), physLab)));

        phys.setSections(List.of(physLecture, physLab));

        Section mathLecture = new Section(semesters.get(1), "001", SectionType.LECTURE, math, 3L);
        mathLecture.setSectionSchedules(List.of(
                new SectionSchedule("MONDAY", LocalTime.of(13, 0), LocalTime.of(14, 30), mathLecture),
                new SectionSchedule("WEDNESDAY", LocalTime.of(13, 0), LocalTime.of(14, 30), mathLecture)));

        Section mathLab = new Section(semesters.get(1), "L01", SectionType.LABORATORY, math, 3L);
        mathLab.setSectionSchedules(List.of(
                new SectionSchedule("FRIDAY", LocalTime.of(10, 0), LocalTime.of(12, 0), mathLab)));

        math.setSections(List.of(mathLecture, mathLab));

        courseRepository.saveAll(List.of(cosc, phys, math));
        System.out.println("Seeded sample courses and sections.");
    }
}
