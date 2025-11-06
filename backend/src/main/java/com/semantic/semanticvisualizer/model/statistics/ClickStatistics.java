package com.semantic.semanticvisualizer.model.statistics;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor(access = AccessLevel.PUBLIC)
public class ClickStatistics {
    public int uniqueNodes;
    public int totalClicks;
    public double averageWeight;
}
