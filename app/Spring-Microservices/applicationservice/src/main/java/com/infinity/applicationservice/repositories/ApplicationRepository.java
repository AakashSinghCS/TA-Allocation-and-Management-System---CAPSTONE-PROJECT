package com.infinity.applicationservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infinity.applicationservice.enums.Subject;
import com.infinity.applicationservice.models.Application;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

        void deleteByStudentIdAndYearAndSemester(Long studentId, Integer year, String semester);

        boolean existsByStudentIdAndYearAndSemester(Long studentId, Integer year, String semester);

        Optional<Application> findByStudentIdAndYearAndSemester(Long studentId, Integer year, String semester);

        Optional<List<Application>> findAllByStudentId(Long studentId);

        @Query("""
                            SELECT a FROM Application a
                            WHERE (:year IS NULL OR a.year = :year)
                                AND (:semester IS NULL OR a.semester = :semester)
                                AND (:wantRemote IS NULL OR a.wantRemote = :wantRemote)
                                AND (:hours IS NULL OR a.wantWorkingHours = :hours)
                                AND (:preference1 IS NULL OR a.subjectPreference1 = :preference1 OR a.subjectPreference2 = :preference1 OR a.subjectPreference3 = :preference1)
                                AND (:preference2 IS NULL OR a.subjectPreference1 = :preference2 OR a.subjectPreference2 = :preference2 OR a.subjectPreference3 = :preference2)
                                AND (:preference3 IS NULL OR a.subjectPreference1 = :preference3 OR a.subjectPreference2 = :preference3 OR a.subjectPreference3 = :preference3)
                        """)
        List<Application> findByFilters(
                        @Param("year") Integer year,
                        @Param("semester") String semester,
                        @Param("wantRemote") Boolean wantRemote,
                        @Param("hours") Integer hours,
                        @Param("preference1") Subject preference1,
                        @Param("preference2") Subject preference2,
                        @Param("preference3") Subject preference3);

}
