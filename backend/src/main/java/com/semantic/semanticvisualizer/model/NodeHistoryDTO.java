package com.semantic.semanticvisualizer.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NodeHistoryDTO {
    private String nodeId;
    private String nodeName;
    private String changeType; // e.g., "ADDED", "MODIFIED", "DELETED"
    private LocalDateTime clickedAt;
    private double weight; // 0.1 to 1.0
    private int clickOrder; // Position in the sequence of clicks
    private double degreeOpacity; // Opacity based on node degree
    private int clickCount; // Total number of clicks on this node
    private double agingFactor; // Time-based decay factor

    public NodeHistoryDTO(String nodeId, String nodeName, LocalDateTime clickedAt,
                          int clickOrder, double degreeOpacity) {
        this.nodeId = nodeId;
        this.nodeName = nodeName;
        this.changeType = "ADDED";
        this.clickedAt = clickedAt;
        this.clickOrder = clickOrder;
        this.degreeOpacity = degreeOpacity;
        this.clickCount = 1;
    }

    public void incrementClickCount() {
        this.clickCount++;
    }
}
