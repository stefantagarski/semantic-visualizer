package com.semantic.semanticvisualizer.model.vqa;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserAnswerPath {
    private String sessionId;
    private String questionId;
    private List<String> nodeURIs;   // The sequence of selected nodes
    private String userAnswer;  // Optional textual answer (FVQA)
    private List<TripleVQA> exploredTriplets;
    private long explorationTimeMs; // time taken to explore the path
}
