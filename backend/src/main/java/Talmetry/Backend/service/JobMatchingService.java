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

        // Find candidate's resume
        Resume resume = resumeRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException("Resume not found for candidate")
                );

        // Find resume analysis
        ResumeAnalysis analysis = analysisRepository
                .findByResumeId(resume.getId())
                .orElseThrow(() ->
                        new RuntimeException("Resume analysis not found")
                );

        // Candidate skills
        Set<String> candidateSkills =
                convertToSet(analysis.getExtractedSkills());

        // Get all open jobs
        List<Job> jobs = jobRepository.findByStatus("OPEN");

        List<Map<String, Object>> recommendedJobs = new ArrayList<>();

        for (Job job : jobs) {

            Set<String> requiredSkills =
                    convertToSet(job.getRequiredSkills());

            if (requiredSkills.isEmpty()) {
                continue;
            }

            int matchedSkills = 0;

            for (String requiredSkill : requiredSkills) {

                if (candidateSkills.contains(requiredSkill)) {
                    matchedSkills++;
                }
            }

            int matchScore =
                    (matchedSkills * 100) / requiredSkills.size();

            Map<String, Object> result = new LinkedHashMap<>();

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
            result.put("totalRequiredSkills", requiredSkills.size());

            recommendedJobs.add(result);
        }

        // Highest match first
        recommendedJobs.sort((a, b) ->
                Integer.compare(
                        (Integer) b.get("matchScore"),
                        (Integer) a.get("matchScore")
                )
        );

        return recommendedJobs;
    }


    private Set<String> convertToSet(String skills) {

        if (skills == null || skills.trim().isEmpty()) {
            return Collections.emptySet();
        }

        Set<String> result = new HashSet<>();

        String[] skillArray = skills.split(",");

        for (String skill : skillArray) {

            String normalized =
                    skill.trim().toLowerCase();

            if (!normalized.isEmpty()) {
                result.add(normalized);
            }
        }

        return result;
    }
}