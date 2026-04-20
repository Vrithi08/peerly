package com.vrithi.campus_platform.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailParserService {

    public Map<String, String> parseAmritaEmail(String email) {
        Map<String, String> result = new HashMap<>();

        try {
            // Extract prefix before @
            // e.g. cb.en.p2cse23001
            String prefix = email.split("@")[0];
            String[] parts = prefix.split("\\.");

            // parts[0] = cb
            // parts[1] = en
            // parts[2] = p2cse23001

            if (parts.length < 3) {
                return result;
            }

            String codePart = parts[2]; // e.g. p2cse23001

            // Extract degree type — first character
            char degreeChar = codePart.charAt(0);
            String degreeType = (degreeChar == 'p') ? "PG" : "UG";
            result.put("degreeType", degreeType);

            // Extract duration — second character
            String duration = String.valueOf(codePart.charAt(1));
            result.put("duration", duration + " years");

            // Extract department, year, roll — rest of the string after first 2 chars
            // e.g. cse23001
            String remaining = codePart.substring(2); // cse23001

            // Department is all letters at the start
            // Year is next 2 digits
            // Roll is last 3 digits
            StringBuilder deptBuilder = new StringBuilder();
            int i = 0;
            while (i < remaining.length() && Character.isLetter(remaining.charAt(i))) {
                deptBuilder.append(remaining.charAt(i));
                i++;
            }
            String department = deptBuilder.toString().toUpperCase(); // CSE
            result.put("department", department);

            // Next 2 digits = year
            if (i + 2 <= remaining.length()) {
                String yearShort = remaining.substring(i, i + 2); // 23
                result.put("batch", "20" + yearShort); // 2023
                i += 2;
            }

            // Last 3 digits = roll number info
            if (i + 3 <= remaining.length()) {
                String rollFull = remaining.substring(i, i + 3); // 001
                char sectionDigit = rollFull.charAt(0);
                String roll = rollFull.substring(1); // 01

                // Section mapping
                String section;
                switch (sectionDigit) {
                    case '0': section = "A"; break;
                    case '1': section = "B"; break;
                    case '2': section = "C"; break;
                    case '3': section = "D"; break;
                    case '4': section = "E"; break;
                    default: section = String.valueOf(sectionDigit);
                }
                result.put("section", section);
                result.put("rollNumber", roll);
            }

        } catch (Exception e) {
            // If parsing fails, return empty map — registration still proceeds
            System.out.println("Email parsing failed: " + e.getMessage());
        }

        return result;
    }
}