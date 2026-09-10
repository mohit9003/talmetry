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
    private final NotificationService notificationService;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            JobRepository jobRepository,
            NotificationService notificationService
    ) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.notificationService = notificationService;
    }

    // ================= APPLY FOR JOB =================

    public Application applyForJob(Long userId, Long jobId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("Candidate not found")
                );

        if (user.getRole() != User.Role.CANDIDATE) {
            throw new RuntimeException(
                    "Only candidates can apply for jobs"
            );
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new RuntimeException("Job not found")
                );

        if (!"OPEN".equalsIgnoreCase(job.getStatus())) {
            throw new RuntimeException(
                    "This job is no longer open"
            );
        }

        if (applicationRepository.existsByUserIdAndJobId(userId, jobId)) {
            throw new RuntimeException(
                    "You have already applied for this job"
            );
        }

        Application application = new Application();

        application.setUser(user);
        application.setJob(job);
        application.setStatus("APPLIED");
        application.setAppliedAt(LocalDateTime.now());

        Application savedApplication =
                applicationRepository.save(application);

        // Create notification for candidate
        notificationService.createNotification(
                userId,
                "Your application for "
                        + job.getTitle()
                        + " at "
                        + job.getCompany()
                        + " has been submitted successfully.",
                "APPLICATION"
        );

        return savedApplication;
    }

    // ================= CANDIDATE APPLICATIONS =================

    public List<Application> getUserApplications(
            Long loggedInUserId,
            Long requestedUserId
    ) {

        if (!loggedInUserId.equals(requestedUserId)) {
            throw new RuntimeException(
                    "You can only view your own applications"
            );
        }

        User user = userRepository.findById(loggedInUserId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (user.getRole() != User.Role.CANDIDATE) {
            throw new RuntimeException(
                    "Only candidates can access this resource"
            );
        }

        return applicationRepository.findByUserId(
                loggedInUserId
        );
    }

    // ================= JOB APPLICANTS =================

    public List<Application> getJobApplications(
            Long recruiterId,
            Long jobId
    ) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new RuntimeException("Job not found")
                );

        if (job.getRecruiter() == null ||
                !job.getRecruiter().getId().equals(recruiterId)) {

            throw new RuntimeException(
                    "You can only view applicants for your own jobs"
            );
        }

        return applicationRepository.findByJobId(jobId);
    }

    // ================= GET APPLICATION =================

    public Application getApplicationById(
            Long loggedInUserId,
            Long applicationId
    ) {

        Application application =
                applicationRepository.findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Application not found"
                                )
                        );

        User user = userRepository.findById(loggedInUserId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        boolean isCandidate =
                application.getUser() != null &&
                application.getUser().getId()
                        .equals(loggedInUserId);

        boolean isRecruiter =
                user.getRole() == User.Role.RECRUITER &&
                application.getJob() != null &&
                application.getJob().getRecruiter() != null &&
                application.getJob().getRecruiter().getId()
                        .equals(loggedInUserId);

        if (!isCandidate && !isRecruiter) {
            throw new RuntimeException(
                    "You are not authorized to view this application"
            );
        }

        return application;
    }

    // ================= UPDATE APPLICATION STATUS =================

    public Application updateApplicationStatus(
            Long recruiterId,
            Long applicationId,
            String status
    ) {

        Application application =
                applicationRepository.findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Application not found"
                                )
                        );

        Job job = application.getJob();

        if (job == null ||
                job.getRecruiter() == null ||
                !job.getRecruiter().getId().equals(recruiterId)) {

            throw new RuntimeException(
                    "You can only update applications for your own jobs"
            );
        }

        String normalizedStatus =
                status.toUpperCase();

        if (!normalizedStatus.equals("APPLIED")
                && !normalizedStatus.equals("SHORTLISTED")
                && !normalizedStatus.equals("REJECTED")) {

            throw new RuntimeException(
                    "Invalid application status"
            );
        }

        application.setStatus(normalizedStatus);

        Application savedApplication =
                applicationRepository.save(application);

        // ================= STATUS NOTIFICATION =================

        String message;

        if ("SHORTLISTED".equals(normalizedStatus)) {

            message =
                    "Congratulations! You have been shortlisted for "
                            + job.getTitle()
                            + " at "
                            + job.getCompany()
                            + ".";

        } else if ("REJECTED".equals(normalizedStatus)) {

            message =
                    "Your application for "
                            + job.getTitle()
                            + " at "
                            + job.getCompany()
                            + " was not selected.";

        } else {

            message =
                    "Your application status for "
                            + job.getTitle()
                            + " at "
                            + job.getCompany()
                            + " has been updated to "
                            + normalizedStatus
                            + ".";
        }

        notificationService.createNotification(
                application.getUser().getId(),
                message,
                "APPLICATION_STATUS"
        );

        return savedApplication;
    }
}