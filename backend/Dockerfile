# Backend Dockerfile
FROM maven:3.9.6-eclipse-temurin-21
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY . .
RUN mvn package -DskipTests

EXPOSE 8080
CMD ["java", "-jar", "target/semantic-visualizer-0.0.1-SNAPSHOT.jar"]