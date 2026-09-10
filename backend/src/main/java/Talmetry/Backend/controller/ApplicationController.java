package Talmetry.Backend.controller;

import Talmetry.Backend.entity.Application;
import Talmetry.Backend.entity.User;
import Talmetry.Backend.service.ApplicationService;
import Talmetry.Backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserRepository userRepository;

    public ApplicationController(
            ApplicationService applicationService,
            UserRepository userRepository
    ) {
        this.applicationService = applicationService;
        this.userRepository = userRepository;
    }

    // ================= APPLY FOR JOB =================

    @PostMapping("/apply")
    public ResponseEntity<Application> applyForJob(
            @RequestParam Long userId,
            @RequestParam Long jobId,
            Authentication authentication
    ) {

        User loggedInUser = getLoggedInUser(authentication);

        if (!loggedInUser.getId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        Application application =
                applicationService.applyForJob(
                        loggedInUser.getId(),
                        jobId
                );

        return ResponseEntity.ok(application);
    }

    // ================= CANDIDATE APPLICATIONS =================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Application>> getUserApplications(
            @PathVariable Long userId,
            Authentication authentication
    ) {

        User loggedInUser = getLoggedInUser(authentication);

        return ResponseEntity.ok(
                applicationService.getUserApplications(
                        loggedInUser.getId(),
                        userId
                )
        );
    }

    // ================= JOB APPLICANTS =================

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Application>> getJobApplications(
            @PathVariable Long jobId,
            Authentication authentication
    ) {

        User recruiter = getLoggedInUser(authentication);

        if (recruiter.getRole() != User.Role.RECRUITER) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                applicationService.getJobApplications(
                        recruiter.getId(),
                        jobId
                )
        );
    }

    // ================= GET APPLICATION =================

    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(
            @PathVariable Long id,
            Authentication authentication
    ) {

        User loggedInUser = getLoggedInUser(authentication);

        return ResponseEntity.ok(
                applicationService.getApplicationById(
                        loggedInUser.getId(),
                        id
                )
        );
    }

    // ================= UPDATE STATUS =================

    @PutMapping("/{id}/status")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication
    ) {

        User recruiter = getLoggedInUser(authentication);

        if (recruiter.getRole() != User.Role.RECRUITER) {
            return ResponseEntity.status(403).build();
        }

        Application application =
                applicationService.updateApplicationStatus(
                        recruiter.getId(),
                        id,
                        status
                );

        return ResponseEntity.ok(application);
    }

    // ================= HELPER =================

    private User getLoggedInUser(
            Authentication authentication
    ) {

        if (authentication == null ||
                authentication.getName() == null) {

            throw new RuntimeException(
                    "Authentication required"
            );
        }

        return userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        )
                );
    }
}