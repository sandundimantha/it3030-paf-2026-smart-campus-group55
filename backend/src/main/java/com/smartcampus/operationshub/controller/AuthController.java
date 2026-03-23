package com.smartcampus.operationshub.controller;

import com.smartcampus.operationshub.model.User;
import com.smartcampus.operationshub.repository.UserRepository;
import com.smartcampus.operationshub.model.Role;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<User> loginOrRegister(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(401).build();
        }
        
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");
        
        if (email == null) {
            return ResponseEntity.badRequest().build();
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .name(name != null ? name : "New User")
                    .role(Role.USER) // Default role for Google logins
                    .build();
            return userRepository.save(newUser);
        });

        return ResponseEntity.ok(user);
    }
}
