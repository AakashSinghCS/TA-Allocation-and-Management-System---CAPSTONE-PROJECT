package com.infinity.userservice.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.models.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(UserRole name);
}
