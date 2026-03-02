package com.wms.inventory_management_service.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Logs Eureka/Discovery state at startup so we can see why registration may fail.
 * Look for "[EUREKA-DIAG]" in container logs.
 */
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class EurekaDiagnosticsRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(EurekaDiagnosticsRunner.class);

    private final Environment env;
    private final ObjectProvider<DiscoveryClient> discoveryClientProvider;

    public EurekaDiagnosticsRunner(Environment env, ObjectProvider<DiscoveryClient> discoveryClientProvider) {
        this.env = env;
        this.discoveryClientProvider = discoveryClientProvider;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("[EUREKA-DIAG] ========== Eureka/Discovery diagnostics ==========");
        log.info("[EUREKA-DIAG] spring.application.name = {}", env.getProperty("spring.application.name"));
        log.info("[EUREKA-DIAG] eureka.client.enabled = {}", env.getProperty("eureka.client.enabled", "not set (default true)"));
        log.info("[EUREKA-DIAG] eureka.client.serviceUrl.defaultZone = {}", env.getProperty("eureka.client.serviceUrl.defaultZone", "NOT SET"));
        log.info("[EUREKA-DIAG] eureka.client.register-with-eureka = {}", env.getProperty("eureka.client.register-with-eureka", "not set"));
        log.info("[EUREKA-DIAG] spring.cloud.discovery.enabled = {}", env.getProperty("spring.cloud.discovery.enabled", "not set"));
        log.info("[EUREKA-DIAG] server.port = {}", env.getProperty("server.port"));
        log.info("[EUREKA-DIAG] eureka.instance.ip-address = {}", env.getProperty("eureka.instance.ip-address", "not set"));
        if (discoveryClientProvider.getIfAvailable() != null) {
            log.info("[EUREKA-DIAG] DiscoveryClient bean PRESENT - Eureka client is active.");
        } else {
            log.warn("[EUREKA-DIAG] DiscoveryClient bean MISSING - Eureka client did NOT start. Check autoconfiguration / dependencies.");
        }
        log.info("[EUREKA-DIAG] ======================================================");
    }
}
