package com.infinity.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Applications.ApplicationWithStudentDto;
import com.infinity.applicationservice.dtos.Applications.AvailabilityDto;
import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.enums.ApplicationType;
import com.infinity.applicationservice.enums.Day;
import com.infinity.applicationservice.enums.Subject;
import com.infinity.applicationservice.enums.UserRole;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.models.Availability;
import com.infinity.applicationservice.utility.ApplicationMapper;

@ExtendWith(MockitoExtension.class)
public class ApplicationMapperTest {

    private final ApplicationMapper mapper = new ApplicationMapper();

    @Test
    void testToDto() {
        Application app = new Application();
        app.setId(1L);
        app.setStudentId(2L);
        app.setSubjectPreference1(Subject.COSC);
        app.setSubjectPreference2(Subject.MATH);
        app.setSubjectPreference3(null);
        app.setApplicationType(ApplicationType.UNDERGRADUATE);
        app.setWantRemote(true);
        app.setWantWorkingHours(10);
        app.setSubmittedAt(LocalDateTime.now());

        Availability availability = new Availability();
        availability.setDay(Day.MONDAY);
        availability.setStartTime(LocalTime.of(9, 0));
        availability.setEndTime(LocalTime.of(11, 0));
        app.setAvailabilities(Set.of(availability));

        ApplicationDto dto = mapper.toDto(app);

        assertEquals(app.getId(), dto.applicationId());
        assertEquals(app.getStudentId(), dto.studentId());
        assertEquals(List.of(Subject.COSC, Subject.MATH), dto.preferences());
        assertEquals(app.getApplicationType(), dto.applicationType());
        assertEquals(app.isWantRemote(), dto.wantRemote());
        assertEquals(app.getWantWorkingHours(), dto.wantWorkingHours());
        assertEquals(app.getSubmittedAt(), dto.timeSubmitted());

        AvailabilityDto availabilityDto = dto.availabilities().iterator().next();
        assertEquals(Day.MONDAY, availabilityDto.day());
        assertEquals("09:00", availabilityDto.startTime());
        assertEquals("11:00", availabilityDto.endTime());
    }

    @Test
    void testToDtoWithStudent() {
        UserDto student = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT),
                                12345678, "COSC", 2025, 3, null, null, null, true);

        Application app = new Application();
        app.setId(1L);
        app.setStudentId(2L);
        app.setSubjectPreference1(Subject.DATA);
        app.setSubjectPreference2(null);
        app.setSubjectPreference3(null);
        app.setApplicationType(ApplicationType.UNDERGRADUATE);
        app.setWantRemote(false);
        app.setWantWorkingHours(8);
        app.setSubmittedAt(LocalDateTime.now());

        Availability availability = new Availability();
        availability.setDay(Day.TUESDAY);
        availability.setStartTime(LocalTime.of(13, 0));
        availability.setEndTime(LocalTime.of(15, 0));
        app.setAvailabilities(Set.of(availability));

        ApplicationWithStudentDto dto = mapper.toDtoWithStudent(app, student);

        assertEquals(app.getId(), dto.applicationId());
        assertEquals(student, dto.student());
        assertEquals(List.of(Subject.DATA), dto.preferences());
        assertEquals(ApplicationType.UNDERGRADUATE, dto.applicationType());
        assertFalse(dto.wantRemote());
        assertEquals(8, dto.wantWorkingHours());
        assertEquals(app.getSubmittedAt(), dto.timeSubmitted());

        AvailabilityDto dtoAvailability = dto.availabilities().iterator().next();
        assertEquals(Day.TUESDAY, dtoAvailability.day());
        assertEquals("13:00", dtoAvailability.startTime());
        assertEquals("15:00", dtoAvailability.endTime());
    }
}
