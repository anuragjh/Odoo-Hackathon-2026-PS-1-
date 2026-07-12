package com.java.javamainbackend.controller;

import com.java.javamainbackend.dto.request.ChangePasswordRequest;
import com.java.javamainbackend.dto.request.ForgotPasswordRequest;
import com.java.javamainbackend.dto.request.LoginRequest;
import com.java.javamainbackend.dto.request.RefreshTokenRequest;
import com.java.javamainbackend.dto.request.RegisterOrganizationRequest;
import com.java.javamainbackend.dto.request.ResendVerificationRequest;
import com.java.javamainbackend.dto.request.ResetPasswordRequest;
import com.java.javamainbackend.dto.request.SignupRequest;
import com.java.javamainbackend.dto.request.VerifyEmailRequest;
import com.java.javamainbackend.dto.response.ApiResponse;
import com.java.javamainbackend.dto.response.AuthResponse;
import com.java.javamainbackend.dto.response.RegisterOrganizationResponse;
import com.java.javamainbackend.dto.response.UserResponse;
import com.java.javamainbackend.security.UserPrincipal;
import com.java.javamainbackend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register-organization")
    public ResponseEntity<ApiResponse<RegisterOrganizationResponse>> registerOrganization(
            @Valid @RequestBody RegisterOrganizationRequest request) {
        RegisterOrganizationResponse data = authService.registerOrganization(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(
                "Organization registered successfully. Please verify the admin email before logging in.", data));
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserResponse>> signup(@Valid @RequestBody SignupRequest request) {
        UserResponse data = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(
                "Account created. Please verify your email; an administrator must approve your account before you can log in.",
                data));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.of("Login successful", authService.login(request)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.of("Token refreshed", authService.refresh(request.refreshToken())));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.of("Logged out successfully"));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmailByLink(@RequestParam("token") String token) {
        return ResponseEntity.ok(ApiResponse.of(authService.verifyEmail(token)));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return ResponseEntity.ok(ApiResponse.of(authService.verifyEmail(request.token())));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerification(request.email());
        return ResponseEntity.ok(ApiResponse.of(
                "If an account with that email exists and is unverified, a new verification email has been sent."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.email());
        return ResponseEntity.ok(ApiResponse.of(
                "If an account with that email exists, a password reset email has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(ApiResponse.of("Password reset successfully. Please log in with your new password."));
    }

    //  Authenticated endpoints

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.of("Current user", UserResponse.from(principal.getUser())));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@AuthenticationPrincipal UserPrincipal principal,
                                                            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.of(
                "Password changed successfully. All sessions have been revoked - please log in again."));
    }
}
