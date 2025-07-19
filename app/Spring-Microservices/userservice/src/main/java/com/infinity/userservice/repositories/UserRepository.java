package com.infinity.userservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.models.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByFirstNameIgnoreCaseContainingOrLastNameIgnoreCaseContaining(String firstName, String lastName);

    List<User> findByRoles_Name(UserRole name);

    // List<User> findByRoles_NameAndStudentNum(UserRole role, Integer studentNum);

    // List<User> findByRoles_NameAndEmployeeNum(UserRole role, Integer
    // employeeNum);

    // @Query("SELECT u FROM User u WHERE :role MEMBER OF u.roles AND
    // (LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(u.lastName)
    // LIKE LOWER(CONCAT('%', :name, '%')))")
    // List<User> findByRoles_NameAndNameContaining(@Param("role") UserRole role,
    // @Param("name") String name);

    Optional<User> findByStudentNum(Integer studentNum);

    // @Query("""
    // SELECT u FROM User u
    // JOIN u.roles r
    // WHERE r.name = :role
    // AND (LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%'))
    // OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%')))
    // """)
    // List<User> findByRoleAndName(@Param("role") UserRole role, @Param("name")
    // String name);

    List<User> findByRoles_NameAndFirstNameContainingIgnoreCaseAndLastNameContainingIgnoreCase(
            UserRole role,
            String firstname,
            String lastname);

    // 2) Look up by employeeNum column
    Optional<User> findByEmployeeNum(Integer employeeNum);

    @Modifying
    @Query("UPDATE User u SET u.active = true WHERE u.id = :userId")
    void activateUser(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE User u SET u.active = false WHERE u.id = :userId")
    void deactivateUser(@Param("userId") Long userId);

    List<User> findByActiveTrue();

    List<User> findByActiveFalse();

    Page<User> findByRoles_NameAndFirstNameContainingIgnoreCaseAndLastNameContainingIgnoreCase(
            UserRole role,
            String firstname,
            String lastname,
            Pageable pageable);

    // Page<User> findByStudentNumOrEmployeeNum(
    // Integer studentNum,
    // Integer employeeNum,
    // Pageable pageable
    // );

    Page<User> findAllById(Long id, Pageable pageable);

    @Query(value = """
              SELECT u
                FROM User u
               WHERE CAST(u.studentNum  AS string) LIKE CONCAT('%', :numStr, '%')
                  OR CAST(u.employeeNum AS string) LIKE CONCAT('%', :numStr, '%')
            """, countQuery = """
              SELECT COUNT(u)
                FROM User u
               WHERE CAST(u.studentNum  AS string) LIKE CONCAT('%', :numStr, '%')
                  OR CAST(u.employeeNum AS string) LIKE CONCAT('%', :numStr, '%')
            """)
    Page<User> findByNumContaining(
            @Param("numStr") String numStr,
            Pageable pageable);

}
