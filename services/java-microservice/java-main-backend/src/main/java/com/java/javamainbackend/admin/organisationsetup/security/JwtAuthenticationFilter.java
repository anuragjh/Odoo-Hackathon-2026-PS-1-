package com.java.javamainbackend.admin.organisationsetup.security;

import com.java.javamainbackend.admin.organisationsetup.entity.User;
import com.java.javamainbackend.admin.organisationsetup.entity.enums.AccountStatus;
import com.java.javamainbackend.admin.organisationsetup.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (!StringUtils.hasText(header) || !header.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(BEARER_PREFIX.length()).trim();

        try {
            String subject = jwtService.parse(token).getSubject();
            resolveUser(subject)
                    .filter(user -> user.getAccountStatus() == AccountStatus.ACTIVE)
                    .ifPresent(user -> authenticate(user, request));
        } catch (Exception ignored) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private Optional<User> resolveUser(String subject) {
        if (!StringUtils.hasText(subject)) {
            return Optional.empty();
        }
        try {
            return userRepository.findById(UUID.fromString(subject));
        } catch (IllegalArgumentException ex) {
            return userRepository.findByEmailIgnoreCase(subject);
        }
    }

    private void authenticate(User user, HttpServletRequest request) {
        AuthPrincipal principal = new AuthPrincipal(
                user.getId(), user.getEmail(), user.getRole(), user.getOrganizationId());

        var authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
        var authentication = new UsernamePasswordAuthenticationToken(principal, null, List.of(authority));
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
