package Talmetry.Backend.controller;

import Talmetry.Backend.entity.Job;
import Talmetry.Backend.entity.User;
import Talmetry.Backend.repository.UserRepository;
import Talmetry.Backend.service.JobService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JobController {

    private final JobService jobService;
    private final UserRepository userRepository;

    public JobController(
            JobService jobService,
            UserRepository userRepository
    ) {
        this.jobService = jobService;
        this.userRepository = userRepository;
    }

    // ================= CREATE JOB =================

    @PostMapping
    public ResponseEntity<Job> createJob(
            @RequestParam Long recruiterId,
            @RequestBody Job job,
            Authentication authentication
    ) {

        User recruiter = getLoggedInUser(authentication);

        if (recruiter.getRole() != User.Role.RECRUITER) {
            return ResponseEntity.status(403).build();
        }

        // Prevent recruiter from creating job for another recruiter
        if (!recruiter.getId().equals(recruiterId)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                jobService.createJob(recruiterId, job)
        );
    }

    // ================= GET ALL JOBS =================

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {

        return ResponseEntity.ok(
                jobService.getAllJobs()
        );
    }

    // ================= GET OPEN JOBS =================

    @GetMapping("/open")
    public ResponseEntity<List<Job>> getOpenJobs() {

        return ResponseEntity.ok(
                jobService.getOpenJobs()
        );
    }

    // ================= GET RECRUITER JOBS =================

    @GetMapping("/recruiter/{recruiterId}")
    public ResponseEntity<List<Job>> getRecruiterJobs(
            @PathVariable Long recruiterId,
            Authentication authentication
    ) {

        User recruiter = getLoggedInUser(authentication);

        if (recruiter.getRole() != User.Role.RECRUITER) {
            return ResponseEntity.status(403).build();
        }

        // Recruiter can only view their own jobs
        if (!recruiter.getId().equals(recruiterId)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                jobService.getRecruiterJobs(recruiterId)
        );
    }

    // ================= GET JOB BY ID =================

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                jobService.getJobById(id)
        );
    }

    // ================= UPDATE JOB =================

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(
            @PathVariable Long id,
            @RequestBody Job job,
            Authentication authentication
    ) {

        User recruiter = getLoggedInUser(authentication);

        if (recruiter.getRole() != User.Role.RECRUITER) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                jobService.updateJob(
                        recruiter.getId(),
                        id,
                        job
                )
        );
    }

    // ================= DELETE JOB =================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(
            @PathVariable Long id,
            Authentication authentication
    ) {

        User recruiter = getLoggedInUser(authentication);

        if (recruiter.getRole() != User.Role.RECRUITER) {

            return ResponseEntity
                    .status(403)
                    .body("Only recruiters can delete jobs");
        }

        jobService.deleteJob(
                recruiter.getId(),
                id
        );

        return ResponseEntity.ok(
                "Job deleted successfully"
        );
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