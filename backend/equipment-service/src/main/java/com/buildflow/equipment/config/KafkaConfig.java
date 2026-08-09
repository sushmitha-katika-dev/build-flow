package com.buildflow.equipment.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic equipmentAssignedTopic() {
        return TopicBuilder.name("equipment-assigned")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic equipmentMaintenanceCompletedTopic() {
        return TopicBuilder.name("equipment-maintenance-completed")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
