package com.recep.encoach.controller;

import com.recep.encoach.dto.*;
import com.recep.encoach.entity.TestAssignment;
import com.recep.encoach.entity.User;
import com.recep.encoach.service.TestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestController {

    private final TestService testService;

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<TestResponse> createTest(
            @Valid @RequestBody TestRequest request,
            @AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(testService.createTest(request, teacher));
    }

    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<TestResponse>> getMyTests(@AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(testService.getTestsByTeacher(teacher.getId()));
    }

    @GetMapping("/{testId}")
    public ResponseEntity<TestResponse> getTest(@PathVariable Long testId) {
        return ResponseEntity.ok(testService.getTestById(testId));
    }

    @PostMapping("/{testId}/assign")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, String>> assignTest(
            @PathVariable Long testId,
            @RequestParam Long studentId,
            @AuthenticationPrincipal User teacher) {
        testService.assignTestToStudent(testId, studentId, teacher);
        return ResponseEntity.ok(Map.of("message", "Test başarıyla atandı!"));
    }

    @GetMapping("/results")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<TestResultResponse>> getTeacherResults(
            @AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(testService.getResultsByTeacher(teacher.getId()));
    }

    @GetMapping("/my-assignments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getMyAssignments(
            @AuthenticationPrincipal User student) {
        List<TestAssignment> assignments = testService.getStudentAssignments(student.getId());
        List<Map<String, Object>> response = assignments.stream()
                .map(a -> Map.<String, Object>of(
                        "assignmentId", a.getId(),
                        "testId", a.getTest().getId(),
                        "testTitle", a.getTest().getTitle(),
                        "status", a.getStatus().name(),
                        "assignedAt", a.getAssignedAt().toString()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-assignments/pending")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Map<String, Object>>> getMyPendingAssignments(
            @AuthenticationPrincipal User student) {
        List<TestAssignment> assignments = testService.getPendingAssignments(student.getId());
        List<Map<String, Object>> response = assignments.stream()
                .map(a -> Map.<String, Object>of(
                        "assignmentId", a.getId(),
                        "testId", a.getTest().getId(),
                        "testTitle", a.getTest().getTitle(),
                        "status", a.getStatus().name(),
                        "assignedAt", a.getAssignedAt().toString()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/assignments/{assignmentId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<TestResultResponse> submitTest(
            @PathVariable Long assignmentId,
            @Valid @RequestBody SubmitTestRequest request,
            @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(testService.submitTest(assignmentId, request, student));
    }

    @GetMapping("/results/{resultId}")
    public ResponseEntity<TestResultResponse> getTestResult(@PathVariable Long resultId) {
        return ResponseEntity.ok(testService.getTestResult(resultId));
    }

    @DeleteMapping("/{testId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, String>> deleteTest(
            @PathVariable Long testId,
            @AuthenticationPrincipal User teacher) {
        testService.deleteTest(testId, teacher);
        return ResponseEntity.ok(Map.of("message", "Test silindi!"));
    }

    @DeleteMapping("/results/{resultId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, String>> deleteTestResult(
            @PathVariable Long resultId,
            @AuthenticationPrincipal User teacher) {
        testService.deleteTestResult(resultId, teacher);
        return ResponseEntity.ok(Map.of("message", "Sonuç silindi!"));
    }
}
