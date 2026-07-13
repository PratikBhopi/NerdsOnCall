package com.nerdsoncall.security;

import com.nerdsoncall.service.UserService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {

        try {
            final String requestTokenHeader = request.getHeader("Authorization");
            String username = null;
            String jwtToken = null;

<<<<<<< HEAD
            // Extract JWT token from Authorization header
            if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
                jwtToken = requestTokenHeader.substring(7);

                try {
                    username = jwtUtil.extractUsername(jwtToken);
                } catch (ExpiredJwtException e) {
                    log.warn("JWT token has expired for request: {}", request.getRequestURI());
                    setErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "JWT token has expired");
                    return;
                } catch (MalformedJwtException e) {
                    log.warn("Malformed JWT token for request: {}", request.getRequestURI());
                    setErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT token format");
                    return;
                } catch (SignatureException e) {
                    log.warn("Invalid JWT signature for request: {}", request.getRequestURI());
                    setErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT signature");
                    return;
                } catch (IllegalArgumentException e) {
                    log.warn("JWT token compact of handler are invalid for request: {}", request.getRequestURI());
                    setErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT token");
                    return;
                } catch (Exception e) {
                    log.error("Unexpected error extracting username from JWT token for request: {}",
                        request.getRequestURI(), e);
                    setErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "JWT processing error");
                    return;
                }
            } else if (requestTokenHeader != null && !requestTokenHeader.startsWith("Bearer ")) {
                log.warn("Authorization header does not start with 'Bearer ' for request: {}", request.getRequestURI());
=======
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwtToken);
            } catch (Exception e) {
                log.debug("Invalid or expired JWT: {}", e.getMessage());
>>>>>>> bd0b94a14d85d58fade5e8005cca5953e94e08b2
            }

            // Validate token and set authentication context
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    UserDetails userDetails = userService.loadUserByUsername(username);

                    if (jwtUtil.validateToken(jwtToken, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);

                        log.debug("Authentication set for user: {} on request: {}", username, request.getRequestURI());
                    } else {
                        log.warn("JWT token validation failed for user: {} on request: {}", username, request.getRequestURI());
                    }
                } catch (UsernameNotFoundException e) {
                    log.warn("User not found: {} for request: {}", username, request.getRequestURI());
                } catch (Exception e) {
                    log.error("Error loading user details for user: {} on request: {}",
                        username, request.getRequestURI(), e);
                }
            }

        } catch (Exception e) {
            log.error("Unexpected error in JWT authentication filter for request: {}",
                request.getRequestURI(), e);
            // Don't block the request, let it proceed without authentication
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Set error response for authentication failures
     */
    private void setErrorResponse(HttpServletResponse response, int status, String message) {
        try {
            response.setStatus(status);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");

            String jsonResponse = String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"Unauthorized\",\"message\":\"%s\",\"path\":\"%s\"}",
                java.time.LocalDateTime.now().toString(),
                status,
                message,
                "JWT Authentication"
            );

            response.getWriter().write(jsonResponse);
            response.getWriter().flush();

        } catch (IOException e) {
            log.error("Error writing authentication error response: {}", e.getMessage());
        }
    }
}