package com.infinity.userservice.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.infinity.userservice.dtos.Registration.RegisterRequest;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.repositories.UserRepository;
import com.infinity.userservice.services.UserService;

import lombok.RequiredArgsConstructor;

@Order(2)
@Component
@RequiredArgsConstructor
public class UserSeeder {

    private final UserService userService;
    private final UserRepository userRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void seedUsers() {
        if (userRepository.count() == 0) {
            try{
            RegisterRequest studentRequest = new RegisterRequest("student@test.com", "Scoobert", "Doobert", "P@ssword1",
                    UserRole.STUDENT, false);
            userService.register(studentRequest);
            RegisterRequest coordinatorRequest = new RegisterRequest("coordinator@test.com", "Ched", "Devis",
                    "P@ssword1",
                    UserRole.COORDINATOR, true);
            userService.register(coordinatorRequest);
            RegisterRequest instructorRequest = new RegisterRequest("instructor@test.com", "Scawt", "Fawz", "P@ssword1",
                    UserRole.INSTRUCTOR, false);
            userService.register(instructorRequest);
        } catch (Exception e) {
            System.err.println("User seed error: " + e.getMessage());
          }
        }
    }
}
