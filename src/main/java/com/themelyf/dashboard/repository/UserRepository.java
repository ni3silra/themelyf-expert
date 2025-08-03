package com.themelyf.dashboard.repository;

import com.themelyf.dashboard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByUsernameOrEmail(String username, String email);
    
    Optional<User> findByPasswordResetToken(String token);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(User.Role role);
    
    List<User> findByEnabledTrue();
    
    List<User> findByEmailVerifiedTrue();
    
    List<User> findByTwoFactorEnabledTrue();
    
    @Query("SELECT u FROM User u WHERE u.accountLockedUntil IS NOT NULL AND u.accountLockedUntil > :now")
    List<User> findLockedUsers(@Param("now") LocalDateTime now);
    
    @Query("SELECT u FROM User u WHERE u.lastLogin IS NULL OR u.lastLogin < :date")
    List<User> findInactiveUsers(@Param("date") LocalDateTime date);
    
    @Query("SELECT u FROM User u WHERE u.failedLoginAttempts >= :attempts")
    List<User> findUsersWithFailedAttempts(@Param("attempts") int attempts);
    
    @Modifying
    @Query("UPDATE User u SET u.lastLogin = :lastLogin WHERE u.id = :userId")
    void updateLastLogin(@Param("userId") Long userId, @Param("lastLogin") LocalDateTime lastLogin);
    
    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = 0, u.accountLockedUntil = NULL WHERE u.id = :userId")
    void resetFailedLoginAttempts(@Param("userId") Long userId);
    
    @Modifying
    @Query("UPDATE User u SET u.password = :password WHERE u.id = :userId")
    void updatePassword(@Param("userId") Long userId, @Param("password") String password);
    
    @Modifying
    @Query("UPDATE User u SET u.emailVerified = true WHERE u.id = :userId")
    void verifyEmail(@Param("userId") Long userId);
    
    @Modifying
    @Query("UPDATE User u SET u.phoneVerified = true WHERE u.id = :userId")
    void verifyPhone(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startDate")
    long countNewUsersAfter(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.lastLogin >= :startDate")
    long countActiveUsersAfter(@Param("startDate") LocalDateTime startDate);
}