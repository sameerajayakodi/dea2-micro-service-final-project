package com.wms.customer_management_service;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Base test class for all Customer Management Service tests.
 * Provides shared configuration: loads the Spring context
 * and activates the 'test' profile for test-specific settings.
 */
@SpringBootTest
@ActiveProfiles("test")
public abstract class BaseTest {
}
