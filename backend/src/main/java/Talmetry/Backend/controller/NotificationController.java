package Talmetry.Backend.controller;

import Talmetry.Backend.entity.Notification;
import Talmetry.Backend.entity.User;
import Talmetry.Backend.repository.UserRepository;
import Talmetry.Backend.service.NotificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(
            NotificationService notificationService,
            UserRepository userRepository
    ) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    // Get logged-in user's notifications
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            Authentication authentication
    ) {

        User user = getLoggedInUser(authentication);

        return ResponseEntity.ok(
                notificationService.getUserNotifications(user.getId())
        );
    }

    // Get unread notification count
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            Authentication authentication
    ) {

        User user = getLoggedInUser(authentication);

        return ResponseEntity.ok(
                notificationService.getUnreadCount(user.getId())
        );
    }

    // Mark one notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long id,
            Authentication authentication
    ) {

        User user = getLoggedInUser(authentication);

        return ResponseEntity.ok(
                notificationService.markAsRead(
                        user.getId(),
                        id
                )
        );
    }

    // Mark all notifications as read
    @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsRead(
            Authentication authentication
    ) {

        User user = getLoggedInUser(authentication);

        notificationService.markAllAsRead(user.getId());

        return ResponseEntity.ok(
                "All notifications marked as read"
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
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        )
                );
    }
}