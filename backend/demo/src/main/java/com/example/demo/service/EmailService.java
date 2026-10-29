
package com.example.demo.service;

import com.example.demo.entity.PurchaseRequest;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    @Value("${spring.mail.from}")
    private String senderEmail;

    public EmailService(
            JavaMailSender mailSender,
            UserRepository userRepository) {
        this.mailSender = mailSender;
        this.userRepository = userRepository;
    }

    public void sendApprovalEmail(PurchaseRequest request) {
        User employee = userRepository.findById(request.getEmployeeId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Employee not found for purchase request"));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(employee.getEmail());
        message.setSubject(
                "Purchase Request Approved - #" + request.getId());

        message.setText(
                "Hello " + employee.getName() + ",\n\n"
                        + "Your purchase request has been approved.\n\n"
                        + "Request ID: " + request.getId() + "\n"
                        + "Item: " + request.getItemName() + "\n"
                        + "Quantity: " + request.getQuantity() + "\n"
                        + "Amount: ₹" + request.getAmount() + "\n"
                        + "Status: APPROVED\n\n"
                        + "Regards,\nPurchase Request System");

        mailSender.send(message);
    }
}
