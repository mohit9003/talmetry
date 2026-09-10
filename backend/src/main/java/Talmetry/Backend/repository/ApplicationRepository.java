package Talmetry.Backend.repository;

import Talmetry.Backend.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository
        extends JpaRepository<Application, Long> {

    List<Application> findByUserId(Long userId);

    List<Application> findByJobId(Long jobId);

    Optional<Application> findByUserIdAndJobId(
            Long userId,
            Long jobId
    );

    boolean existsByUserIdAndJobId(
            Long userId,
            Long jobId
    );
    long countByStatus(String status);

    long countByJobId(Long jobId);
}