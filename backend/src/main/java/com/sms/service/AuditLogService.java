package com.sms.service;

import com.sms.entity.AuditLog;
import com.sms.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(Long userId, String username, String action, String entity, String entityId, String details, HttpServletRequest request) {
        try {
            String clientIp = "127.0.0.1";
            if (request != null) {
                String xfHeader = request.getHeader("X-Forwarded-For");
                if (xfHeader == null) {
                    clientIp = request.getRemoteAddr();
                } else {
                    clientIp = xfHeader.split(",")[0];
                }
            }

            AuditLog logEntry = AuditLog.builder()
                    .userId(userId)
                    .username(username)
                    .action(action)
                    .entity(entity)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(clientIp)
                    .build();

            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to write audit log: {}", e.getMessage());
        }
    }
}
