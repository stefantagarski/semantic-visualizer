package com.semantic.semanticvisualizer.model.statistics;

import lombok.Data;

@Data
public class ClickStatistics {
    public final int uniqueNodes;
    public final int totalClicks;
    public final double averageWeight;

    public ClickStatistics(int uniqueNodes, int totalClicks, double averageWeight) {
        this.uniqueNodes = uniqueNodes;
        this.totalClicks = totalClicks;
        this.averageWeight = averageWeight;
    }


}