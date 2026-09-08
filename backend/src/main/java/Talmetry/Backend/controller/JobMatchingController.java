package Talmetry.Backend.controller;

import Talmetry.Backend.service.JobMatchingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JobMatchingController {

    private final JobMatchingService jobMatchingService;

    public JobMatchingController(JobMatchingService jobMatchingService) {
        this.jobMatchingService = jobMatchingService;
    }

    @GetMapping("/recommended/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getRecommendedJobs(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                jobMatchingService.getRecommendedJobs(userId)
        );
    }
}