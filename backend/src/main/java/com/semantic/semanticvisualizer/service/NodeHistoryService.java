package com.semantic.semanticvisualizer.service;

import com.semantic.semanticvisualizer.model.dto.NodeHistoryDTO;
import com.semantic.semanticvisualizer.model.statistics.ClickStatistics;

import java.util.List;

/**
 * Service interface for managing node click history and statistics
 */
public interface NodeHistoryService
{
    void addNodeClick(String nodeId, String nodeName, double degreeOpacity);
    List<NodeHistoryDTO> getClickHistory();
    void clearHistory();
    ClickStatistics getClickStatistics();
}
