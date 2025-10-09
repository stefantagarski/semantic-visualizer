package com.semantic.semanticvisualizer.web.controller;

import com.semantic.semanticvisualizer.model.NodeDetailsDTO;
import com.semantic.semanticvisualizer.model.OntologyGraphDTO;
import com.semantic.semanticvisualizer.model.OntologyStatsDTO;
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
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}) // Allow CORS for development frontends
public class OntologyController {

    private final OntologyService ontologyService;

    public OntologyController(OntologyService ontologyService) {
        this.ontologyService = ontologyService;
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
}