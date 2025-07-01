package com.infinity.userservice.models;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@Entity
@DiscriminatorValue("STUDENT")
public class Student extends User {

    @Column(unique = true)
    private Integer studentNum;

    private String program;

    private Integer enrollmentYear;

    private Integer schoolYear;

    public Student(String email, String firstName, String lastName, String password) {
        super(email, firstName, lastName, password);
    }

    public Student(
            String email,
            String firstName,
            String lastName,
            String password,
            Integer studentNum,
            String program,
            Integer enrollmentYear,
            Integer schoolYear) {
        super(email, firstName, lastName, password);
        this.studentNum = studentNum;
        this.program = program;
        this.enrollmentYear = enrollmentYear;
        this.schoolYear = schoolYear;
    }

}
