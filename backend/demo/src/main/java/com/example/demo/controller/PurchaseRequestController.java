
package com.example.demo.controller;

import com.example.demo.entity.PurchaseRequest;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.PurchaseRequestService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class PurchaseRequestController {

    private final PurchaseRequestService requestService;
    private final UserRepository userRepository;

    public PurchaseRequestController(
            PurchaseRequestService requestService,
            UserRepository userRepository) {
        this.requestService = requestService;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public String getCurrentUser(Authentication authentication) {
        return authentication.getName();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseRequest createRequest(
            @RequestBody CreateRequest request,
            Authentication authentication) {

        User employee = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Logged-in user not found"));

        if (!"EMPLOYEE".equals(employee.getRole())) {
            throw new IllegalArgumentException(
                    "Only employees can create purchase requests");
        }

        return requestService.createRequest(
                request.itemName(),
                request.description(),
                request.quantity(),
                request.amount(),
                request.reason(),
                employee.getId(),
                employee.getTeamId()
        );
    }

    @GetMapping("/employee/{employeeId}")
    public List<PurchaseRequest> getEmployeeRequests(
            @PathVariable Long employeeId,
            Authentication authentication) {

        User loggedInUser = userRepository.findByEmail(
                authentication.getName()
        ).orElseThrow(() -> new ResourceNotFoundException(
                "Logged-in user not found"
        ));

        if ("EMPLOYEE".equals(loggedInUser.getRole())
                && !loggedInUser.getId().equals(employeeId)) {
            throw new IllegalArgumentException(
                    "Employees can view only their own requests");
        }

        if ("MANAGER".equals(loggedInUser.getRole())) {
            throw new IllegalArgumentException(
                    "Managers should use the team requests endpoint");
        }

        return requestService.getEmployeeRequests(employeeId);
    }

    // Filter requests for employees and managers.
    @GetMapping("/filter")
    public List<PurchaseRequest> filterRequests(
            @RequestParam(required = false) String status,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate,

            @RequestParam(required = false) Long employeeId,

            Authentication authentication) {

        User loggedInUser = userRepository.findByEmail(
                authentication.getName()
        ).orElseThrow(() -> new ResourceNotFoundException(
                "Logged-in user not found"));

        if ("EMPLOYEE".equals(loggedInUser.getRole())) {

            if (employeeId != null) {
                throw new IllegalArgumentException(
                        "Employees cannot filter by another employee ID");
            }

            return requestService.filterRequests(
                    loggedInUser.getId(),
                    null,
                    status,
                    fromDate,
                    toDate
            );
        }

        if ("MANAGER".equals(loggedInUser.getRole())) {

            if (loggedInUser.getTeamId() == null) {
                throw new IllegalArgumentException(
                        "Manager is not assigned to any team");
            }

            if (employeeId != null) {
                boolean employeeBelongsToTeam =
                        userRepository.existsByIdAndRoleAndTeamId(
                                employeeId,
                                "EMPLOYEE",
                                loggedInUser.getTeamId()
                        );

                if (!employeeBelongsToTeam) {
                    throw new IllegalArgumentException(
                            "Employee does not belong to your assigned team");
                }
            }

            return requestService.filterRequests(
                    employeeId,
                    loggedInUser.getTeamId(),
                    status,
                    fromDate,
                    toDate
            );
        }

        throw new IllegalArgumentException(
                "You are not allowed to filter purchase requests");
    }

    @PutMapping("/{requestId}/approve")
    public ResponseEntity<PurchaseRequest> approveRequest(
            @PathVariable Long requestId,
            Authentication authentication) {

        User manager = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        if (!"MANAGER".equals(manager.getRole())) {
            throw new SecurityException(
                    "Only managers can approve requests");
        }

        PurchaseRequest approvedRequest =
                requestService.approveRequest(
                        requestId,
                        manager.getId()
                );

        return ResponseEntity.ok(approvedRequest);
    }

    @PutMapping("/{requestId}/reject")
    public ResponseEntity<PurchaseRequest> rejectRequest(
            @PathVariable Long requestId,
            @RequestBody RejectRequest request,
            Authentication authentication) {

        User manager = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        if (!"MANAGER".equals(manager.getRole())) {
            throw new SecurityException(
                    "Only managers can reject requests");
        }

        PurchaseRequest rejectedRequest =
                requestService.rejectRequest(
                        requestId,
                        manager.getId(),
                        request.rejectionReason()
                );

        return ResponseEntity.ok(rejectedRequest);
    }

    public record RejectRequest(String rejectionReason) {}

    @GetMapping("/team/{teamId}/pending")
    public List<PurchaseRequest> getPendingRequestsByTeam(
            @PathVariable Long teamId) {

        return requestService.getPendingRequestsByTeam(teamId);
    }

    public record CreateRequest(
            String itemName,
            String description,
            Integer quantity,
            BigDecimal amount,
            String reason,
            Long employeeId,
            Long teamId
    ) {}
}
