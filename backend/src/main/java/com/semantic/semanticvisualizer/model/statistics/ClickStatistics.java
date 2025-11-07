package com.semantic.semanticvisualizer.model.statistics;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ClickStatistics {
    private int uniqueNodes;
    private int totalClicks;
    private double averageWeight;
}
