package com.semantic.semanticvisualizer.model.vqa;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PathValidationResult {
    private boolean isCorrect;
    private double similarityScore;
    private List<String> correctNodes;
    private List<String> incorrectNodes;
    private List<String> missedNodes;
    private List<TripleVQA> highlightedTriples; // FVQA: show subject–relation–object on graph
    private Map<String, Double> nodeOpacityMap;
    private List<String> expectedPath;
    private List<String> userPath;
    private String feedback;
}
