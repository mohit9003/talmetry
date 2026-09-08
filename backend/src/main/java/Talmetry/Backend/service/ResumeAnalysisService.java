package Talmetry.Backend.service;

import Talmetry.Backend.entity.Resume;
import Talmetry.Backend.entity.ResumeAnalysis;
import Talmetry.Backend.repository.ResumeAnalysisRepository;
import Talmetry.Backend.repository.ResumeRepository;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import org.springframework.web.client.RestTemplate;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class ResumeAnalysisService {

    private final ResumeAnalysisRepository analysisRepository;
    private final ResumeRepository resumeRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    public ResumeAnalysisService(
            ResumeAnalysisRepository analysisRepository,
            ResumeRepository resumeRepository) {

        this.analysisRepository = analysisRepository;
        this.resumeRepository = resumeRepository;
    }

    // ==========================================
    // Get existing analysis
    // ==========================================

    public Optional<ResumeAnalysis> getAnalysis(Long resumeId) {

        return analysisRepository.findByResumeId(resumeId);
    }

    // ==========================================
    // Analyze Resume
    // ==========================================

    public ResumeAnalysis analyzeResume(Long resumeId) {

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() ->
                        new RuntimeException("Resume not found"));

        try {

            // ------------------------------------------
            // Check resume file
            // ------------------------------------------

            Path filePath = Path.of(resume.getFilePath());

            if (!Files.exists(filePath)) {

                throw new RuntimeException(
                        "Resume file not found: "
                                + filePath.toAbsolutePath()
                );
            }

            System.out.println("------------------------------------------");
            System.out.println("Starting Resume Analysis");
            System.out.println("Resume ID: " + resumeId);
            System.out.println("File: " + resume.getFileName());

            // ------------------------------------------
            // Read resume file
            // ------------------------------------------

            byte[] fileBytes = Files.readAllBytes(filePath);

            System.out.println(
                    "File size: "
                            + fileBytes.length
                            + " bytes"
            );

            if (fileBytes.length == 0) {

                throw new RuntimeException(
                        "Resume file is empty"
                );
            }

            // ------------------------------------------
            // Prepare file for Python
            // ------------------------------------------

            ByteArrayResource fileResource =
                    new ByteArrayResource(fileBytes) {

                        @Override
                        public String getFilename() {

                            return resume.getFileName();
                        }
                    };

            MultiValueMap<String, Object> body =
                    new LinkedMultiValueMap<>();

            body.add("file", fileResource);

            HttpHeaders headers = new HttpHeaders();

            headers.setContentType(
                    MediaType.MULTIPART_FORM_DATA
            );

            HttpEntity<MultiValueMap<String, Object>> request =
                    new HttpEntity<>(
                            body,
                            headers
                    );

            // ------------------------------------------
            // Call Python AI Service
            // ------------------------------------------

            System.out.println(
                    "Sending resume to Python AI service..."
            );

            ResponseEntity<AIResponse> response =
                    restTemplate.postForEntity(

                            "http://127.0.0.1:8000/api/analyze-resume",

                            request,

                            AIResponse.class
                    );

            System.out.println(
                    "Python response status: "
                            + response.getStatusCode()
            );

            // ------------------------------------------
            // Validate Python response
            // ------------------------------------------

            if (!response.getStatusCode().is2xxSuccessful()) {

                throw new RuntimeException(
                        "AI service failed: "
                                + response.getStatusCode()
                );
            }

            AIResponse ai = response.getBody();

            if (ai == null) {

                throw new RuntimeException(
                        "AI service returned empty response"
                );
            }

            // ------------------------------------------
            // Print AI response
            // ------------------------------------------

            System.out.println("------------------------------------------");
            System.out.println("AI ANALYSIS RESULT");
            System.out.println("File: " + ai.fileName);
            System.out.println("Text Length: " + ai.textLength);
            System.out.println("ATS Score: " + ai.atsScore);
            System.out.println("Skills: " + ai.skills);
            System.out.println("Strengths: " + ai.strengths);
            System.out.println("Weaknesses: " + ai.weaknesses);
            System.out.println("Suggestions: " + ai.suggestions);
            System.out.println("------------------------------------------");

            // ------------------------------------------
            // Safety: null lists
            // ------------------------------------------

            List<String> skills =
                    ai.skills != null
                            ? ai.skills
                            : Collections.emptyList();

            List<String> strengths =
                    ai.strengths != null
                            ? ai.strengths
                            : Collections.emptyList();

            List<String> weaknesses =
                    ai.weaknesses != null
                            ? ai.weaknesses
                            : Collections.emptyList();

            List<String> suggestions =
                    ai.suggestions != null
                            ? ai.suggestions
                            : Collections.emptyList();

            // ------------------------------------------
            // Find existing analysis
            // ------------------------------------------

            ResumeAnalysis analysis =
                    analysisRepository
                            .findByResumeId(resumeId)
                            .orElse(new ResumeAnalysis());

            // ------------------------------------------
            // Save analysis
            // ------------------------------------------

            analysis.setResume(resume);

            analysis.setAtsScore(
                    ai.atsScore
            );

            analysis.setExtractedSkills(
                    String.join(
                            ", ",
                            skills
                    )
            );

            analysis.setStrengths(
                    String.join(
                            ", ",
                            strengths
                    )
            );

            analysis.setWeaknesses(
                    String.join(
                            ", ",
                            weaknesses
                    )
            );

            analysis.setSuggestions(
                    String.join(
                            ", ",
                            suggestions
                    )
            );

            ResumeAnalysis savedAnalysis =
                    analysisRepository.save(analysis);

            System.out.println(
                    "Resume analysis saved successfully!"
            );

            System.out.println(
                    "Analysis ID: "
                            + savedAnalysis.getId()
            );

            System.out.println("------------------------------------------");

            return savedAnalysis;

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Unable to analyze resume: "
                            + e.getMessage()
            );
        }
    }

    // ==========================================
    // Python AI Response
    // ==========================================

    public static class AIResponse {

        public String fileName;

        public int textLength;

        public int atsScore;

        public List<String> skills;

        public List<String> strengths;

        public List<String> weaknesses;

        public List<String> suggestions;
    }
}