package com.semantic.semanticvisualizer.controller;

import com.semantic.semanticvisualizer.model.OntologyGraphDTO;
import com.semantic.semanticvisualizer.service.OntologyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/ontology")
public class OntologyController {

    private final OntologyService ontologyService;

    public OntologyController(OntologyService ontologyService) {
        this.ontologyService = ontologyService;
    }

    @PostMapping("/parse")
    @CrossOrigin(origins = "http://localhost:5173") // allow CORS for localhost:5173 frontend
    public ResponseEntity<?> parseOntology(@RequestBody String ontologyContent,
                                           @RequestParam(defaultValue = "turtle") String format) {
        try {
            OntologyGraphDTO graph = ontologyService.parseOntology(ontologyContent, format);
            return ResponseEntity.ok(graph);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred.");
        }
    }

    @PostMapping("/upload")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<?> uploadOntologyFile(@RequestParam("file") MultipartFile file,
                                                @RequestParam(defaultValue = "turtle") String format) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }

            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            OntologyGraphDTO graph = ontologyService.parseOntology(content, format);
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
}