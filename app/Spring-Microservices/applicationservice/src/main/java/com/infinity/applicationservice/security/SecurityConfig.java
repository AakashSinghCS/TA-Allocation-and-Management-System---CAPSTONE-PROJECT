package com.infinity.applicationservice.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
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

//     @Bean @Order(1)
//   SecurityFilterChain grafanaChain(HttpSecurity http) throws Exception {
//       http
//         .securityMatcher("/grafana/**")
//         .authorizeHttpRequests(a -> a
//             .anyRequest().hasRole("ADMIN")
//         )
//         .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
//         .csrf(csrf -> csrf.disable());
//       return http.build();
//   }

        
    @Bean @Order(1)
    SecurityFilterChain actuatorChain(HttpSecurity http) throws Exception {
        http
          .securityMatcher("/actuator/**")
          .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health", "/actuator/info").permitAll()
            .anyRequest().hasRole("ADMIN")
          )
          .httpBasic(Customizer.withDefaults())
          .csrf(csrf -> csrf.disable());
        return http.build();
    }

    @Bean @Order(2)
    SecurityFilterChain apiChain(HttpSecurity http) throws Exception {
        http
          .csrf(csrf -> csrf.disable())
          .authorizeHttpRequests(auth -> auth
            .anyRequest().authenticated()
          )
          .addFilterBefore(jwtAuthenticationFilter,
                           UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    UserDetailsService prometheusUser(PasswordEncoder encoder) {
        return new InMemoryUserDetailsManager(
          User.withUsername("prometheus")
              .password(encoder.encode("prompass"))
              .roles("ADMIN")
              .build()
        );
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
