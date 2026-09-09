package Talmetry.Backend.service;

import Talmetry.Backend.entity.Application;
import Talmetry.Backend.entity.Job;
import Talmetry.Backend.entity.User;

import Talmetry.Backend.repository.ApplicationRepository;
import Talmetry.Backend.repository.JobRepository;
import Talmetry.Backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            JobRepository jobRepository) {

        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
    }

    // Apply for a job
    public Application applyForJob(Long userId, Long jobId) {

        // Check candidate
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("Candidate not found")
                );

        // Check job
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new RuntimeException("Job not found")
                );

        // Check whether already applied
        if (applicationRepository
                .existsByUserIdAndJobId(userId, jobId)) {

            throw new RuntimeException(
                    "You have already applied for this job"
            );
        }

        // Create application
        Application application = new Application();

        application.setUser(user);
        application.setJob(job);
        application.setStatus("APPLIED");
        application.setAppliedAt(LocalDateTime.now());

        return applicationRepository.save(application);
    }

    // Get all applications of a candidate
    public List<Application> getUserApplications(Long userId) {

        return applicationRepository.findByUserId(userId);
    }

    // Get all applicants for a job
    public List<Application> getJobApplications(Long jobId) {

        return applicationRepository.findByJobId(jobId);
    }

    // Get application by ID
    public Application getApplicationById(Long id) {

        return applicationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Application not found")
                );
    }

    // Update application status
    public Application updateApplicationStatus(
            Long applicationId,
            String status) {

        Application application =
                applicationRepository.findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Application not found"
                                )
                        );

        application.setStatus(status.toUpperCase());

        return applicationRepository.save(application);
    }
}