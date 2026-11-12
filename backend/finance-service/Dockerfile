FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN printf '%s\n' \
  '#!/bin/sh' \
  'set -e' \
  'if [ -n "$KAFKA_CA_CERT" ]; then' \
  '  printf "%b\n" "$KAFKA_CA_CERT" > /tmp/kafka-ca.pem' \
  '  export SPRING_KAFKA_PROPERTIES_SSL_TRUSTSTORE_TYPE=PEM' \
  '  export SPRING_KAFKA_PROPERTIES_SSL_TRUSTSTORE_LOCATION=/tmp/kafka-ca.pem' \
  'fi' \
  'if [ -n "$KAFKA_PASSWORD" ]; then' \
  '  export SPRING_KAFKA_SECURITY_PROTOCOL=SASL_SSL' \
  '  MECH="${KAFKA_SASL_MECHANISM:-SCRAM-SHA-256}"' \
  '  export SPRING_KAFKA_PROPERTIES_SASL_MECHANISM="$MECH"' \
  '  if [ "$MECH" = "PLAIN" ]; then' \
  '    MOD="org.apache.kafka.common.security.plain.PlainLoginModule"' \
  '  else' \
  '    MOD="org.apache.kafka.common.security.scram.ScramLoginModule"' \
  '  fi' \
  '  export SPRING_KAFKA_PROPERTIES_SASL_JAAS_CONFIG="${MOD} required username=\"${KAFKA_USERNAME:-avnadmin}\" password=\"${KAFKA_PASSWORD}\";"' \
  'fi' \
  'exec java $JAVA_OPTS -Dserver.port=${PORT:-8086} -jar /app/app.jar' \
  > /app/entrypoint.sh && chmod +x /app/entrypoint.sh
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"
EXPOSE 8086
ENTRYPOINT ["/app/entrypoint.sh"]
