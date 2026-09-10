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
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
            // Disable CSRF for REST API
            .csrf(csrf -> csrf.disable())

            // Enable CORS
            .cors(cors -> {})

            // JWT based authentication
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

                // Anyone can view jobs
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/jobs",
                    "/api/jobs/open",
                    "/api/jobs/*",
                    "/api/jobs/recommended/**"
                ).permitAll()

                // CORS preflight
                .requestMatchers(
                    HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()


                // ================= RECRUITER ONLY =================

                // Create job
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/jobs"
                ).hasRole("RECRUITER")

                // Delete job
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/jobs/**"
                ).hasRole("RECRUITER")

                // Recruiter analytics
                .requestMatchers(
                    "/api/recruiter/**"
                ).hasRole("RECRUITER")


                // ================= AUTHENTICATED USERS =================

                // Candidate profile/resume etc.
                .requestMatchers(
                    "/api/candidate/**"
                ).authenticated()

                // Interview APIs
                .requestMatchers(
                    "/api/interviews/**"
                ).authenticated()

                // Applications temporarily remain public
                // because their ownership checks will be added next
                .requestMatchers(
    "/api/applications/**"
).authenticated()

.requestMatchers(
    "/api/notifications/**"
).authenticated()

                // Everything else requires login
                .anyRequest().authenticated()
            )

            // JWT filter
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}