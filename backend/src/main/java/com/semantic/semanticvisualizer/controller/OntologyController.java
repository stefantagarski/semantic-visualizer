package com.semantic.semanticvisualizer.controller;

import com.semantic.semanticvisualizer.model.OntologyGraphDTO;
import com.semantic.semanticvisualizer.service.OntologyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ontology")
public class OntologyController {

    private final OntologyService ontologyService;


    public OntologyController(OntologyService ontologyService) {
        this.ontologyService = ontologyService;
    }

    @PostMapping("/parse") //default format param is turtle
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

}
