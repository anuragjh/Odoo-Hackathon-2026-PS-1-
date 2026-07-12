package com.java.javamainbackend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignupRequest(

        @NotBlank(message = "Organization code is required")
        @Size(min = 3, max = 30, message = "Organization code must be 3-30 characters")
        String organizationCode,

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 120, message = "Name must be 2-120 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        @Size(max = 255, message = "Email must be at most 255 characters")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72, message = "Password must be 8-72 characters")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$",
                message = "Password must contain at least one uppercase letter, one lowercase letter, one digit and one special character")
        String password,

        @Pattern(regexp = "^[+0-9][0-9 ()\\-]{6,24}$",
                message = "Phone must be a valid phone number")
        String phone
) {
}
