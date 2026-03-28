package org.example.backenduvote;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class BackendUVoteApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendUVoteApplication.class, args);
    }

}
