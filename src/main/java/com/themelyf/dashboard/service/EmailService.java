package com.themelyf.dashboard.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.email.from:noreply@themelyf.com}")
    private String fromEmail;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public void sendOtpEmail(String toEmail, String otpCode, String firstName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Your Themelyf Dashboard OTP Code");
        message.setText(String.format(
            "Hi %s,\n\n" +
            "Your OTP code for Themelyf Dashboard is: %s\n\n" +
            "This code will expire in 5 minutes for security reasons.\n\n" +
            "If you didn't request this code, please ignore this email.\n\n" +
            "Best regards,\n" +
            "Themelyf Dashboard Team",
            firstName, otpCode
        ));

        try {
            mailSender.send(message);
        } catch (Exception e) {
            // Log error in production
            System.err.println("Failed to send OTP email: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email");
        }
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken, String firstName) {
        String resetUrl = baseUrl + "/reset-password?token=" + resetToken;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Reset Your Themelyf Dashboard Password");
        message.setText(String.format(
            "Hi %s,\n\n" +
            "You requested to reset your password for Themelyf Dashboard.\n\n" +
            "Click the link below to reset your password:\n" +
            "%s\n\n" +
            "This link will expire in 1 hour for security reasons.\n\n" +
            "If you didn't request this password reset, please ignore this email.\n\n" +
            "Best regards,\n" +
            "Themelyf Dashboard Team",
            firstName, resetUrl
        ));

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
            throw new RuntimeException("Failed to send password reset email");
        }
    }

    public void sendPasswordResetConfirmation(String toEmail, String firstName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Password Reset Successful - Themelyf Dashboard");
        message.setText(String.format(
            "Hi %s,\n\n" +
            "Your password for Themelyf Dashboard has been successfully reset.\n\n" +
            "If you didn't make this change, please contact our support team immediately.\n\n" +
            "Best regards,\n" +
            "Themelyf Dashboard Team",
            firstName
        ));

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send password reset confirmation: " + e.getMessage());
        }
    }

    public void sendPasswordChangeNotification(String toEmail, String firstName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Password Changed - Themelyf Dashboard");
        message.setText(String.format(
            "Hi %s,\n\n" +
            "Your password for Themelyf Dashboard has been successfully changed.\n\n" +
            "If you didn't make this change, please contact our support team immediately.\n\n" +
            "Best regards,\n" +
            "Themelyf Dashboard Team",
            firstName
        ));

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send password change notification: " + e.getMessage());
        }
    }

    public void sendEmailVerification(String toEmail, String verificationToken, String firstName) {
        String verificationUrl = baseUrl + "/verify-email?token=" + verificationToken;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Verify Your Email - Themelyf Dashboard");
        message.setText(String.format(
            "Hi %s,\n\n" +
            "Thank you for registering with Themelyf Dashboard!\n\n" +
            "Please click the link below to verify your email address:\n" +
            "%s\n\n" +
            "This link will expire in 24 hours for security reasons.\n\n" +
            "If you didn't create this account, please ignore this email.\n\n" +
            "Best regards,\n" +
            "Themelyf Dashboard Team",
            firstName, verificationUrl
        ));

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email verification: " + e.getMessage());
            throw new RuntimeException("Failed to send verification email");
        }
    }

    public void sendWelcomeEmail(String toEmail, String firstName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Welcome to Themelyf Dashboard!");
        message.setText(String.format(
            "Hi %s,\n\n" +
            "Welcome to Themelyf Dashboard! We're excited to have you on board.\n\n" +
            "You can now:\n" +
            "- Manage your dashboard items\n" +
            "- Use advanced search and filtering\n" +
            "- Customize your experience\n\n" +
            "Get started by visiting: %s\n\n" +
            "If you have any questions, don't hesitate to reach out to our support team.\n\n" +
            "Best regards,\n" +
            "Themelyf Dashboard Team",
            firstName, baseUrl
        ));

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
    }
}