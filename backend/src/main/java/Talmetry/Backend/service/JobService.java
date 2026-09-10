package Talmetry.Backend.service;

import Talmetry.Backend.entity.Job;
import Talmetry.Backend.entity.User;
import Talmetry.Backend.repository.JobRepository;
import Talmetry.Backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    // ================= CONSTRUCTOR =================

    public JobService(
            JobRepository jobRepository,
            UserRepository userRepository
    ) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    // ================= CREATE JOB =================

    public Job createJob(Long recruiterId, Job job) {

        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() ->
                        new RuntimeException("Recruiter not found")
                );

        if (recruiter.getRole() != User.Role.RECRUITER) {
            throw new RuntimeException(
                    "Only recruiters can create jobs"
            );
        }

        // Assign recruiter as job owner
        job.setRecruiter(recruiter);

        return jobRepository.save(job);
    }

    // ================= GET ALL JOBS =================

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    // ================= GET OPEN JOBS =================

    public List<Job> getOpenJobs() {
        return jobRepository.findByStatus("OPEN");
    }

    // ================= GET JOB BY ID =================

    public Job getJobById(Long id) {

        return jobRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Job not found")
                );
    }

    // ================= DELETE JOB =================

    public void deleteJob(Long recruiterId, Long jobId) {

    Job job = jobRepository.findById(jobId)
            .orElseThrow(() ->
                    new RuntimeException("Job not found")
            );

    if (job.getRecruiter() == null ||
            !job.getRecruiter().getId().equals(recruiterId)) {

        throw new RuntimeException(
                "You can only delete your own jobs"
        );
    }

    jobRepository.delete(job);
}

    // ================= RECRUITER JOBS =================

    public List<Job> getRecruiterJobs(Long recruiterId) {
        return jobRepository.findByRecruiterId(recruiterId);
    }

    // ================= RECRUITER JOB COUNT =================

    public long getRecruiterJobCount(Long recruiterId) {
        return jobRepository.countByRecruiterId(recruiterId);
    }

    // ================= RECRUITER ACTIVE JOB COUNT =================

    public long getRecruiterActiveJobCount(Long recruiterId) {
        return jobRepository.countByRecruiterIdAndStatus(
                recruiterId,
                "OPEN"
        );
    }
    public Job updateJob(
        Long recruiterId,
        Long jobId,
        Job updatedJob
) {

    Job existingJob = jobRepository.findById(jobId)
            .orElseThrow(() ->
                    new RuntimeException("Job not found")
            );

    if (existingJob.getRecruiter() == null ||
            !existingJob.getRecruiter().getId().equals(recruiterId)) {

        throw new RuntimeException(
                "You can only update your own jobs"
        );
    }

    existingJob.setTitle(updatedJob.getTitle());
    existingJob.setCompany(updatedJob.getCompany());
    existingJob.setLocation(updatedJob.getLocation());
    existingJob.setJobType(updatedJob.getJobType());
    existingJob.setDescription(updatedJob.getDescription());
    existingJob.setRequiredSkills(updatedJob.getRequiredSkills());
    existingJob.setSalary(updatedJob.getSalary());
    existingJob.setExperience(updatedJob.getExperience());
    existingJob.setStatus(updatedJob.getStatus());

    return jobRepository.save(existingJob);
}
}