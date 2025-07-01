package com.infinity.userservice.config;

import java.util.Arrays;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.models.Role;
import com.infinity.userservice.repositories.RoleRepository;

import lombok.RequiredArgsConstructor;

@Order(1)
@Component
@RequiredArgsConstructor
public class RoleSeeder {

    private final RoleRepository roleRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void seedRolesIfMissing() {
        Arrays.stream(UserRole.values()).forEach(roleEnum -> {
            boolean exists = roleRepository.findByName(roleEnum).isPresent();
            if (!exists) {
                Role role = new Role();
                role.setName(roleEnum);
                roleRepository.save(role);
                System.out.println("Seeded role: " + roleEnum);
            }
        });
    }
}
