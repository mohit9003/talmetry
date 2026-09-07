package Talmetry.Backend.controller;

import Talmetry.Backend.entity.CandidateProfile;
import Talmetry.Backend.entity.User;
import Talmetry.Backend.repository.CandidateProfileRepository;
import Talmetry.Backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidate/profile")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateProfileController {

    private final CandidateProfileRepository profileRepository;
    private final UserRepository userRepository;

    public CandidateProfileController(
            CandidateProfileRepository profileRepository,
            UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable Long userId) {

        return profileRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{userId}")
    public ResponseEntity<?> createProfile(
            @PathVariable Long userId,
            @RequestBody CandidateProfile profile) {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body("User not found");
        }

        if (profileRepository.findByUserId(userId).isPresent()) {
            return ResponseEntity.badRequest()
                    .body("Profile already exists");
        }

        profile.setUser(user);

        CandidateProfile savedProfile =
                profileRepository.save(profile);

        return ResponseEntity.ok(savedProfile);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long userId,
            @RequestBody CandidateProfile updatedProfile) {

        CandidateProfile existingProfile =
                profileRepository.findByUserId(userId).orElse(null);

        if (existingProfile == null) {
            return ResponseEntity.notFound().build();
        }

        existingProfile.setPhone(updatedProfile.getPhone());
        existingProfile.setLocation(updatedProfile.getLocation());
        existingProfile.setEducation(updatedProfile.getEducation());
        existingProfile.setExperience(updatedProfile.getExperience());
        existingProfile.setSkills(updatedProfile.getSkills());
        existingProfile.setGithub(updatedProfile.getGithub());
        existingProfile.setLinkedin(updatedProfile.getLinkedin());
        existingProfile.setResumeUrl(updatedProfile.getResumeUrl());

        CandidateProfile savedProfile =
                profileRepository.save(existingProfile);

        return ResponseEntity.ok(savedProfile);
    }
}