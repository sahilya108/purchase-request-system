
package com.example.demo.auth;

import com.example.demo.entity.User;
import com.example.demo.entity.Team;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.TeamRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    // Create manager account
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

        if (!teamRepository.existsById(request.teamId())) {
            throw new IllegalArgumentException(
                    "Invalid Team ID. Please select an existing team.");
        }

        User manager = new User();
        manager.setName(request.name().trim());
        manager.setEmail(request.email().trim());
        manager.setPassword(
                passwordEncoder.encode(request.password()));
        manager.setRole("MANAGER");
        manager.setTeamId(request.teamId());

        userRepository.save(manager);

        return "Manager account created successfully";
    }

    // Get all teams
    @GetMapping("/teams")
    public List<Team> getAllTeams(Authentication authentication) {

        User admin = getAdmin(authentication);

        return teamRepository.findAll();
    }

    // Create a new team
    @PostMapping("/teams")
    @ResponseStatus(HttpStatus.CREATED)
    public Team createTeam(
            @RequestBody CreateTeamRequest request,
            Authentication authentication) {

        getAdmin(authentication);

        if (request.teamName() == null || request.teamName().isBlank()) {
            throw new IllegalArgumentException(
                    "Team name is required");
        }

        String teamName = request.teamName().trim();

        boolean teamExists = teamRepository.findAll().stream()
                .anyMatch(team ->
                        team.getTeamName().equalsIgnoreCase(teamName));

        if (teamExists) {
            throw new IllegalArgumentException(
                    "A team with this name already exists");
        }

        Team team = new Team();
        team.setTeamName(teamName);

        return teamRepository.save(team);
    }

    // Verify administrator
    private User getAdmin(Authentication authentication) {

        User admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Logged-in user not found"));

        if (!"ADMIN".equals(admin.getRole())) {
            throw new SecurityException(
                    "Only administrators can perform this action");
        }

        return admin;
    }

    public record ManagerRequest(
            String name,
            String email,
            String password,
            Long teamId
    ) {}

    public record CreateTeamRequest(String teamName) {}
}
