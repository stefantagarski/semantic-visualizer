package com.semantic.semanticvisualizer.service.impl;

import com.semantic.semanticvisualizer.model.NodeHistoryDTO;
import com.semantic.semanticvisualizer.model.statistics.ClickStatistics;
import com.semantic.semanticvisualizer.service.NodeHistoryService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class NodeHistoryImplementation implements NodeHistoryService {

    private final List<NodeHistoryDTO> clickHistory = new ArrayList<>();

    // Configuration constants
    private static final int MAX_HISTORY_SIZE = 50;
    private static final double BASE_K = 1.2;
    private static final double AGING_HALF_LIFE_MINUTES = 30.0;

    // Weight calculation constants
    private static final double MIN_AGING_FACTOR = 0.1;
    private static final double MIN_WEIGHT = 0.1;
    private static final double MAX_WEIGHT = 1.0;
    private static final double WEIGHT_RANGE = 0.9; // MAX_WEIGHT - MIN_WEIGHT

    // Click boost constants
    private static final double CLICK_BOOST_BASE = 1.0;
    private static final double CLICK_BOOST_MULTIPLIER = 0.1;
    private static final int MAX_CLICK_BOOST_COUNT = 5;

    // Normalization constants
    private static final double MAX_CLICK_BOOST_FACTOR = 1.5;
    private static final double LAMBDA_DIVISOR = Math.log(2);

    @Override
    public void addNodeClick(String nodeId, String nodeName, double degreeOpacity) {
        LocalDateTime now = LocalDateTime.now();

        // Check if node already exists in history
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
                clickHistory.stream().mapToInt(NodeHistoryDTO::getClickCount).sum(), // total clicks
                clickHistory.stream().mapToDouble(NodeHistoryDTO::getWeight).average().orElse(0.0) // average weight
        );
    }

    /**
     * Calculate weight using: k^n * degree_opacity * aging_factor * click_boost
     * where n is the position from end (last clicked = highest n)
     */
    private void recalculateWeightsAndAgingFactors() {
        int totalNodes = clickHistory.size();
        LocalDateTime now = LocalDateTime.now();

        for (int i = 0; i < totalNodes; i++) {
            NodeHistoryDTO node = clickHistory.get(i);

            // Position from end: last clicked = totalNodes, first = 1
            int positionFromEnd = totalNodes - i;

            // k^n component
            double kPowerN = Math.pow(BASE_K, positionFromEnd);

            // Aging factor: exponential decay based on time since click
            double agingFactor = calculateAgingFactor(node.getClickedAt(), now);

            // Click frequency boost (more clicks = higher weight)
            double clickBoost = calculateClickBoost(node.getClickCount());

            // Final weight: k^n * degree_opacity * aging_factor * click_boost
            double rawWeight = kPowerN * node.getDegreeOpacity() * agingFactor * clickBoost;

            // Normalize to [MIN_WEIGHT, MAX_WEIGHT]
            double normalizedWeight = normalizeWeight(rawWeight, totalNodes);

            node.setWeight(normalizedWeight);
            node.setAgingFactor(agingFactor);
        }
    }

    private double calculateAgingFactor(LocalDateTime clickTime, LocalDateTime now) {
        double minutesElapsed = Duration.between(clickTime, now).toMinutes();
        double lambda = LAMBDA_DIVISOR / AGING_HALF_LIFE_MINUTES;
        double agingFactor = Math.exp(-lambda * minutesElapsed);

        // Ensure minimum aging factor
        return Math.max(MIN_AGING_FACTOR, agingFactor);
    }

    /**
     * Calculate click boost: 1.0 + (0.1 * min(clickCount - 1, 5))
     */
    private double calculateClickBoost(int clickCount) {
        int effectiveClicks = Math.min(clickCount - 1, MAX_CLICK_BOOST_COUNT);
        return CLICK_BOOST_BASE + (CLICK_BOOST_MULTIPLIER * effectiveClicks);
    }


    private double normalizeWeight(double rawWeight, int totalNodes) {
        // Find max possible weight for normalization
        double maxPossibleWeight = Math.pow(BASE_K, totalNodes)
                * MAX_WEIGHT
                * MAX_WEIGHT
                * MAX_CLICK_BOOST_FACTOR;

        // Normalize and clamp to [MIN_WEIGHT, MAX_WEIGHT]
        double normalized = MIN_WEIGHT + (WEIGHT_RANGE * Math.min(rawWeight / maxPossibleWeight, MAX_WEIGHT));
        return Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, normalized));
    }


    private void updateClickOrders() {
        for (int i = 0; i < clickHistory.size(); i++) {
            clickHistory.get(i).setClickOrder(i + 1);
        }
        recalculateWeightsAndAgingFactors();
    }
}
