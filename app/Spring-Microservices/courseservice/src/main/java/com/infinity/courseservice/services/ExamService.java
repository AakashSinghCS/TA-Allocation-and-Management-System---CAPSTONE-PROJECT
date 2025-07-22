package com.infinity.courseservice.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infinity.courseservice.dtos.ExamDtos.ExamAssignmentDto;
import com.infinity.courseservice.dtos.ExamDtos.ExamAvailabilityDto;
import com.infinity.courseservice.dtos.ExamDtos.ExamDto;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.models.Exam;
import com.infinity.courseservice.models.ExamAssignment;
import com.infinity.courseservice.models.ExamAvailability;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.repositories.ExamAssignmentRepository;
import com.infinity.courseservice.repositories.ExamAvailabilityRepository;
import com.infinity.courseservice.repositories.ExamRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.utility.ExamMapper;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class ExamService {
    private final ExamRepository examRepository;
    private final ExamAvailabilityRepository availabilityRepository;
    private final ExamAssignmentRepository assignmentRepository;
    private final SectionRepository sectionRepository;
    private final ExamMapper examMapper;


    // --- Exam CRUD ---

    public ExamDto createExam(ExamDto dto) {
        try {
            Exam exam = new Exam();
            Section section = sectionRepository.findById(dto.sectionId())
                    .orElseThrow(() -> new NotFoundException("Section not found"));

            boolean exists = examRepository.findAll().stream().anyMatch(e ->
                e.getSectionId().equals(section.getId()) &&
                e.getDate().equals(dto.date()) &&
                e.getStartTime().equals(dto.startTime()) &&
                e.getEndTime().equals(dto.endTime())
            );
            if (exists) {
                throw new BadRequestException("Duplicate exam entry exists for this section, date, and time.");
            }

            exam.setSectionId(section.getId());
            exam.setDate(dto.date());
            exam.setStartTime(dto.startTime());
            exam.setEndTime(dto.endTime());
            Exam saved = examRepository.save(exam);

            return examMapper.mapExam(saved);
        } catch (NotFoundException | BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to create exam: " + e.getMessage());
        }
    }

    public ExamDto updateExam(Long id, ExamDto dto) {
        try {
            Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Exam not found"));
            exam.setDate(dto.date());
            exam.setStartTime(dto.startTime());
            exam.setEndTime(dto.endTime());
            Exam saved = examRepository.save(exam);
            return examMapper.mapExam(saved);
        } catch (NotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to update exam: " + e.getMessage());
        }
    }

    public void deleteExam(Long id) {
        try {
            if (!examRepository.existsById(id)) {
                throw new NotFoundException("Exam not found");
            }
            examRepository.deleteById(id);
        } catch (NotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to delete exam: " + e.getMessage());
        }
    }

    public List<ExamDto> getAllExams() {
        try {
            return examRepository.findAll().stream()
                    .map(examMapper::mapExam)
                    .toList();
        } catch (Exception e) {
            throw new BadRequestException("Failed to fetch exams: " + e.getMessage());
        }
    }

    public ExamDto getExamById(Long id) {
        try {
            Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Exam not found"));
            return examMapper.mapExam(exam);
        } catch (NotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to fetch exam: " + e.getMessage());
        }
    }

    

    // --- Availability ---

    public List<ExamAvailabilityDto> updateStudentAvailability(Long studentId, List<ExamAvailabilityDto> availabilities) {
        availabilityRepository.deleteByStudentId(studentId);
        List<ExamAvailability> entities = availabilities.stream()
                .map(dto -> {
                    ExamAvailability a = new ExamAvailability();
                    a.setStudentId(studentId);
                    a.setDate(dto.date());
                    a.setStartTime(dto.startTime());
                    a.setEndTime(dto.endTime());
                    return a;
                })
                .toList();
        availabilityRepository.saveAll(entities);
        return entities.stream()
                .map(a -> new ExamAvailabilityDto(
                        a.getId(),
                        a.getStudentId(),
                        a.getDate(),
                        a.getStartTime(),
                        a.getEndTime()
                ))
                .toList();
    }

    public List<ExamAvailabilityDto> getAvailabilityByStudentId(Long studentId) {
        return availabilityRepository.findByStudentId(studentId).stream()
                .map(a -> new ExamAvailabilityDto(
                        a.getId(),
                        a.getStudentId(),
                        a.getDate(),
                        a.getStartTime(),
                        a.getEndTime()
                ))
                .toList();
    }

    @Transactional
    public void deleteAvailabilityByStudentId(Long studentId) {
        availabilityRepository.deleteByStudentId(studentId);
    }


    // --- Assignments ---

    public ExamAssignmentDto assignStudentToExam(Long examId, ExamAssignmentDto dto) {
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new NotFoundException("Exam not found"));

        ExamAssignment assignment = new ExamAssignment();
        assignment.setExam(exam);
        assignment.setStudentId(dto.studentId());
        assignment.setTask(dto.task());
        assignment.setDate(dto.date());
        assignment.setStartTime(dto.startTime());
        assignment.setEndTime(dto.endTime());

        ExamAssignment saved = assignmentRepository.save(assignment);
        return examMapper.mapAssignment(saved);
    }

    public List<ExamAssignmentDto> getAssignmentsByStudentId(Long studentId) {
        return assignmentRepository.findByStudentId(studentId).stream()
                .map(examMapper::mapAssignment)
                .toList();
    }

    
}
