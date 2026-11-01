package com.sms.repository;

import com.sms.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUserId(Long userId);
    List<Document> findByAccessRoleIn(List<Document.AccessRole> roles);
    Page<Document> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
