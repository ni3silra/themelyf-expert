package com.themelyf.dashboard.service;

import com.themelyf.dashboard.model.User;
import com.themelyf.dashboard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(username, username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        if (!user.isEnabled()) {
            throw new UsernameNotFoundException("User account is disabled: " + username);
        }

        if (!user.isAccountNonLocked()) {
            throw new UsernameNotFoundException("User account is locked: " + username);
        }

        if (!user.isAccountNonExpired()) {
            throw new UsernameNotFoundException("User account has expired: " + username);
        }

        if (!user.isCredentialsNonExpired()) {
            throw new UsernameNotFoundException("User credentials have expired: " + username);
        }

        return user;
    }
}