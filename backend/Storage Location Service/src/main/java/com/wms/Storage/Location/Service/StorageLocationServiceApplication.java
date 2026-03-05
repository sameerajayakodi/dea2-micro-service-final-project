package com.wms.Storage.Location.Service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class StorageLocationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(StorageLocationServiceApplication.class, args);
	}

}
