package com.semantic.semanticvisualizer.service;

import com.semantic.semanticvisualizer.model.NodeHistoryDTO;
import com.semantic.semanticvisualizer.model.statistics.ClickStatistics;

import java.util.List;

public interface NodeHistoryService
{
    public void addNodeClick(String nodeId, String nodeName, double degreeOpacity);
    List<NodeHistoryDTO> getClickHistory();
    void clearHistory();
    ClickStatistics getClickStatistics();
}
