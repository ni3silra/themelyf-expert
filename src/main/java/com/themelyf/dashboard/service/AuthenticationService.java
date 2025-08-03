package com.themelyf.dashboard.service;

import com.themelyf.dashboard.model.User;
import com.themelyf.dashboard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class AuthenticationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;

    private final SecureRandom random = new SecureRandom();

    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setEnabled(true);
        user.setRole(User.Role.USER);
        
        User savedUser = userRepository.save(user);
        
        // Send email verification
        sendEmailVerification(savedUser);
        
        return savedUser;
    }

    public Authentication authenticateUser(String username, String password, String otpCode) {
        try {
            User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

            // Check if account is locked
            if (!user.isAccountNonLocked()) {
                throw new BadCredentialsException("Account is locked");
            }

            // Verify password
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );

            // If 2FA is enabled, verify OTP
            if (user.isTwoFactorEnabled()) {
                if (otpCode == null || otpCode.isEmpty()) {
                    throw new BadCredentialsException("OTP code required");
                }
                
                if (!user.isOtpValid(otpCode)) {
                    user.incrementFailedLoginAttempts();
                    userRepository.save(user);
                    throw new BadCredentialsException("Invalid OTP code");
                }
                
                // Clear OTP after successful verification
                user.setOtpCode(null);
                user.setOtpExpiry(null);
            }

            // Update last login and reset failed attempts
            user.setLastLogin(LocalDateTime.now());
            user.resetFailedLoginAttempts();
            userRepository.save(user);

            // Set authentication in context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            return authentication;

        } catch (AuthenticationException e) {
            // Update failed login attempts
            userRepository.findByUsernameOrEmail(username, username)
                .ifPresent(user -> {
                    user.incrementFailedLoginAttempts();
                    userRepository.save(user);
                });
            throw e;
        }
    }

    public boolean sendOtp(String usernameOrEmail, String method) {
        Optional<User> userOpt = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);
        
        if (userOpt.isEmpty()) {
            return false; // Don't reveal if user exists
        }
        
        User user = userOpt.get();
        String otpCode = generateOtpCode();
        
        user.setOtpCode(otpCode);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5)); // OTP expires in 5 minutes
        userRepository.save(user);
        
        try {
            if ("email".equalsIgnoreCase(method)) {
                emailService.sendOtpEmail(user.getEmail(), otpCode, user.getFirstName());
            } else if ("sms".equalsIgnoreCase(method) && user.getPhoneNumber() != null) {
                smsService.sendOtpSms(user.getPhoneNumber(), otpCode);
            } else {
                return false;
            }
            return true;
        } catch (Exception e) {
            // Log error but don't reveal details
            return false;
        }
    }

    public boolean verifyOtp(String usernameOrEmail, String otpCode) {
        Optional<User> userOpt = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);
        
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        
        if (user.isOtpValid(otpCode)) {
            user.setOtpCode(null);
            user.setOtpExpiry(null);
            userRepository.save(user);
            return true;
        }
        
        return false;
    }

    public boolean changePassword(Long userId, String currentPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return false;
        }
        
        // Ensure new password is different
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new RuntimeException("New password must be different from current password");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setCredentialsNonExpired(true);
        userRepository.save(user);
        
        // Send password change notification
        emailService.sendPasswordChangeNotification(user.getEmail(), user.getFirstName());
        
        return true;
    }

    public boolean initiatePasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return false; // Don't reveal if email exists
        }
        
        User user = userOpt.get();
        String resetToken = UUID.randomUUID().toString();
        
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpiry(LocalDateTime.now().plusHours(1)); // Token expires in 1 hour
        userRepository.save(user);
        
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), resetToken, user.getFirstName());
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean resetPassword(String token, String newPassword) {
        Optional<User> userOpt = userRepository.findByPasswordResetToken(token);
        
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        
        if (!user.isPasswordResetTokenValid(token)) {
            return false;
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        user.setCredentialsNonExpired(true);
        user.resetFailedLoginAttempts(); // Reset any account locks
        userRepository.save(user);
        
        // Send password reset confirmation
        emailService.sendPasswordResetConfirmation(user.getEmail(), user.getFirstName());
        
        return true;
    }

    public boolean enableTwoFactor(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        user.setTwoFactorEnabled(true);
        user.setOtpSecret(generateOtpSecret());
        userRepository.save(user);
        
        return true;
    }

    public boolean disableTwoFactor(Long userId, String currentPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        
        // Verify current password before disabling 2FA
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return false;
        }
        
        user.setTwoFactorEnabled(false);
        user.setOtpSecret(null);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        
        return true;
    }

    public void sendEmailVerification(User user) {
        String verificationToken = UUID.randomUUID().toString();
        // You might want to store this token in the database
        emailService.sendEmailVerification(user.getEmail(), verificationToken, user.getFirstName());
    }

    public boolean verifyEmail(String token) {
        // Implementation depends on how you store verification tokens
        // For now, assume token is valid and update user
        return true;
    }

    private String generateOtpCode() {
        return String.format("%06d", random.nextInt(999999));
    }

    private String generateOtpSecret() {
        byte[] bytes = new byte[16];
        random.nextBytes(bytes);
        return java.util.Base64.getEncoder().encodeToString(bytes);
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getName().equals("anonymousUser")) {
            return userRepository.findByUsername(authentication.getName()).orElse(null);
        }
        return null;
    }

    public boolean isUserLoggedIn() {
        return getCurrentUser() != null;
    }

    public void logout() {
        SecurityContextHolder.clearContext();
    }
}