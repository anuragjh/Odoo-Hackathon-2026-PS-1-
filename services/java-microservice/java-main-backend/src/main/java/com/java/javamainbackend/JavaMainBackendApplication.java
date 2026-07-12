package com.java.javamainbackend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.FullyQualifiedAnnotationBeanNameGenerator;

@SpringBootApplication
@ConfigurationPropertiesScan
public class JavaMainBackendApplication {

    public static void main(String[] args) {
        loadDotenv();
        SpringApplication app = new SpringApplication(JavaMainBackendApplication.class);
        // The auth module and the admin/organisationsetup module contain classes with
        // identical simple names (UserRepository, JwtService, SecurityConfig, ...).
        // Fully-qualified bean names avoid ConflictingBeanDefinitionException across them.
        app.setBeanNameGenerator(new FullyQualifiedAnnotationBeanNameGenerator());
        app.run(args);
    }

    /**
     * Loads .env into system properties so ${VAR} placeholders resolve.
     * Real OS environment variables always take precedence over .env values.
     */
    private static void loadDotenv() {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .ignoreIfMalformed()
                .load();
        dotenv.entries().forEach(entry -> {
            if (System.getenv(entry.getKey()) == null && System.getProperty(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });
    }
}
