package Talmetry.Backend.controller;

import Talmetry.Backend.entity.ResumeAnalysis;
import Talmetry.Backend.service.ResumeAnalysisService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidate/resume-analysis")
@CrossOrigin(origins = "http://localhost:5173")
public class ResumeAnalysisController {

    private final ResumeAnalysisService analysisService;

    public ResumeAnalysisController(
            ResumeAnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    // Get analysis of a resume
    @GetMapping("/{resumeId}")
    public ResponseEntity<?> getAnalysis(
            @PathVariable Long resumeId) {

        return analysisService.getAnalysis(resumeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create analysis record
    @PostMapping("/{resumeId}")
    public ResponseEntity<?> createAnalysis(
            @PathVariable Long resumeId) {

        try {

            ResumeAnalysis analysis =
                    analysisService.createAnalysis(resumeId);

            return ResponseEntity.ok(analysis);

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
}