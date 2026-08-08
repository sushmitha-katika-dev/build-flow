package com.buildflow.inventory.service;

import com.buildflow.inventory.constants.InventoryConstants;
import com.buildflow.inventory.dto.request.StockCreateRequest;
import com.buildflow.inventory.dto.response.StockResponse;
import com.buildflow.inventory.entity.Stock;
import com.buildflow.inventory.mapper.StockMapper;
import com.buildflow.inventory.repository.MaterialRepository;
import com.buildflow.inventory.repository.StockRepository;
import com.buildflow.inventory.service.impl.StockServiceImpl;
import com.buildflow.inventory.validator.StockValidator;
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
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StockServiceImplTest {

    @Mock
    private StockRepository stockRepository;

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private StockMapper stockMapper;

    @Mock
    private StockValidator stockValidator;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private StockServiceImpl stockService;

    private StockCreateRequest request;
    private Stock stock;
    private StockResponse response;

    @BeforeEach
    void setUp() {
        request = new StockCreateRequest();
        request.setMaterialId(1L);
        request.setProjectId(100L);
        request.setQuantity(BigDecimal.valueOf(500));

        stock = new Stock();
        stock.setId(1L);
        stock.setMaterialId(1L);
        stock.setProjectId(100L);
        stock.setCurrentStock(BigDecimal.valueOf(500));
        stock.setReorderLevel(BigDecimal.ZERO);

        response = new StockResponse();
        response.setId(1L);
        response.setCurrentStock(BigDecimal.valueOf(500));
    }

    @Test
    void initializeStock_Success() {
        when(materialRepository.existsById(1L)).thenReturn(true);
        doNothing().when(stockValidator).validateCreateRequest(any());
        when(stockMapper.toEntity(any())).thenReturn(stock);
        when(stockRepository.save(any(Stock.class))).thenReturn(stock);
        when(stockMapper.toResponse(any(Stock.class))).thenReturn(response);

        StockResponse result = stockService.initializeStock(request);

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(500), result.getCurrentStock());
    }

    @Test
    void getStockById_Success() {
        when(stockRepository.findById(1L)).thenReturn(Optional.of(stock));
        when(stockMapper.toResponse(stock)).thenReturn(response);

        StockResponse result = stockService.getStockById(1L);

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(500), result.getCurrentStock());
    }
}
