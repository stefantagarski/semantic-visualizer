package com.semantic.semanticvisualizer.service.impl;

import com.semantic.semanticvisualizer.model.NodeDetailsDTO;
import com.semantic.semanticvisualizer.model.OntologyGraphDTO;
import com.semantic.semanticvisualizer.model.OntologyStatsDTO;
import com.semantic.semanticvisualizer.service.OntologyService;
import com.semantic.semanticvisualizer.service.impl.ontologyHelpers.OntologyGraphBuilder;
import com.semantic.semanticvisualizer.service.impl.ontologyHelpers.OntologyModelLoader;
import com.semantic.semanticvisualizer.service.impl.ontologyHelpers.OntologyNodeDetails;
import com.semantic.semanticvisualizer.service.impl.ontologyHelpers.OntologySampler;
import org.apache.jena.rdf.model.Model;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class OntologyServiceImplementation implements OntologyService {

    private static final int MAX_NODES_DEFAULT = 500;

    private final OntologyModelLoader modelLoader;
    private final OntologyGraphBuilder graphBuilder;
    private final OntologySampler sampler;
    private final OntologyNodeDetails nodeDetailsService;

    public OntologyServiceImplementation(OntologyModelLoader modelLoader, OntologyGraphBuilder graphBuilder
            , OntologySampler sampler, OntologyNodeDetails nodeDetailsService) {
        this.modelLoader = modelLoader;
        this.graphBuilder = graphBuilder;
        this.sampler = sampler;
        this.nodeDetailsService = nodeDetailsService;
    }


    @Override
    public OntologyGraphDTO parseOntology(String ontologyContent, String format) {
        Model model = modelLoader.loadModel(ontologyContent, format);
        return graphBuilder.buildGraphFromModel(model, MAX_NODES_DEFAULT);
    }

    @Override
    public OntologyGraphDTO parseOntologyFile(MultipartFile file, String format) throws IOException {
        Model model = modelLoader.loadModelFromFile(file, format);
        return graphBuilder.buildGraphFromModel(model, MAX_NODES_DEFAULT);
    }

    public OntologyGraphDTO parseOntologyWithLimit(String ontologyContent, String format, Integer maxNodes) {
        Model model = modelLoader.loadModel(ontologyContent, format);
        OntologyGraphDTO graph = graphBuilder.buildGraphFromModel(model, maxNodes);
        return sampler.limitGraph(graph, maxNodes);
    }

    @Override
    public NodeDetailsDTO getNodeDetails(String nodeId, String ontologyContent, String format) {
        Model model = modelLoader.loadModel(ontologyContent, format);
        return nodeDetailsService.extractDetails(model, nodeId);
    }

    @Override
    public OntologyStatsDTO getOntologyStatistics(String ontologyContent, String format) {
        OntologyGraphDTO graph = parseOntology(ontologyContent, format);
        return graph.calculateStatistics();
    }
}
