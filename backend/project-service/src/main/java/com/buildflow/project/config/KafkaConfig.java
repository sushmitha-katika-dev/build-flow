package com.buildflow.project.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import com.buildflow.project.constants.ProjectConstants;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic projectCreatedTopic() {
        return TopicBuilder.name(ProjectConstants.PROJECT_CREATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
