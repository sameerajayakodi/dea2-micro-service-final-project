# Use Eclipse Temurin Java 21 as base image
FROM eclipse-temurin:21-jdk-jammy as builder

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# --- Runtime image ---
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copy built jar from builder image
COPY --from=builder /app/target/customer_management_service-0.0.1-SNAPSHOT.jar ./app.jar

EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
