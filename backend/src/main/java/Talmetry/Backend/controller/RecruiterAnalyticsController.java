package Talmetry.Backend.controller;

import Talmetry.Backend.service.RecruiterAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/recruiter/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class RecruiterAnalyticsController {

    private final RecruiterAnalyticsService analyticsService;

    public RecruiterAnalyticsController(
            RecruiterAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(
                analyticsService.getAnalytics()
        );
    }
}