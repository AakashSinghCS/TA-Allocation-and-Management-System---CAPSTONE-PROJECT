package com.infinity.userservice.repositories;

import java.util.List;
import java.util.Optional;

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

    List<User> findByRoles_NameAndStudentNum(UserRole role, Integer studentNum);

    List<User> findByRoles_NameAndEmployeeNum(UserRole role, Integer employeeNum);
    
    @Query("SELECT u FROM User u WHERE :role MEMBER OF u.roles AND (LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%')))")
    List<User> findByRoles_NameAndNameContaining(@Param("role") UserRole role, @Param("name") String name);

    Optional<User> findByStudentNum(Integer studentNum);

    @Query("""
            SELECT u FROM User u
            JOIN u.roles r
            WHERE r.name = :role
              AND (LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%'))
                   OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%')))
            """)
    List<User> findByRoleAndName(@Param("role") UserRole role, @Param("name") String name);

        @Modifying
        @Query("UPDATE User u SET u.active = true WHERE u.id = :userId")
        void activateUser(@Param("userId") Long userId);

        @Modifying
        @Query("UPDATE User u SET u.active = false WHERE u.id = :userId")
        void deactivateUser(@Param("userId") Long userId);

        List<User> findByActiveTrue();
        List<User> findByActiveFalse();

}
