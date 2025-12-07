package com.semantic.semanticvisualizer.service;

import com.semantic.semanticvisualizer.model.dto.NodeDetailsDTO;
import com.semantic.semanticvisualizer.model.dto.OntologyGraphDTO;
import com.semantic.semanticvisualizer.model.dto.OntologyStatsDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Service for handling ontology operations
 */
public interface OntologyService {

    /**
     * Parse ontology content into a graph structure
     *
     * @param ontologyContent The content of the ontology
     * @param format The format of the ontology (turtle, rdfxml, etc.)
     * @return An OntologyGraphDTO containing the graph structure
     */
    OntologyGraphDTO parseOntology(String ontologyContent, String format);

    /**
     * Parse ontology from a file
     *
     * @param file The MultipartFile containing the ontology data
     * @param format The format of the ontology (turtle, rdfxml, etc.)
     * @return An OntologyGraphDTO containing the graph structure
     * @throws IOException If there is an error reading the file
     */
    OntologyGraphDTO parseOntologyFile(MultipartFile file, String format) throws IOException;

    /**
     * Get detailed information about a specific node
     *
     * @param nodeId The ID of the node
     * @param ontologyContent The ontology content to extract node details from
     * @param format The format of the ontology content
     * @return Details about the specified node
     */
    NodeDetailsDTO getNodeDetails(String nodeId, String ontologyContent, String format);

    /**
     * Get statistics about an ontology
     *
     * @param ontologyContent The content of the ontology
     * @param format The format of the ontology
     * @return Statistics about the ontology
     */
    OntologyStatsDTO getOntologyStatistics(String ontologyContent, String format);

    OntologyGraphDTO parseOntologyWithLimit(String ontologyContent, String format, Integer maxNodes);
}