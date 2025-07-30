package com.infinity.courseservice.services;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.infinity.courseservice.dtos.Semesters.SemesterDto;
import com.infinity.courseservice.enums.ActionOptions;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.DuplicateEntryException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.repositories.SemesterRepository;
import com.infinity.courseservice.utility.SemesterMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SemesterService {

    private final SemesterRepository semesterRepository;
    private final SemesterMapper semesterMapper;
    private final AuditService auditService;

    public SemesterDto getSemesterById(Long id) {
        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No semester with id " + id));

        return semesterMapper.toDto(semester);
    }
    
    public List<SemesterDto> getAllSemesters() {
        List<Semester> semesters = semesterRepository.findAll();
        return semesters.stream()
            .map(semesterMapper::toDto)
            .toList();
    }

    public SemesterDto addSemester(SemesterDto request, Long userIdFromHeader) {
        validateSemester(request);
        Semester semester = semesterMapper.toSemester(request);
        try{
            semester = semesterRepository.save(semester);
            auditService.record(
                userIdFromHeader,
                ActionOptions.CREATE,
                "Semester",   
                null,               
                semester,           
                semester.getId()   
            );
        } catch(DataIntegrityViolationException e){
                throw new DuplicateEntryException("Duplicate semester");
            }
        return semesterMapper.toDto(semester);
    }

    public SemesterDto updateSemester(Long id, SemesterDto request, Long userIdFromHeader) {
        validateSemester(request);
        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No semester with id " + id));
                
        Semester before = new Semester(semester);
        semester.setYear(request.year());
        semester.setSemester(request.semester());
        semester.setStartDate(request.startDate());
        semester.setEndDate(request.endDate());
        try {
            semester = semesterRepository.save(semester);
            auditService.record(
                userIdFromHeader,
                ActionOptions.UPDATE,
                "Semester",   
                before,               
                semester,           
                semester.getId()   
            );
        } catch (DataIntegrityViolationException e) {
            throw new DuplicateEntryException("Duplicate semester");
        }
        return semesterMapper.toDto(semester);
    }

    public String deleteSemester(Long id, Long userIdFromHeader) {
        Semester toDelete = semesterRepository
            .findById(id)
            .orElseThrow(() -> new NotFoundException(
               "No semester with id " + id));
        semesterRepository.delete(toDelete);

        auditService.record(
            userIdFromHeader,
            ActionOptions.DELETE,
            "Semester",   
            toDelete,               
            null,           
            toDelete.getId()   
        );

        return "Semester deleted";
    }

    private void validateSemester(SemesterDto request) {
        if (request.startDate() != null && request.endDate() != null &&
                request.startDate().isAfter(request.endDate())) {
            throw new BadRequestException("Start date must be before end date");
        }

        if (request.startDate() != null && request.year() != null &&
                request.startDate().getYear() != request.year()) {
            throw new BadRequestException("Year must match the start date's year");
        }
    }

}
