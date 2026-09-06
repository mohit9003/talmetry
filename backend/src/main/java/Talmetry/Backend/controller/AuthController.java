package Talmetry.Backend.controller;

import Talmetry.Backend.entity.User;
import Talmetry.Backend.repository.UserRepository;
import Talmetry.Backend.security.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body("Email already registered");
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        User savedUser = userRepository.save(user);

        Map<String, Object> response = new HashMap<>();

        response.put("id", savedUser.getId());
        response.put("fullName", savedUser.getFullName());
        response.put("email", savedUser.getEmail());
        response.put("role", savedUser.getRole());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody User loginUser) {

        User user = userRepository
                .findByEmail(loginUser.getEmail())
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Invalid email or password");
        }

        if (!passwordEncoder.matches(
                loginUser.getPassword(),
                user.getPassword())) {

            return ResponseEntity
                    .badRequest()
                    .body("Invalid email or password");
        }

        // Generate JWT token
        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        Map<String, Object> response = new HashMap<>();

        response.put("token", token);
        response.put("id", user.getId());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }
}