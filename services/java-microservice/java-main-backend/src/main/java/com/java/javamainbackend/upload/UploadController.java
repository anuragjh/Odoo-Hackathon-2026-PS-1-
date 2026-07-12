package com.java.javamainbackend.upload;

import com.java.javamainbackend.admin.organisationsetup.common.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/uploads")
public class UploadController {

    private final UploadService uploadService;

    public UploadController(UploadService uploadService) {
        this.uploadService = uploadService;
    }

    @PostMapping("/image")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        return ApiResponse.ok("Image uploaded", uploadService.upload(file, "assetflow/images", "image"));
    }

    @PostMapping("/document")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UploadResponse> uploadDocument(@RequestParam("file") MultipartFile file) {
        return ApiResponse.ok("Document uploaded", uploadService.upload(file, "assetflow/documents", "auto"));
    }

    @PostMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UploadResponse> uploadProfile(@RequestParam("file") MultipartFile file) {
        return ApiResponse.ok("Profile image uploaded", uploadService.upload(file, "assetflow/profiles", "image"));
    }
}
