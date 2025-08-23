package com.insurancemegacorp.imcmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ImcManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ImcManagerApplication.class, args);
    }

}