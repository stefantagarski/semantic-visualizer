package com.semantic.semanticvisualizer.model.dto;

import com.semantic.semanticvisualizer.model.Triple;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Data Transfer Object for representing an ontology graph
 * Enhanced to include direct nodes and edges lists suitable for D3.js visualization
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OntologyGraphDTO {

    private List<Triple> triples = new ArrayList<>();
    private List<NodeDTO> nodes = new ArrayList<>();
    private List<EdgeDTO> edges = new ArrayList<>();

    public void addTriple(Triple triple) {
        triples.add(triple);

        // Add nodes if they don't exist
        String subjectId = triple.getSubject();
        String objectId = triple.getObject();

        addNodeIfNotExists(subjectId);
        addNodeIfNotExists(objectId);

        // Add edge
        EdgeDTO edge = new EdgeDTO(
                subjectId,
                objectId,
                triple.getPredicate()
        );
        edges.add(edge);
    }

    private void addNodeIfNotExists(String nodeId) {
        // Check if node already exists
        boolean exists = nodes.stream()
                .anyMatch(node -> node.getId().equals(nodeId));

        if (!exists) {
            // Create a new node
            NodeDTO node = new NodeDTO(nodeId);
            nodes.add(node);
        }
    }



    // Helper method to calculate statistics
    public OntologyStatsDTO calculateStatistics() {
        OntologyStatsDTO stats = new OntologyStatsDTO();
        stats.setNodeCount(nodes.size());
        stats.setEdgeCount(edges.size());
        stats.setTripleCount(triples.size());

        // Calculate predicates count
        Set<String> uniquePredicates = new HashSet<>();
        for (EdgeDTO edge : edges) {
            uniquePredicates.add(edge.getLabel());
        }
        stats.setPredicateCount(uniquePredicates.size());

        return stats;
    }
}