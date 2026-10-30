
package com.example.demo.service;

import com.example.demo.chat.GeminiService;
import com.example.demo.entity.PurchaseRequest;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.PurchaseRequestRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ChatService {

    private final UserRepository userRepository;
    private final PurchaseRequestRepository requestRepository;
    private final GeminiService geminiService;

    public ChatService(
            UserRepository userRepository,
            PurchaseRequestRepository requestRepository,
            GeminiService geminiService) {

        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
        this.geminiService = geminiService;
    }

    public String chat(String email, String question) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        List<PurchaseRequest> requests;

        if ("EMPLOYEE".equalsIgnoreCase(user.getRole())) {

            requests = requestRepository.findByEmployeeId(user.getId());

        } else if ("MANAGER".equalsIgnoreCase(user.getRole())) {

            if (user.getTeamId() == null) {
                throw new AccessDeniedException(
                        "Manager is not assigned to any team");
            }

            requests = requestRepository.findByTeamId(user.getTeamId());

        } else {
            throw new AccessDeniedException(
                    "You are not allowed to access the AI chatbot");
        }

        String normalizedQuestion = question.toLowerCase(Locale.ROOT);

        // Filter by request ID
        Matcher idMatcher = Pattern.compile(
                "\\b(?:request\\s*id|request|id)\\s*#?\\s*(\\d+)\\b"
        ).matcher(normalizedQuestion);

        if (idMatcher.find()) {

            Long requestId = Long.parseLong(idMatcher.group(1));

            List<PurchaseRequest> matched = requests.stream()
                    .filter(r -> r.getId().equals(requestId))
                    .toList();

            return formatRequests(matched);
        }

        // Filter by status
        String status = null;

        if (normalizedQuestion.contains("pending")) {
            status = "PENDING";
        } else if (normalizedQuestion.contains("approved")) {
            status = "APPROVED";
        } else if (normalizedQuestion.contains("rejected")) {
            status = "REJECTED";
        }

        final String requestedStatus = status;

        // Filter by amount
        Matcher amountMatcher = Pattern.compile(
                "(?:above|greater than|more than|over|exceeding|below|less than|under|at least)\\s*₹?\\s*([\\d,]+)"
        ).matcher(normalizedQuestion);

        BigDecimal amountLimit = null;
        String amountOperator = null;

        if (amountMatcher.find()) {

            amountLimit = new BigDecimal(
                    amountMatcher.group(1).replace(",", "")
            );

            String matchedText = amountMatcher.group().toLowerCase();

            if (matchedText.contains("below")
                    || matchedText.contains("less than")
                    || matchedText.contains("under")) {
                amountOperator = "LESS";
            } else {
                amountOperator = "GREATER";
            }
        }

        final BigDecimal finalAmountLimit = amountLimit;
        final String finalAmountOperator = amountOperator;

        List<PurchaseRequest> matchedRequests = requests.stream()
                .filter(r -> requestedStatus == null ||
                        requestedStatus.equalsIgnoreCase(r.getStatus()))
                .filter(r -> finalAmountLimit == null ||
                        (r.getAmount() != null &&
                                ("LESS".equals(finalAmountOperator)
                                        ? r.getAmount().compareTo(finalAmountLimit) < 0
                                        : r.getAmount().compareTo(finalAmountLimit) > 0)))
                .toList();

        // Count queries
        if (normalizedQuestion.contains("how many")
                || normalizedQuestion.contains("count")) {

            return "You have " + matchedRequests.size()
                    + " matching purchase request(s).";
        }

        // Total amount queries
        if (normalizedQuestion.contains("total amount")
                || normalizedQuestion.contains("sum of")) {

            BigDecimal total = matchedRequests.stream()
                    .map(PurchaseRequest::getAmount)
                    .filter(a -> a != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            return "Total amount of matching purchase requests: ₹"
                    + total;
        }

        // Deterministic response for common request queries
        if (requestedStatus != null || finalAmountLimit != null
                || normalizedQuestion.contains("my requests")
                || normalizedQuestion.contains("all requests")
                || normalizedQuestion.contains("purchase requests")) {

            return formatRequests(matchedRequests);
        }

        // Gemini handles questions that need natural-language understanding
        String prompt = """
                You are a Purchase Request System assistant.

                Answer only using the authorized purchase request data below.

                Data:
                %s

                Question:
                %s

                Never invent information.
                Never claim access to the entire system.
                Keep the answer simple and accurate.
                """.formatted(
                formatRequests(requests),
                question
        );

        return geminiService.generateResponse(prompt);
    }

    private String formatRequests(List<PurchaseRequest> requests) {

        if (requests.isEmpty()) {
            return "No matching purchase requests found.";
        }

        StringBuilder result = new StringBuilder();

        result.append("Found ")
                .append(requests.size())
                .append(" purchase request(s):\n\n");

        for (PurchaseRequest request : requests) {

            result.append("Request ID: ")
                    .append(request.getId())
                    .append("\nItem Name: ")
                    .append(request.getItemName())
                    .append("\nQuantity: ")
                    .append(request.getQuantity())
                    .append("\nAmount: ₹")
                    .append(request.getAmount())
                    .append("\nStatus: ")
                    .append(request.getStatus())
                    .append("\nCreated At: ")
                    .append(request.getCreatedAt())
                    .append("\n\n");
        }

        return result.toString();
    }
}
