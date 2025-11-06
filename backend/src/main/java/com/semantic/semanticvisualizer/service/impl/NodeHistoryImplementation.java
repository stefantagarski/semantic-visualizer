package com.semantic.semanticvisualizer.service.impl;

import com.semantic.semanticvisualizer.model.NodeHistoryDTO;
import com.semantic.semanticvisualizer.model.statistics.ClickStatistics;
import com.semantic.semanticvisualizer.service.NodeHistoryService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NodeHistoryImplementation implements NodeHistoryService {

    private final List<NodeHistoryDTO> clickHistory = new ArrayList<>();

    // Store click history per session
//    private static final Map<String, List<NodeHistoryDTO>> sessionClickHistory = new ConcurrentHashMap<>();

    private static final int MAX_HISTORY_SIZE = 50; // max number of saved nodes in history
    private static final double BASE_K = 1.2; // Base constant for k^n formula
    private static final double AGING_HALF_LIFE_MINUTES = 30.0; // Time for weight to decay by half

    @Override
    public void addNodeClick(String nodeId, String nodeName, double degreeOpacity) {

        LocalDateTime now = LocalDateTime.now();

        // check if node already exists in history
        Optional<NodeHistoryDTO> existingNode = clickHistory.stream()
                .filter(node -> node.getNodeId().equals(nodeId))
                .findFirst();

        if (existingNode.isPresent()) {
            // Node was clicked before - update it
            NodeHistoryDTO node = existingNode.get();
            node.incrementClickCount();
            node.setClickedAt(now);
            node.setChangeType("MODIFIED");

            // Move node to the end of the list
            clickHistory.remove(node);
            clickHistory.add(node);
        } else {
            // New node click - add to history
            int clickOrder = clickHistory.size() + 1;

            NodeHistoryDTO newNode = new NodeHistoryDTO(
                    nodeId, nodeName, now, clickOrder, degreeOpacity
            );
            clickHistory.add(newNode);
        }

        // Recalculate weights and aging factors
        recalculateWeightsAndAgingFactors();

        // Limit history size
        if (clickHistory.size() > MAX_HISTORY_SIZE) {
            clickHistory.removeFirst();
            updateClickOrders();
        }
    }

    @Override
    public List<NodeHistoryDTO> getClickHistory() {
        // Recalculate aging before returning
        recalculateWeightsAndAgingFactors();
        return new ArrayList<>(clickHistory);
    }

    @Override
    public void clearHistory() {
        clickHistory.clear();
    }

    @Override
    public ClickStatistics getClickStatistics() {
        return new ClickStatistics(
                clickHistory.size(), // unique nodes
                clickHistory.stream().mapToInt(node -> node.getClickCount()).sum(), // total clicks
                clickHistory.stream().mapToDouble(node -> node.getWeight()).average().orElse(0.0) // average weight
        );
    }

    /**
     * Calculate weight using: k^n * degree_opacity * aging_factor
     * where n is the position from end (last clicked = highest n)
     */
    private void recalculateWeightsAndAgingFactors() {

        int totalNodes = clickHistory.size();
        LocalDateTime now = LocalDateTime.now();

        for (int i = 0; i < totalNodes; i++) {
            NodeHistoryDTO node = clickHistory.get(i);

            // Position from end: last clicked = totalNodes, first = 1
            int positionFromEnd = totalNodes - i;

            // k^n component: k^4 * k^3 * k^2 * k^1 for last 4 nodes
            double kPowerN = Math.pow(BASE_K, positionFromEnd);

            // Aging factor: exponential decay based on time since click
            double agingFactor = calculateAgingFactor(node.getClickedAt(), now);

            // Click frequency boost (more clicks = higher weight)
            double clickBoost = 1.0 + (0.1 * Math.min(node.getClickCount() - 1, 5));

            // Final weight: k^n * degree_opacity * aging_factor * click_boost
            double rawWeight = kPowerN * node.getDegreeOpacity() * agingFactor * clickBoost;

            // Normalize to [0.1, 1.0]
            double normalizedWeight = normalizeWeight(rawWeight, totalNodes);

            node.setWeight(normalizedWeight);
            node.setAgingFactor(agingFactor);
        }
    }

    /**
     * Exponential decay: weight = e^(-λt) where λ = ln(2) / half_life
     */
    private double calculateAgingFactor(LocalDateTime clickTime, LocalDateTime now) {
        double minutesElapsed = Duration.between(clickTime, now).toMinutes();
        double lambda = Math.log(2) / AGING_HALF_LIFE_MINUTES;
        double agingFactor = Math.exp(-lambda * minutesElapsed);

        // Ensure minimum aging factor of 0.1
        return Math.max(0.1, agingFactor);
    }

    /**
     * Normalize weight to [0.1, 1.0] range
     */
    private double normalizeWeight(double rawWeight, int totalNodes) {
        // Find max possible weight for normalization
        double maxPossibleWeight = Math.pow(BASE_K, totalNodes) * 1.0 * 1.0 * 1.5;

        // Normalize and clamp to [0.1, 1.0]
        double normalized = 0.1 + (0.9 * Math.min(rawWeight / maxPossibleWeight, 1.0));
        return Math.min(1.0, Math.max(0.1, normalized));
    }

    private void updateClickOrders() {
        for (int i = 0; i < clickHistory.size(); i++) {
            clickHistory.get(i).setClickOrder(i + 1);
        }
        recalculateWeightsAndAgingFactors();
    }
}
