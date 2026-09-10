package Talmetry.Backend.repository;

import Talmetry.Backend.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByStatus(String status);

    long countByStatus(String status);

    // Recruiter ownership
    List<Job> findByRecruiterId(Long recruiterId);

    long countByRecruiterId(Long recruiterId);

    long countByRecruiterIdAndStatus(
            Long recruiterId,
            String status
    );
}