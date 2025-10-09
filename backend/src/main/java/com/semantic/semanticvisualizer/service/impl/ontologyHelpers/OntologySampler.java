package com.semantic.semanticvisualizer.service.impl.ontologyHelpers;

import com.semantic.semanticvisualizer.model.EdgeDTO;
import com.semantic.semanticvisualizer.model.NodeDTO;
import com.semantic.semanticvisualizer.model.OntologyGraphDTO;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class OntologySampler {

    public OntologyGraphDTO limitGraph(OntologyGraphDTO fullGraph, Integer maxNodes) {
        if (maxNodes == null || fullGraph.getNodes().size() <= maxNodes) {
            return fullGraph;
        }

        Map<String, Integer> degrees = new HashMap<>();
        for (EdgeDTO edge : fullGraph.getEdges()) {
            degrees.merge(edge.getSubject(), 1, Integer::sum);
            degrees.merge(edge.getObject(), 1, Integer::sum);
        }

        Set<String> topNodes = degrees.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(maxNodes)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());

        OntologyGraphDTO sampled = new OntologyGraphDTO();

        for (NodeDTO node : fullGraph.getNodes()) {
            if (topNodes.contains(node.getId())) {
                sampled.getNodes().add(node);
            }
        }

        for (EdgeDTO edge : fullGraph.getEdges()) {
            if (topNodes.contains(edge.getSubject()) && topNodes.contains(edge.getObject())) {
                sampled.getEdges().add(edge);
            }
        }

        return sampled;
    }
}
