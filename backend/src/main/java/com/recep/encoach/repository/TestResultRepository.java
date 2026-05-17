package com.recep.encoach.repository;

import com.recep.encoach.entity.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface TestResultRepository extends JpaRepository<TestResult, Long> {
    Optional<TestResult> findByAssignmentId(Long assignmentId);
    List<TestResult> findByAssignmentStudentId(Long studentId);
    List<TestResult> findByAssignmentTestTeacherId(Long teacherId);
}
