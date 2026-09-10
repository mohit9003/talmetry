package Talmetry.Backend.service;

import Talmetry.Backend.repository.ApplicationRepository;
import Talmetry.Backend.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class RecruiterAnalyticsService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    public RecruiterAnalyticsService(
            JobRepository jobRepository,
            ApplicationRepository applicationRepository) {

        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
    }

    public Map<String, Object> getAnalytics() {

        long totalJobs = jobRepository.count();
        long activeJobs = jobRepository.countByStatus("OPEN");

        long totalApplicants = applicationRepository.count();
        long shortlisted =
                applicationRepository.countByStatus("SHORTLISTED");
        long rejected =
                applicationRepository.countByStatus("REJECTED");
        long applied =
                applicationRepository.countByStatus("APPLIED");

        double selectionRate = totalApplicants > 0
                ? ((double) shortlisted / totalApplicants) * 100
                : 0;

        Map<String, Object> analytics = new HashMap<>();

        analytics.put("totalJobs", totalJobs);
        analytics.put("activeJobs", activeJobs);
        analytics.put("totalApplicants", totalApplicants);
        analytics.put("applied", applied);
        analytics.put("shortlisted", shortlisted);
        analytics.put("rejected", rejected);
        analytics.put(
                "selectionRate",
                Math.round(selectionRate * 100.0) / 100.0
        );

        return analytics;
    }
}