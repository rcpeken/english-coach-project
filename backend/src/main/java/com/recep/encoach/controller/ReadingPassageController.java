package com.recep.encoach.controller;

import com.recep.encoach.dto.ReadingPassageRequest;
import com.recep.encoach.dto.ReadingPassageResponse;
import com.recep.encoach.entity.User;
import com.recep.encoach.service.ReadingPassageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/passages")
@RequiredArgsConstructor
public class ReadingPassageController {

    private final ReadingPassageService readingPassageService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ReadingPassageResponse> createPassage(
            @Valid @RequestBody ReadingPassageRequest request,
            @AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(readingPassageService.createPassage(request, teacher));
    }

    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<ReadingPassageResponse>> getMyPassages(
            @AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(readingPassageService.getPassagesByTeacher(teacher.getId()));
    }

    @GetMapping("/{passageId}")
    public ResponseEntity<ReadingPassageResponse> getPassage(@PathVariable Long passageId) {
        return ResponseEntity.ok(readingPassageService.getPassageById(passageId));
    }

    @PostMapping("/{passageId}/assign")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, String>> assignPassage(
            @PathVariable Long passageId,
            @RequestParam Long studentId,
            @AuthenticationPrincipal User teacher) {
        readingPassageService.assignPassageToStudent(passageId, studentId, teacher);
        return ResponseEntity.ok(Map.of("message", "Okuma metni başarıyla atandı!"));
    }

    @GetMapping("/my-assignments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ReadingPassageResponse>> getMyAssignedPassages(
            @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(readingPassageService.getStudentAssignedPassages(student.getId()));
    }

    @DeleteMapping("/my-assignments/{passageId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> deleteAssignedPassage(
            @PathVariable Long passageId,
            @AuthenticationPrincipal User student) {
        readingPassageService.removeAssignmentFromStudent(passageId, student.getId());
        return ResponseEntity.ok(Map.of("message", "Atanan metin başarıyla silindi!"));
    }
}
