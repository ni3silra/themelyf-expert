package com.themelyf.dashboard.config;

import com.themelyf.dashboard.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        authProvider.setHideUserNotFoundExceptions(false);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler() {
        return (request, response, authentication) -> {
            String redirectUrl = request.getParameter("redirectUrl");
            if (redirectUrl != null && !redirectUrl.isEmpty()) {
                response.sendRedirect(redirectUrl);
            } else {
                response.sendRedirect("/dashboard");
            }
        };
    }

    @Bean
    public AuthenticationFailureHandler authenticationFailureHandler() {
        return (request, response, exception) -> {
            String username = request.getParameter("username");
            String errorMessage = "Invalid username or password";
            
            if (exception.getMessage().contains("locked")) {
                errorMessage = "Account is temporarily locked due to multiple failed login attempts";
            } else if (exception.getMessage().contains("disabled")) {
                errorMessage = "Account is disabled";
            } else if (exception.getMessage().contains("expired")) {
                errorMessage = "Account has expired";
            }
            
            response.sendRedirect("/login?error=true&message=" + 
                java.net.URLEncoder.encode(errorMessage, "UTF-8") + 
                "&username=" + (username != null ? username : ""));
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                // Public endpoints
                .requestMatchers(
                    "/login", "/register", "/forgot-password", "/reset-password",
                    "/verify-otp", "/resend-otp",
                    "/css/**", "/js/**", "/images/**", "/sw.js",
                    "/h2-console/**",
                    "/api/public/**"
                ).permitAll()
                
                // Admin only endpoints
                .requestMatchers("/admin/**", "/api/admin/**").hasRole("ADMIN")
                
                // Moderator and Admin endpoints
                .requestMatchers("/moderate/**", "/api/moderate/**").hasAnyRole("MODERATOR", "ADMIN")
                
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .usernameParameter("username")
                .passwordParameter("password")
                .successHandler(authenticationSuccessHandler())
                .failureHandler(authenticationFailureHandler())
                .permitAll()
            )
            
            .logout(logout -> logout
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                .logoutSuccessUrl("/login?logout=true")
                .deleteCookies("JSESSIONID")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .permitAll()
            )
            
            .rememberMe(remember -> remember
                .key("uniqueAndSecret")
                .tokenValiditySeconds(86400) // 24 hours
                .userDetailsService(userDetailsService)
            )
            
            .sessionManagement(session -> session
                .maximumSessions(3)
                .maxSessionsPreventsLogin(false)
                .and()
                .sessionFixation().migrateSession()
            )
            
            .exceptionHandling(exceptions -> exceptions
                .accessDeniedPage("/access-denied")
            )
            
            .headers(headers -> headers
                .frameOptions().sameOrigin() // For H2 console
                .contentTypeOptions().and()
                .xssProtection().and()
                .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                    .maxAgeInSeconds(31536000)
                    .includeSubDomains(true)
                )
            )
            
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/h2-console/**", "/api/**")
            );

        return http.build();
    }
}