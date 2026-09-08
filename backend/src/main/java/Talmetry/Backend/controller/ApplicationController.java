package Talmetry.Backend.controller;

import Talmetry.Backend.entity.Application;
import Talmetry.Backend.service.ApplicationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // Apply for a job
    @PostMapping("/apply")
    public ResponseEntity<Application> applyForJob(
            @RequestParam Long userId,
            @RequestParam Long jobId) {

        Application application =
                applicationService.applyForJob(userId, jobId);

        return ResponseEntity.ok(application);
    }

    // Get all applications of a candidate
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Application>> getUserApplications(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                applicationService.getUserApplications(userId)
        );
    }

    // Get application by ID
    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                applicationService.getApplicationById(id)
        );
    }
}