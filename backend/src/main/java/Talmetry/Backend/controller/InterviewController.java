package Talmetry.Backend.controller;

import Talmetry.Backend.entity.Interview;
import Talmetry.Backend.entity.User;
import Talmetry.Backend.repository.UserRepository;
import Talmetry.Backend.service.InterviewService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = "http://localhost:5173")
public class InterviewController {

    private final InterviewService interviewService;
    private final UserRepository userRepository;

    public InterviewController(
            InterviewService interviewService,
            UserRepository userRepository
    ) {
        this.interviewService = interviewService;
        this.userRepository = userRepository;
    }


    @PostMapping("/create")
    public ResponseEntity<Interview> createInterview(

            @RequestParam Long userId,
            @RequestParam String role,
            @RequestParam String difficulty,
            @RequestParam Integer score,
            @RequestParam Integer technicalScore,
            @RequestParam Integer communicationScore,
            @RequestParam Integer problemSolvingScore,

            Authentication authentication
    ) {

        User loggedInUser =
                getLoggedInUser(authentication);

        if (loggedInUser.getRole()
                != User.Role.CANDIDATE) {

            return ResponseEntity
                    .status(403)
                    .build();
        }

        if (!loggedInUser.getId()
                .equals(userId)) {

            return ResponseEntity
                    .status(403)
                    .build();
        }

        Interview interview =
                interviewService.createInterview(
                        loggedInUser.getId(),
                        role,
                        difficulty,
                        score,
                        technicalScore,
                        communicationScore,
                        problemSolvingScore
                );

        return ResponseEntity.ok(interview);
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Interview>>
    getUserInterviews(

            @PathVariable Long userId,

            Authentication authentication
    ) {

        User loggedInUser =
                getLoggedInUser(authentication);

        if (loggedInUser.getRole()
                != User.Role.CANDIDATE) {

            return ResponseEntity
                    .status(403)
                    .build();
        }

        if (!loggedInUser.getId()
                .equals(userId)) {

            return ResponseEntity
                    .status(403)
                    .build();
        }

        return ResponseEntity.ok(
                interviewService
                        .getUserInterviews(
                                loggedInUser.getId()
                        )
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<Interview>
    getInterviewById(

            @PathVariable Long id,

            Authentication authentication
    ) {

        // User must be authenticated.
        getLoggedInUser(authentication);

        return ResponseEntity.ok(
                interviewService
                        .getInterviewById(id)
        );
    }


    private User getLoggedInUser(
            Authentication authentication
    ) {

        if (authentication == null ||
                authentication.getName() == null) {

            throw new RuntimeException(
                    "Authentication required"
            );
        }

        return userRepository
                .findByEmail(
                        authentication.getName()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        )
                );
    }
}