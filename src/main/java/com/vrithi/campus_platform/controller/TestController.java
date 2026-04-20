package com.vrithi.campus_platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/protected")
    public ResponseEntity<?> protectedRoute() {
        return ResponseEntity.ok("You accessed a protected route!");
    }
}