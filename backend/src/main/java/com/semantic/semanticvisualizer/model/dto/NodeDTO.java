package com.semantic.semanticvisualizer.model.dto;

import lombok.*;

/**
 * Represents a node in the ontology graph
 */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class NodeDTO {
    private String id;
    private String label;

    public NodeDTO(String id) {
        this.id = id;

        // Extract label from URI
        if (id.contains("#")) {
            this.label = id.substring(id.lastIndexOf('#') + 1);
        } else if (id.contains("/")) {
            this.label = id.substring(id.lastIndexOf('/') + 1);
        } else {
            this.label = id;
        }
    }
}