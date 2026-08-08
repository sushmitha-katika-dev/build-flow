package com.buildflow.inventory.config;

import com.buildflow.inventory.constants.InventoryConstants;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic materialCreatedTopic() {
        return TopicBuilder.name(InventoryConstants.MATERIAL_CREATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic purchaseOrderedTopic() {
        return TopicBuilder.name(InventoryConstants.PURCHASE_ORDERED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic stockUpdatedTopic() {
        return TopicBuilder.name(InventoryConstants.STOCK_UPDATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
