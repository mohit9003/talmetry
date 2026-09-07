package Talmetry.Backend.service;

import Talmetry.Backend.entity.Resume;
import Talmetry.Backend.entity.User;
import Talmetry.Backend.repository.ResumeRepository;
import Talmetry.Backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Optional;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    private final String uploadDir = "uploads/resumes/";

    public Optional<Resume> getResume(Long userId) {
    return resumeRepository.findByUserId(userId);
}

    public ResumeService(
            ResumeRepository resumeRepository,
            UserRepository userRepository) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
    }

    public Resume uploadResume(Long userId, MultipartFile file) throws IOException {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        if (file.isEmpty()) {
            throw new RuntimeException("Please select a file");
        }

        String fileName = file.getOriginalFilename();

        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);

        Files.write(filePath, file.getBytes());

        Resume resume = resumeRepository
                .findByUserId(userId)
                .orElse(new Resume());

        resume.setFileName(fileName);
        resume.setFilePath(filePath.toString());
        resume.setUser(user);

        return resumeRepository.save(resume);
    }
}