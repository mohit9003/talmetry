package Talmetry.Backend.service;

import Talmetry.Backend.entity.Interview;
import Talmetry.Backend.entity.User;
import Talmetry.Backend.repository.InterviewRepository;
import Talmetry.Backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    public InterviewService(
            InterviewRepository interviewRepository,
            UserRepository userRepository) {

        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
    }

    public Interview createInterview(
            Long userId,
            String role,
            String difficulty,
            Integer score,
            Integer technicalScore,
            Integer communicationScore,
            Integer problemSolvingScore) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Interview interview = new Interview();

        interview.setUser(user);
        interview.setRole(role);
        interview.setDifficulty(difficulty);
        interview.setScore(score);
        interview.setTechnicalScore(technicalScore);
        interview.setCommunicationScore(communicationScore);
        interview.setProblemSolvingScore(problemSolvingScore);
        interview.setCompletedAt(LocalDateTime.now());

        return interviewRepository.save(interview);
    }

    public List<Interview> getUserInterviews(Long userId) {
        return interviewRepository.findByUserId(userId);
    }

    public Interview getInterviewById(Long id) {
        return interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
    }
}