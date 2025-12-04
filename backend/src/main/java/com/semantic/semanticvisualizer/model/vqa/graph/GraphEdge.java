package com.semantic.semanticvisualizer.model.vqa.graph;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GraphEdge {
    private String source;
    private String target;
    private String label;
}