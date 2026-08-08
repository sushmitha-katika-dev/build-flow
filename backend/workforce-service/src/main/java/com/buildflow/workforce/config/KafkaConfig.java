package com.buildflow.workforce.config;

import com.buildflow.workforce.constants.WorkforceConstants;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic labourOnboardedTopic() {
        return TopicBuilder.name(WorkforceConstants.LABOUR_ONBOARDED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic attendanceLoggedTopic() {
        return TopicBuilder.name(WorkforceConstants.ATTENDANCE_LOGGED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic wageProcessedTopic() {
        return TopicBuilder.name(WorkforceConstants.WAGE_PROCESSED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
