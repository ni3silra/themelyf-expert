package com.themelyf.dashboard.controller;

import com.themelyf.dashboard.model.User;
import com.themelyf.dashboard.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@Controller
public class AuthController {

    @Autowired
    private AuthenticationService authenticationService;

    @GetMapping("/login")
    public String loginPage(@RequestParam(value = "error", required = false) String error,
                           @RequestParam(value = "logout", required = false) String logout,
                           @RequestParam(value = "message", required = false) String message,
                           Model model) {
        
        if (error != null) {
            model.addAttribute("error", true);
            if (message != null) {
                model.addAttribute("message", message);
            }
        }
        
        if (logout != null) {
            model.addAttribute("logout", true);
        }
        
        return "login";
    }

    @GetMapping("/register")
    public String registerPage(Model model) {
        model.addAttribute("user", new User());
        return "register";
    }

    @PostMapping("/register")
    public String registerUser(@ModelAttribute User user, Model model) {
        try {
            authenticationService.registerUser(user);
            return "redirect:/login?registered=true";
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
            model.addAttribute("user", user);
            return "register";
        }
    }

    @GetMapping("/forgot-password")
    public String forgotPasswordPage() {
        return "forgot-password";
    }

    @PostMapping("/forgot-password")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = request.get("email");
            boolean success = authenticationService.initiatePasswordReset(email);
            
            response.put("success", true);
            response.put("message", "If an account with this email exists, you will receive a password reset link shortly.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "An error occurred. Please try again.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/reset-password")
    public String resetPasswordPage(@RequestParam("token") String token, Model model) {
        model.addAttribute("token", token);
        return "reset-password";
    }

    @PostMapping("/reset-password")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = request.get("token");
            String newPassword = request.get("password");
            
            boolean success = authenticationService.resetPassword(token, newPassword);
            
            if (success) {
                response.put("success", true);
                response.put("message", "Password reset successful. You can now login with your new password.");
                response.put("redirectUrl", "/login");
            } else {
                response.put("success", false);
                response.put("message", "Invalid or expired reset token. Please request a new password reset.");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "An error occurred. Please try again.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/change-password")
    public String changePasswordPage() {
        return "change-password";
    }

    @PostMapping("/change-password")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> request,
                                                             Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            User currentUser = authenticationService.getCurrentUser();
            if (currentUser == null) {
                response.put("success", false);
                response.put("message", "User not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            boolean success = authenticationService.changePassword(
                currentUser.getId(), currentPassword, newPassword);
            
            if (success) {
                response.put("success", true);
                response.put("message", "Password changed successfully.");
            } else {
                response.put("success", false);
                response.put("message", "Current password is incorrect.");
            }
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "An error occurred. Please try again.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // OTP API endpoints
    @PostMapping("/api/auth/send-otp")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String username = request.get("username");
            String method = request.get("method");
            
            boolean success = authenticationService.sendOtp(username, method);
            
            if (success) {
                response.put("success", true);
                response.put("message", "OTP sent successfully");
            } else {
                response.put("success", false);
                response.put("message", "Failed to send OTP. Please check your username and try again.");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "An error occurred. Please try again.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/api/auth/verify-otp")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> request,
                                                        HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String username = request.get("username");
            String otpCode = request.get("otpCode");
            
            // First verify the OTP
            boolean otpValid = authenticationService.verifyOtp(username, otpCode);
            
            if (otpValid) {
                // If OTP is valid, authenticate the user
                Authentication auth = authenticationService.authenticateUser(username, null, otpCode);
                
                if (auth != null && auth.isAuthenticated()) {
                    // Create session
                    HttpSession session = httpRequest.getSession(true);
                    session.setAttribute("SPRING_SECURITY_CONTEXT", 
                        org.springframework.security.core.context.SecurityContextHolder.getContext());
                    
                    response.put("success", true);
                    response.put("message", "Login successful");
                    response.put("redirectUrl", "/dashboard");
                } else {
                    response.put("success", false);
                    response.put("message", "Authentication failed");
                }
            } else {
                response.put("success", false);
                response.put("message", "Invalid or expired OTP code");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "An error occurred during authentication");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/access-denied")
    public String accessDenied() {
        return "access-denied";
    }

    @PostMapping("/logout")
    public String logout() {
        authenticationService.logout();
        return "redirect:/login?logout=true";
    }
}