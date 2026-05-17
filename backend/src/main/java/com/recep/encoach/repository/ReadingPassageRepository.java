package com.recep.encoach.repository;

import com.recep.encoach.entity.ReadingPassage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReadingPassageRepository extends JpaRepository<ReadingPassage, Long> {
    List<ReadingPassage> findByTeacherId(Long teacherId);
}
