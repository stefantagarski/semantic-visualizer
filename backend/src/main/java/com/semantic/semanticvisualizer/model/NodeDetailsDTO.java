package com.semantic.semanticvisualizer.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Data Transfer Object for node details
 */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class NodeDetailsDTO {
    private String id;
    private String label;
    private List<RelatedNodeDTO> incomingConnections = new ArrayList<>();
    private List<RelatedNodeDTO> outgoingConnections = new ArrayList<>();


    /**
     * Inner class for representing related nodes
     */
    @AllArgsConstructor
    @NoArgsConstructor
    @Data
    public static class RelatedNodeDTO {
        private String nodeId;
        private String nodeLabel;
        private String relationshipType;

    }
}