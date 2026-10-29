
package com.example.demo.auth;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.example.demo.entity.Team;
import com.example.demo.repository.TeamRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminManagerController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TeamRepository teamRepository;

    public AdminManagerController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            TeamRepository teamRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.teamRepository = teamRepository;
    }

    @PostMapping("/managers")
    @ResponseStatus(HttpStatus.CREATED)
    public String createManager(@RequestBody ManagerRequest request) {

        if (request.name() == null || request.name().isBlank()
                || request.email() == null || request.email().isBlank()
                || request.password() == null
                || request.password().length() < 8
                || request.teamId() == null) {
            throw new IllegalArgumentException(
                    "Name, email, password (minimum 8 characters), "
                            + "and team ID are required");
        }

        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException(
                    "Email is already registered");
        }

        User manager = new User();
        manager.setName(request.name().trim());
        manager.setEmail(request.email().trim());
        manager.setPassword(
                passwordEncoder.encode(request.password()));
        manager.setRole("MANAGER");
        manager.setTeamId(request.teamId());
        if (!teamRepository.existsById(request.teamId())) {
            throw new IllegalArgumentException(
                    "Invalid Team ID. Please select an existing team.");
        }

        userRepository.save(manager);

        return "Manager account created successfully";
    }

    public record ManagerRequest(
            String name,
            String email,
            String password,
            Long teamId
    ) {}
}
