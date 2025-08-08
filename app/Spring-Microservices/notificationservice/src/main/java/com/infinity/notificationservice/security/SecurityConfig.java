package com.infinity.notificationservice.security;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    UserDetailsService prometheusUser(PasswordEncoder encoder) {
        UserDetails u = User.withUsername("prometheus")
                            .password(encoder.encode("prompass"))
                            .roles("ADMIN")
                            .build();
        return new InMemoryUserDetailsManager(u);
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean @Order(1)
    SecurityFilterChain actuatorChain(HttpSecurity http,@Qualifier("prometheusUser") UserDetailsService prometheusUser) throws Exception {

        AuthenticationManagerBuilder authBuilder =
        http.getSharedObject(AuthenticationManagerBuilder.class);
    
        authBuilder
        .userDetailsService(prometheusUser)
        .passwordEncoder(passwordEncoder());
        
        AuthenticationManager authManager = authBuilder.build();

        http
          .securityMatcher("/actuator/**")
          .authenticationManager(authManager)
          .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health", "/actuator/info").permitAll()
            .anyRequest().hasRole("ADMIN")
          )
          .httpBasic(Customizer.withDefaults())
          .csrf(csrf -> csrf.disable());
        return http.build();
    }

    @Bean
    @Order(2)
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**").permitAll()
                        .requestMatchers("/private/**").authenticated()
                        .anyRequest()
                        .denyAll())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
