package Talmetry.Backend.controller;

import Talmetry.Backend.entity.Resume;
import Talmetry.Backend.service.ResumeService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/candidate/resume")
@CrossOrigin(origins = "http://localhost:5173")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    // Get uploaded resume information
    @GetMapping("/{userId}")
    public ResponseEntity<?> getResume(@PathVariable Long userId) {

        return resumeService.getResume(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Upload resume
    @PostMapping("/{userId}")
    public ResponseEntity<?> uploadResume(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {

        try {

            // File type validation
            String contentType = file.getContentType();

            if (contentType == null ||
                    (!contentType.equals("application/pdf") &&
                     !contentType.equals(
                         "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {

                return ResponseEntity.badRequest()
                        .body("Only PDF and DOCX files are allowed");
            }

            // File size validation - maximum 5 MB
            if (file.getSize() > 5 * 1024 * 1024) {

                return ResponseEntity.badRequest()
                        .body("File size must be less than 5 MB");
            }

            Resume resume = resumeService.uploadResume(userId, file);

            return ResponseEntity.ok(resume);

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    // Open / download resume
   @GetMapping("/download/{userId}")
public ResponseEntity<?> downloadResume(@PathVariable Long userId) {

    try {

        System.out.println("Download request for user: " + userId);

        Resume resume = resumeService.getResume(userId)
                .orElse(null);

        if (resume == null) {
            System.out.println("Resume not found in database");
            return ResponseEntity.notFound().build();
        }

        System.out.println("Resume file: " + resume.getFilePath());

        Path filePath = Path.of(resume.getFilePath());

        if (!Files.exists(filePath)) {
            System.out.println("File does not exist: " + filePath.toAbsolutePath());
            return ResponseEntity.notFound().build();
        }

        String fileName = resume.getFileName();

        MediaType mediaType;

        if (fileName.toLowerCase().endsWith(".pdf")) {
            mediaType = MediaType.APPLICATION_PDF;
        } else {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + fileName + "\""
                )
                .body(Files.readAllBytes(filePath));

    } catch (Exception e) {

        e.printStackTrace();

        return ResponseEntity.internalServerError()
                .body("Unable to open resume: " + e.getMessage());
    }
}
}