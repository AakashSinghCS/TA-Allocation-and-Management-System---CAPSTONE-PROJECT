package com.infinity.userservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infinity.userservice.models.User;

public interface UserRepository extends JpaRepository<User, Long> {
    
}
