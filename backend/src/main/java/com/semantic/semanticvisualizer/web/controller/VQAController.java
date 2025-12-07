package com.semantic.semanticvisualizer.web.controller;

import com.semantic.semanticvisualizer.model.vqa.*;
import com.semantic.semanticvisualizer.model.vqa.graph.GraphResponse;
import com.semantic.semanticvisualizer.service.VQAService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/vqa")
@CrossOrigin(origins = "*")
@Slf4j
public class VQAController {

    private final VQAService vqaService;

    public VQAController(VQAService vqaService) {
        this.vqaService = vqaService;
    }

    @PostMapping("/dataset/upload")
    public ResponseEntity<?> uploadDataset(@RequestParam("file") MultipartFile file) {
        try {
            VQADataset dataset = vqaService.loadVQADataset(file);
            return ResponseEntity.ok(dataset);
        } catch (Exception e) {
            log.error("Dataset upload failed", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{datasetId}/graph")
    public ResponseEntity<?> getGraph(@PathVariable String datasetId) {
        try {
            GraphResponse graph = vqaService.generateGraphForDataset(datasetId);
            return ResponseEntity.ok(graph);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/dataset/json")
    public ResponseEntity<VQADataset> uploadDatasetJson(@RequestBody String json) {
        try {
            return ResponseEntity.ok(vqaService.loadVQADatasetFromJson(json));
        } catch (Exception e) {
            log.error("Dataset JSON parsing failed", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{datasetId}/questions")
    public ResponseEntity<?> getQuestions(@PathVariable String datasetId) {
        try {
            List<VQAQuestion> questions = vqaService.getAllQuestions(datasetId);
            return ResponseEntity.ok(questions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/question/{questionId}")
    public ResponseEntity<?> getQuestion(@PathVariable String questionId) {
        try {
            VQAQuestion question = vqaService.getQuestionById(questionId);
            return ResponseEntity.ok(question);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/sessions/start/{questionId}")
    public ResponseEntity<?> startSession(@PathVariable String questionId) {
        try {
            VQASessionDTO session = vqaService.startVQASession(questionId);
            return ResponseEntity.ok(session);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/sessions/{sessionId}/validate")
    public ResponseEntity<?> validatePath(
            @PathVariable String sessionId,
            @RequestBody UserAnswerPath userPath) {
        try {
            PathValidationResult result = vqaService.validateUserPath(sessionId, userPath);
            return ResponseEntity.ok(result);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
