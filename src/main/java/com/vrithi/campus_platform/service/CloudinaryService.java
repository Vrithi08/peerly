package com.vrithi.campus_platform.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadFile(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        String resourceType = "auto";
        
        if (contentType != null) {
            if (contentType.startsWith("video")) {
                resourceType = "video";
            } else if (contentType.startsWith("audio")) {
                resourceType = "video"; // Cloudinary uses "video" for audio files
            } else if (contentType.startsWith("image")) {
                resourceType = "image";
            } else {
                // Documents (PDF, DOCX, etc.) should use "raw" or "auto"
                // Forcing "raw" for known doc extensions if auto fails, but auto is usually good if not image/video.
                // However, Cloudinary "auto" can be flaky with some mobile MIME types.
                resourceType = "auto"; 
            }
        }
        
        System.out.println("Cloudinary Upload Start: Name=" + originalFilename + ", MIME=" + contentType + " -> ResourceType=" + resourceType);
        
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                        "resource_type", resourceType,
                        "folder", "campus_platform/submissions"
                    )
            );
            String url = uploadResult.get("secure_url").toString();
            System.out.println("Cloudinary Upload Success: " + url);
            return url;
        } catch (Exception e) {
            System.err.println("Cloudinary Upload FAILED: " + e.getMessage());
            throw new IOException("Failed to upload file to Cloudinary: " + e.getMessage());
        }
    }
}