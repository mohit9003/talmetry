package Talmetry.Backend.service;

import Talmetry.Backend.entity.Job;
import Talmetry.Backend.entity.Resume;
import Talmetry.Backend.entity.ResumeAnalysis;
import Talmetry.Backend.repository.JobRepository;
import Talmetry.Backend.repository.ResumeAnalysisRepository;
import Talmetry.Backend.repository.ResumeRepository;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class JobMatchingService {

    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository analysisRepository;

    public JobMatchingService(
            JobRepository jobRepository,
            ResumeRepository resumeRepository,
            ResumeAnalysisRepository analysisRepository) {

        this.jobRepository = jobRepository;
        this.resumeRepository = resumeRepository;
        this.analysisRepository = analysisRepository;
    }

    public List<Map<String, Object>> getRecommendedJobs(Long userId) {

        // Candidate resume
        Resume resume = resumeRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Resume not found for candidate")
                );

        // Resume analysis
        ResumeAnalysis analysis = analysisRepository
                .findByResumeId(resume.getId())
                .orElseThrow(() ->
                        new RuntimeException("Resume analysis not found")
                );

        // Candidate skills
        Set<String> candidateSkills =
                convertToSet(analysis.getExtractedSkills());

        // Open jobs
        List<Job> jobs = jobRepository.findByStatus("OPEN");

        List<Map<String, Object>> recommendedJobs = new ArrayList<>();

        for (Job job : jobs) {

            Set<String> requiredSkills =
                    convertToSet(job.getRequiredSkills());

            if (requiredSkills.isEmpty()) {
                continue;
            }

            List<String> matchedSkills = new ArrayList<>();

            for (String requiredSkill : requiredSkills) {

                if (isSkillMatched(requiredSkill, candidateSkills)) {
                    matchedSkills.add(requiredSkill);
                }
            }

            int matchedCount = matchedSkills.size();

            int totalSkills = requiredSkills.size();

            int matchScore =
                    (int) Math.round(
                            ((double) matchedCount / totalSkills) * 100
                    );

            Map<String, Object> result =
                    new LinkedHashMap<>();

            result.put("id", job.getId());
            result.put("title", job.getTitle());
            result.put("company", job.getCompany());
            result.put("location", job.getLocation());
            result.put("jobType", job.getJobType());
            result.put("description", job.getDescription());
            result.put("requiredSkills", job.getRequiredSkills());
            result.put("salary", job.getSalary());
            result.put("experience", job.getExperience());
            result.put("status", job.getStatus());

            result.put("matchScore", matchScore);
            result.put("matchedSkills", matchedSkills);
            result.put("matchedSkillsCount", matchedCount);
            result.put("totalRequiredSkills", totalSkills);

            recommendedJobs.add(result);
        }

        // Highest matching jobs first
        recommendedJobs.sort((a, b) ->
                Integer.compare(
                        (Integer) b.get("matchScore"),
                        (Integer) a.get("matchScore")
                )
        );

        return recommendedJobs;
    }


    // -----------------------------------------
    // SKILL MATCHING
    // -----------------------------------------

    private boolean isSkillMatched(
            String requiredSkill,
            Set<String> candidateSkills) {

        String required = normalizeSkill(requiredSkill);

        for (String candidate : candidateSkills) {

            String candidateNormalized =
                    normalizeSkill(candidate);

            // Exact match
            if (required.equals(candidateNormalized)) {
                return true;
            }

            // Common variations
            if (required.equals("javascript")
                    && candidateNormalized.equals("js")) {
                return true;
            }

            if (required.equals("python")
                    && candidateNormalized.equals("python3")) {
                return true;
            }

            if (required.equals("react")
                    && candidateNormalized.equals("reactjs")) {
                return true;
            }

            if (required.equals("nodejs")
                    && candidateNormalized.equals("node")) {
                return true;
            }

            if (required.equals("springboot")
                    && candidateNormalized.equals("spring")) {
                return true;
            }

            if (required.equals("machinelearning")
                    && candidateNormalized.equals("ml")) {
                return true;
            }

            if (required.equals("deeplearning")
                    && candidateNormalized.equals("dl")) {
                return true;
            }

            if (required.equals("computervision")
                    && candidateNormalized.equals("cv")) {
                return true;
            }
        }

        return false;
    }


    // -----------------------------------------
    // NORMALIZE SKILL
    // -----------------------------------------

    private String normalizeSkill(String skill) {

        if (skill == null) {
            return "";
        }

        return skill
                .toLowerCase()
                .trim()
                .replace(".", "")
                .replace("-", "")
                .replace("_", "")
                .replace(" ", "");
    }


    // -----------------------------------------
    // CONVERT DATABASE STRING TO SET
    // -----------------------------------------

    private Set<String> convertToSet(String skills) {

        if (skills == null || skills.trim().isEmpty()) {
            return Collections.emptySet();
        }

        Set<String> result = new HashSet<>();

        String[] skillArray = skills.split(",");

        for (String skill : skillArray) {

            String cleaned = skill.trim();

            if (!cleaned.isEmpty()) {
                result.add(cleaned);
            }
        }

        return result;
    }
}