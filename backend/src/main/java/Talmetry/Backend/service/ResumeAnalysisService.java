package Talmetry.Backend.service;

import Talmetry.Backend.entity.Resume;
import Talmetry.Backend.entity.ResumeAnalysis;
import Talmetry.Backend.repository.ResumeAnalysisRepository;
import Talmetry.Backend.repository.ResumeRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ResumeAnalysisService {

    private final ResumeAnalysisRepository analysisRepository;
    private final ResumeRepository resumeRepository;

    public ResumeAnalysisService(
            ResumeAnalysisRepository analysisRepository,
            ResumeRepository resumeRepository) {

        this.analysisRepository = analysisRepository;
        this.resumeRepository = resumeRepository;
    }

    // Get existing analysis
    public Optional<ResumeAnalysis> getAnalysis(Long resumeId) {
        return analysisRepository.findByResumeId(resumeId);
    }

    // Create analysis record
    public ResumeAnalysis createAnalysis(Long resumeId) {

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() ->
                        new RuntimeException("Resume not found"));

        ResumeAnalysis analysis = analysisRepository
                .findByResumeId(resumeId)
                .orElse(new ResumeAnalysis());

        analysis.setResume(resume);

        return analysisRepository.save(analysis);
    }
}