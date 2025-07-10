package com.infinity.userservice.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
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

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
// import jakarta.inject.Qualifier;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
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

    @Bean
    @Order(1)                                     // must run before the “catch-all” chain
    SecurityFilterChain actuatorChain(HttpSecurity http, @Qualifier("prometheusUser") UserDetailsService prometheusUser) throws Exception {
        AuthenticationManager authManager = http
          .getSharedObject(AuthenticationManagerBuilder.class)
          .userDetailsService(prometheusUser)
          .passwordEncoder(passwordEncoder())
          .and()
          .build();

        http
            .securityMatcher("/actuator/**")      // only /actuator/…
            .authenticationManager(authManager)
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                    .anyRequest().hasRole("ADMIN"))
            .httpBasic(Customizer.withDefaults())            // Prometheus will use this
            .csrf(csrf -> csrf.disable());

        return http.build();
    }

    @Bean
    @Order(2)
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        AuthenticationManager apiAuthManager = http
            .getSharedObject(AuthenticationManagerBuilder.class)
            .userDetailsService(userDetailsService)
            .passwordEncoder(passwordEncoder())
            .and()
            .build();

        return http
                .authenticationManager(apiAuthManager)
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    // @Autowired
    // public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
    //     auth
    //     .userDetailsService(userDetailsService)
    //     .passwordEncoder(passwordEncoder());
    // }

    // @Bean
    // AuthenticationManager authenticationManager(
    //         AuthenticationConfiguration config) throws Exception {
    //     return config.getAuthenticationManager();
    // }
}