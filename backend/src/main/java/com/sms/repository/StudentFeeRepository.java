package com.sms.repository;

import com.sms.entity.StudentFee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentFeeRepository extends JpaRepository<StudentFee, Long> {
    List<StudentFee> findByStudentId(Long studentId);
    Optional<StudentFee> findByStudentIdAndFeeStructureId(Long studentId, Long feeStructureId);
    Page<StudentFee> findByStatus(StudentFee.FeeStatus status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(sf.pendingAmount), 0) FROM StudentFee sf WHERE sf.status IN ('UNPAID', 'PARTIAL', 'OVERDUE')")
    BigDecimal sumTotalPendingFees();

    @Query("SELECT COALESCE(SUM(sf.paidAmount), 0) FROM StudentFee sf")
    BigDecimal sumTotalCollectedFees();
}
