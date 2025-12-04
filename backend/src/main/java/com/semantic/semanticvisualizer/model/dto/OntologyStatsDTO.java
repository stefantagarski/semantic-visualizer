package com.semantic.semanticvisualizer.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for representing ontology statistics
 */
@AllArgsConstructor
@NoArgsConstructor
@Data
public class OntologyStatsDTO {
    private int nodeCount;
    private int edgeCount;
    private int tripleCount;
    private int predicateCount;
}