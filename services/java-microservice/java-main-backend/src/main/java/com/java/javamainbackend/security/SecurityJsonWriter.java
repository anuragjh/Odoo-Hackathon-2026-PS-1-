package com.java.javamainbackend.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.time.Instant;

final class SecurityJsonWriter {

    private SecurityJsonWriter() {
    }

    static void write(HttpServletResponse response, HttpStatus status,
                      String error, String message, String path) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json;charset=UTF-8");
        String body = "{\"success\":false,\"status\":%d,\"error\":\"%s\",\"message\":\"%s\",\"path\":\"%s\",\"timestamp\":\"%s\"}"
                .formatted(status.value(), escape(error), escape(message), escape(path), Instant.now());
        response.getWriter().write(body);
    }

    private static String escape(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
