package com.semantic.semanticvisualizer.web.controller;

import com.semantic.semanticvisualizer.model.dto.NodeDetailsDTO;
import com.semantic.semanticvisualizer.model.dto.OntologyGraphDTO;
import com.semantic.semanticvisualizer.model.dto.OntologyStatsDTO;
import com.semantic.semanticvisualizer.service.NodeHistoryService;
import com.semantic.semanticvisualizer.service.OntologyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Objects;

@Controller
@RequestMapping("/api/ontology")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class OntologyController {

    private final OntologyService ontologyService;
    private final NodeHistoryService nodeHistoryService;

    public OntologyController(OntologyService ontologyService, NodeHistoryService nodeHistoryService) {
        this.ontologyService = ontologyService;
        this.nodeHistoryService = nodeHistoryService;
    }

    /**
     * Parse ontology data - automatically limits to 500 nodes if larger
     * Add ?maxNodes=1000 to customize the limit
     */
    @PostMapping("/parse")
    public ResponseEntity<?> parseOntology(
            @RequestBody String ontologyContent,
            @RequestParam(defaultValue = "turtle") String format,
            @RequestParam(required = false) Integer maxNodes) {
        try {
            OntologyGraphDTO graph;

            graph = ontologyService.parseOntologyWithLimit(ontologyContent, format,
                    Objects.requireNonNullElse(maxNodes, 500));

            return ResponseEntity.ok(graph);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

    /**
     * Upload file with automatic optimization
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadOntologyFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "turtle") String format,
            @RequestParam(required = false) Integer maxNodes) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }

            // Read file content
            String content = new String(file.getBytes());

            // Parse with limit
            OntologyGraphDTO graph = ontologyService.parseOntologyWithLimit(
                    content,
                    format,
                    maxNodes != null ? maxNodes : 500
            );

            return ResponseEntity.ok(graph);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Could not read the uploaded file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/node-details/{nodeId}")
    public ResponseEntity<?> getNodeDetails(
            @PathVariable String nodeId,
            @RequestBody String ontologyContent,
            @RequestParam(defaultValue = "turtle") String format) {
        try {
            NodeDetailsDTO details = ontologyService.getNodeDetails(nodeId, ontologyContent, format);
            return ResponseEntity.ok(details);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/statistics")
    public ResponseEntity<?> getOntologyStatistics(
            @RequestBody String ontologyContent,
            @RequestParam(defaultValue = "turtle") String format) {
        try {
            OntologyStatsDTO stats = ontologyService.getOntologyStatistics(ontologyContent, format);
            return ResponseEntity.ok(stats);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/node-click")
    public ResponseEntity<?> recordNodeClick(
            @RequestParam String nodeId,
            @RequestParam String nodeName,
            @RequestParam(defaultValue = "0.5") double degreeOpacity) {
        try {
            nodeHistoryService.addNodeClick(nodeId, nodeName, degreeOpacity);
            return ResponseEntity.ok("Node click recorded");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error recording node click: " + e.getMessage());
        }
    }

    @GetMapping("/click-statistics")
    public ResponseEntity<?> getClickStatistics() {
        try {
            var stats = nodeHistoryService.getClickStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving statistics: " + e.getMessage());
        }
    }

    @GetMapping("/click-history")
    public ResponseEntity<?> getClickHistory() {
        try {
            var history = nodeHistoryService.getClickHistory();
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving history: " + e.getMessage());
        }
    }

    @PostMapping("/clear-history")
    public ResponseEntity<?> clearClickHistory() {
        try {
            nodeHistoryService.clearHistory();
            return ResponseEntity.ok("History cleared");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error clearing history: " + e.getMessage());
        }
    }
}
