package com.buildflow.inventory.service;

import com.buildflow.inventory.entity.Stock;
import com.buildflow.inventory.repository.StockRepository;
import com.buildflow.inventory.service.impl.StockServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StockServiceImplTest {

    @Mock
    private StockRepository stockRepository;
    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private StockServiceImpl stockService;

    private Stock stock;

    @BeforeEach
    void setUp() {
        stock = Stock.builder()
                .id(1L)
                .materialId(1L)
                .projectId(1L)
                .currentStock(BigDecimal.valueOf(100))
                .reorderLevel(BigDecimal.valueOf(20))
                .build();
    }

    @Test
    void processStockIn_Success() {
        when(stockRepository.findByMaterialIdAndProjectId(1L, 1L)).thenReturn(Optional.of(stock));
        when(stockRepository.save(any(Stock.class))).thenReturn(stock);

        stockService.processStockIn(1L, 1L, BigDecimal.valueOf(50));

        assertEquals(0, BigDecimal.valueOf(150).compareTo(stock.getCurrentStock()));
        verify(stockRepository).save(stock);
    }

    @Test
    void processStockOut_Success() {
        when(stockRepository.findByMaterialIdAndProjectId(1L, 1L)).thenReturn(Optional.of(stock));
        when(stockRepository.save(any(Stock.class))).thenReturn(stock);

        stockService.processStockOut(1L, 1L, BigDecimal.valueOf(50));

        assertEquals(0, BigDecimal.valueOf(50).compareTo(stock.getCurrentStock()));
        verify(stockRepository).save(stock);
    }

    @Test
    void processStockOut_InsufficientStock_ThrowsException() {
        when(stockRepository.findByMaterialIdAndProjectId(1L, 1L)).thenReturn(Optional.of(stock));

        assertThrows(IllegalArgumentException.class, () -> {
            stockService.processStockOut(1L, 1L, BigDecimal.valueOf(150));
        });
        
        verify(stockRepository, never()).save(any(Stock.class));
    }
}
