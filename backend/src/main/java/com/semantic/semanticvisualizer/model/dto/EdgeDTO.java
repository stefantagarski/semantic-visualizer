package com.semantic.semanticvisualizer.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents an edge in the ontology graph
 */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class EdgeDTO {
    private String subject;
    private String object;
    private String predicate;
    private String label;

    public EdgeDTO(String subject, String object, String predicate) {
        this.subject = subject;
        this.object = object;
        this.predicate = predicate;

        // Extract label from predicate URI
        if (predicate.contains("#")) {
            this.label = predicate.substring(predicate.lastIndexOf('#') + 1);
        } else if (predicate.contains("/")) {
            this.label = predicate.substring(predicate.lastIndexOf('/') + 1);
        } else {
            this.label = predicate;
        }
    }
}