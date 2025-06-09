FROM maven:3.9.9-eclipse-temurin-24 AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:24
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-Dspring.profiles.active=docker", "-jar", "app.jar"]