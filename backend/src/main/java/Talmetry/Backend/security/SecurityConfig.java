package Talmetry.Backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CorsConfigurationSource corsConfigurationSource
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
            // ================= CORS =================

            .cors(cors ->
                    cors.configurationSource(corsConfigurationSource)
            )

            // ================= CSRF =================

            .csrf(csrf ->
                    csrf.disable()
            )

            // ================= SESSION =================

            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            // ================= AUTHORIZATION =================

            .authorizeHttpRequests(auth -> auth

                // ================= PUBLIC AUTH =================

                .requestMatchers(
                        "/api/auth/**"
                ).permitAll()

                // ================= PUBLIC OPTIONS =================

                .requestMatchers(
                        HttpMethod.OPTIONS,
                        "/**"
                ).permitAll()

                // ================= PUBLIC JOB GET =================

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/jobs",
                        "/api/jobs/open",
                        "/api/jobs/*",
                        "/api/jobs/recommended/**"
                ).permitAll()

                // ================= RECRUITER JOBS =================

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

            // ================= JWT FILTER =================

            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}