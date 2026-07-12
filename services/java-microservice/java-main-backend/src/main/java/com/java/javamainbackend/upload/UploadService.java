package com.java.javamainbackend.upload;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.java.javamainbackend.admin.organisationsetup.common.exception.BadRequestException;
import java.io.IOException;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UploadService {

    private final Cloudinary cloudinary;

    public UploadService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public UploadResponse upload(MultipartFile file, String folder, String resourceType) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file provided");
        }
        boolean configured = cloudinary.config.cloudName != null && !cloudinary.config.cloudName.isBlank();
        if (!configured) {
            throw new BadRequestException("File uploads are not configured on the server");
        }
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("folder", folder, "resource_type", resourceType));
            return new UploadResponse(
                    String.valueOf(result.get("secure_url")),
                    String.valueOf(result.get("public_id")),
                    String.valueOf(result.get("resource_type")));
        } catch (IOException ex) {
            throw new BadRequestException("File upload failed");
        }
    }
}
