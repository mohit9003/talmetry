package Talmetry.Backend.controller;

import Talmetry.Backend.entity.Interview;
import Talmetry.Backend.service.InterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = "http://localhost:5173")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping("/create")
    public ResponseEntity<Interview> createInterview(
            @RequestParam Long userId,
            @RequestParam String role,
            @RequestParam String difficulty,
            @RequestParam Integer score,
            @RequestParam Integer technicalScore,
            @RequestParam Integer communicationScore,
            @RequestParam Integer problemSolvingScore) {

        Interview interview = interviewService.createInterview(
                userId,
                role,
                difficulty,
                score,
                technicalScore,
                communicationScore,
                problemSolvingScore
        );

        return ResponseEntity.ok(interview);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Interview>> getUserInterviews(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                interviewService.getUserInterviews(userId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Interview> getInterviewById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                interviewService.getInterviewById(id)
        );
    }
}