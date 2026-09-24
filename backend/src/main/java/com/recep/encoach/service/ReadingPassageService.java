package com.recep.encoach.service;

import com.recep.encoach.dto.ReadingPassageRequest;
import com.recep.encoach.dto.ReadingPassageResponse;
import com.recep.encoach.entity.ReadingAssignment;
import com.recep.encoach.entity.ReadingPassage;
import com.recep.encoach.entity.User;
import com.recep.encoach.event.PassageCreatedEvent;
import com.recep.encoach.repository.ReadingAssignmentRepository;
import com.recep.encoach.repository.ReadingPassageRepository;
import com.recep.encoach.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReadingPassageService {

    private final ReadingPassageRepository readingPassageRepository;
    private final ReadingAssignmentRepository readingAssignmentRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public ReadingPassageResponse createPassage(ReadingPassageRequest request, User teacher) {
        ReadingPassage passage = ReadingPassage.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .teacher(teacher)
                .build();

        passage = readingPassageRepository.save(passage);
        eventPublisher.publishEvent(new PassageCreatedEvent(passage.getId(), passage.getTitle(), passage.getContent()));
        return mapToResponse(passage);
    }

    public List<ReadingPassageResponse> getPassagesByTeacher(Long teacherId) {
        return readingPassageRepository.findByTeacherId(teacherId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ReadingPassageResponse getPassageById(Long passageId) {
        ReadingPassage passage = readingPassageRepository.findById(passageId)
                .orElseThrow(() -> new RuntimeException("Metin bulunamadı!"));
        return mapToResponse(passage);
    }

    @Transactional
    public void assignPassageToStudent(Long passageId, Long studentId, User teacher) {
        ReadingPassage passage = readingPassageRepository.findById(passageId)
                .orElseThrow(() -> new RuntimeException("Metin bulunamadı!"));

        if (!passage.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Bu metin size ait değil!");
        }

        if (readingAssignmentRepository.existsByPassageIdAndStudentId(passageId, studentId)) {
            throw new RuntimeException("Bu metin bu öğrenciye zaten atanmış!");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Öğrenci bulunamadı!"));

        ReadingAssignment assignment = ReadingAssignment.builder()
                .passage(passage)
                .student(student)
                .build();

        readingAssignmentRepository.save(assignment);
    }

    public List<ReadingPassageResponse> getStudentAssignedPassages(Long studentId) {
        return readingAssignmentRepository.findByStudentId(studentId).stream()
                .map(assignment -> mapToResponse(assignment.getPassage()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeAssignmentFromStudent(Long passageId, Long studentId) {
        if (!readingAssignmentRepository.existsByPassageIdAndStudentId(passageId, studentId)) {
            throw new RuntimeException("Bu metin size atanmamış!");
        }
        readingAssignmentRepository.deleteByPassageIdAndStudentId(passageId, studentId);
    }

    private ReadingPassageResponse mapToResponse(ReadingPassage passage) {
        return ReadingPassageResponse.builder()
                .id(passage.getId())
                .title(passage.getTitle())
                .content(passage.getContent())
                .teacherName(passage.getTeacher().getFullName())
                .createdAt(passage.getCreatedAt())
                .build();
    }
}
