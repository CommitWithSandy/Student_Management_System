package com.sms.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeePaymentDto {
    private Long id;

    @NotNull(message = "Student fee ID is required")
    private Long studentFeeId;

    private String receiptNumber;

    @NotNull(message = "Amount paid is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amountPaid;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    @NotBlank(message = "Payment mode is required (CASH, CHEQUE, BANK_TRANSFER, ONLINE, UPI)")
    private String paymentMode;

    private String transactionReference;
    private String remarks;
    private String recordedByName;
    private LocalDateTime createdAt;
}
