package com.vrithi.campus_platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CampusPlatformApplication {
	public static void main(String[] args) {
		SpringApplication.run(CampusPlatformApplication.class, args);
	}
}