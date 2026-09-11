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
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody User user
    ) {

        if (user.getEmail() == null ||
                user.getEmail().trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body("Email is required");
        }

        if (user.getPassword() == null ||
                user.getPassword().length() < 6) {

            return ResponseEntity.badRequest()
                    .body("Password must be at least 6 characters");
        }

        if (user.getRole() == null) {

            return ResponseEntity.badRequest()
                    .body("Role is required");
        }

        String email = user.getEmail()
                .trim()
                .toLowerCase();

        if (userRepository.existsByEmail(email)) {

            return ResponseEntity.badRequest()
                    .body("Email already registered");
        }

        user.setEmail(email);

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
            @RequestBody Map<String, String> loginRequest
    ) {

        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        if (email == null ||
                email.trim().isEmpty() ||
                password == null ||
                password.isEmpty()) {

            return ResponseEntity.badRequest()
                    .body("Email and password are required");
        }

        email = email.trim().toLowerCase();

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {

            return ResponseEntity.badRequest()
                    .body("Invalid email or password");
        }

        if (!passwordEncoder.matches(
                password,
                user.getPassword()
        )) {

            return ResponseEntity.badRequest()
                    .body("Invalid email or password");
        }

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