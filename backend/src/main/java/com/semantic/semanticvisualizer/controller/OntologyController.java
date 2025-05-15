package com.semantic.semanticvisualizer.controller;

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
import java.nio.charset.StandardCharsets;

@Controller
@RequestMapping("/api/ontology")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}) // Allow CORS for development frontends
public class OntologyController {

    private final OntologyService ontologyService;

    public OntologyController(OntologyService ontologyService) {
        this.ontologyService = ontologyService;
    }

    /**
     * Parse ontology data from raw input
     */
    @PostMapping("/parse")
    public ResponseEntity<?> parseOntology(@RequestBody String ontologyContent,
                                           @RequestParam(defaultValue = "turtle") String format) {
        try {
            OntologyGraphDTO graph = ontologyService.parseOntology(ontologyContent, format);
            return ResponseEntity.ok(graph);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

    /**
     * Parse ontology data from uploaded file
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadOntologyFile(@RequestParam("file") MultipartFile file,
                                                @RequestParam(defaultValue = "turtle") String format) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }

            OntologyGraphDTO graph = ontologyService.parseOntologyFile(file, format);
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

    /**
     * Get details for a specific node
     */
    @PostMapping("/node-details/{nodeId}")
    public ResponseEntity<?> getNodeDetails(@PathVariable String nodeId,
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

    /**
     * Get statistics about an ontology
     */
    @PostMapping("/statistics")
    public ResponseEntity<?> getOntologyStatistics(@RequestBody String ontologyContent,
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