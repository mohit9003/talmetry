package Talmetry.Backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> {})

            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            .authorizeHttpRequests(auth -> auth

                // ================= PUBLIC =================

                .requestMatchers(
                        "/api/auth/register",
                        "/api/auth/login"
                ).permitAll()

                .requestMatchers(
                        HttpMethod.OPTIONS,
                        "/**"
                ).permitAll()

                // ================= JOBS =================

                .requestMatchers(
                        "/api/jobs/recruiter/**"
                ).hasRole("RECRUITER")

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/jobs"
                ).hasRole("RECRUITER")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/jobs/**"
                ).hasRole("RECRUITER")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/jobs/**"
                ).hasRole("RECRUITER")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/jobs",
                        "/api/jobs/open",
                        "/api/jobs/*",
                        "/api/jobs/recommended/**"
                ).permitAll()

                // ================= CANDIDATE =================

                .requestMatchers(
                        "/api/candidate/**"
                ).authenticated()

                // ================= APPLICATIONS =================

                .requestMatchers(
                        "/api/applications/**"
                ).authenticated()

                // ================= INTERVIEWS =================

                .requestMatchers(
                        "/api/interviews/**"
                ).authenticated()

                // ================= NOTIFICATIONS =================

                .requestMatchers(
                        "/api/notifications/**"
                ).authenticated()

                // ================= RECRUITER =================

                .requestMatchers(
                        "/api/recruiter/**"
                ).hasRole("RECRUITER")

                // ================= EVERYTHING ELSE =================

                .anyRequest().authenticated()
            )

            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}