
package com.example.demo.auth;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.example.demo.security.JwtService;

@RestController
@RequestMapping("/api/auth")
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
    @ResponseStatus(HttpStatus.CREATED)
    public String register(@RequestBody RegisterRequest request) {

        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole("EMPLOYEE");
        user.setTeamId(request.teamId());

        userRepository.save(user);

        return "Registration successful";
    }



    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        System.out.println(passwordEncoder.encode("dummy123"));

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid email or password"));

        if (!passwordEncoder.matches(
                request.password(), user.getPassword())) {
            throw new IllegalArgumentException(
                    "Invalid email or password");
        }

        String token = jwtService.generateToken(
                user.getEmail(), user.getRole());

        return token;
    }

    public record LoginRequest(
            String email,
            String password
    ) {}


    public record RegisterRequest(
            String name,
            String email,
            String password,
            Long teamId
    ) {}
}
