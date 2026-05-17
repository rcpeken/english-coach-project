package com.recep.encoach.repository;

import com.recep.encoach.entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestRepository extends JpaRepository<Test, Long> {
    List<Test> findByTeacherId(Long teacherId);
}
