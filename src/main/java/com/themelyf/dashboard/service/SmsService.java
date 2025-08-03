package com.themelyf.dashboard.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    @Value("${app.sms.provider:mock}")
    private String smsProvider;

    @Value("${app.sms.api-key:}")
    private String apiKey;

    @Value("${app.sms.sender-id:ThemelyF}")
    private String senderId;

    public void sendOtpSms(String phoneNumber, String otpCode) {
        String message = String.format(
            "Your Themelyf Dashboard OTP code is: %s. This code will expire in 5 minutes. Do not share this code with anyone.",
            otpCode
        );
        
        sendSms(phoneNumber, message);
    }

    public void sendPasswordResetSms(String phoneNumber, String firstName) {
        String message = String.format(
            "Hi %s, your Themelyf Dashboard password has been successfully reset. If you didn't make this change, please contact support immediately.",
            firstName != null ? firstName : "User"
        );
        
        sendSms(phoneNumber, message);
    }

    public void sendWelcomeSms(String phoneNumber, String firstName) {
        String message = String.format(
            "Welcome to Themelyf Dashboard, %s! Your account has been successfully created. Get started at our dashboard portal.",
            firstName != null ? firstName : "User"
        );
        
        sendSms(phoneNumber, message);
    }

    private void sendSms(String phoneNumber, String message) {
        try {
            if ("mock".equalsIgnoreCase(smsProvider)) {
                // Mock SMS service for development/testing
                System.out.println("=== MOCK SMS SERVICE ===");
                System.out.println("To: " + phoneNumber);
                System.out.println("Message: " + message);
                System.out.println("========================");
            } else {
                // In production, integrate with actual SMS provider
                // Examples: Twilio, AWS SNS, etc.
                throw new UnsupportedOperationException("SMS provider not configured: " + smsProvider);
            }
        } catch (Exception e) {
            System.err.println("Failed to send SMS to " + phoneNumber + ": " + e.getMessage());
            throw new RuntimeException("Failed to send SMS");
        }
    }

    public boolean isConfigured() {
        return !"mock".equalsIgnoreCase(smsProvider) && 
               apiKey != null && !apiKey.isEmpty();
    }
}