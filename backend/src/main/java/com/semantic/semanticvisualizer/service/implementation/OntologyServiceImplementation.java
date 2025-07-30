package com.semantic.semanticvisualizer.service.implementation;

import com.semantic.semanticvisualizer.model.*;
import com.semantic.semanticvisualizer.service.OntologyService;
import org.apache.jena.rdf.model.*;
import org.apache.jena.riot.RiotException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.function.Function;

@Service
public class OntologyServiceImplementation implements OntologyService {

    @Override
    public OntologyGraphDTO parseOntology(String ontologyContent, String format) {
        Model model = loadModel(ontologyContent, format);
        return buildGraphFromModel(model);
    }

    @Override
    public OntologyGraphDTO parseOntologyFile(MultipartFile file, String format) throws IOException {
        // Stream file directly instead of loading into memory
        try (InputStream inputStream = file.getInputStream()) {
            Model model = ModelFactory.createDefaultModel();
            model.read(inputStream, null, convertFormatToJenaFormat(format));
            return buildGraphFromModel(model);
        }
    }

    @Override
    public NodeDetailsDTO getNodeDetails(String nodeId, String ontologyContent, String format) {
        Model model = loadModel(ontologyContent, format);
        NodeDetailsDTO details = new NodeDetailsDTO();
        details.setId(nodeId);
        details.setLabel(extractLabel(nodeId));

        // Find outgoing connections (where nodeId is subject)
        Resource nodeResource = model.createResource(nodeId);
        processStatements(
                model.listStatements(nodeResource, null, (RDFNode) null),
                stmt -> {
                    RDFNode obj = stmt.getObject();
                    if (obj.isResource()) {
                        String relatedNodeId = obj.toString();
                        String relationshipType = extractLabel(stmt.getPredicate().toString());

                        NodeDetailsDTO.RelatedNodeDTO relatedNode = new NodeDetailsDTO.RelatedNodeDTO(
                                relatedNodeId,
                                extractLabel(relatedNodeId),
                                relationshipType
                        );
                        details.getOutgoingConnections().add(relatedNode);
                    }
                    return null;
                }
        );

        // Find incoming connections (where nodeId is object)
        processStatements(
                model.listStatements(null, null, nodeResource),
                stmt -> {
                    Resource subject = stmt.getSubject();
                    String relatedNodeId = subject.toString();
                    String relationshipType = extractLabel(stmt.getPredicate().toString());

                    NodeDetailsDTO.RelatedNodeDTO relatedNode = new NodeDetailsDTO.RelatedNodeDTO(
                            relatedNodeId,
                            extractLabel(relatedNodeId),
                            relationshipType
                    );
                    details.getIncomingConnections().add(relatedNode);
                    return null;
                }
        );

        return details;
    }

    @Override
    public OntologyStatsDTO getOntologyStatistics(String ontologyContent, String format) {
        // Build graph first (to match your current implementation)
        OntologyGraphDTO graph = parseOntology(ontologyContent, format);

        // Use the existing calculateStatistics method from your graph
        return graph.calculateStatistics();
    }

    /**
     * Builds a graph from a Jena model
     */
    private OntologyGraphDTO buildGraphFromModel(Model model) {
        OntologyGraphDTO graph = new OntologyGraphDTO();

        StmtIterator iterator = model.listStatements();
        while (iterator.hasNext()) {
            Statement stmt = iterator.nextStatement();
            String subject = stmt.getSubject().toString();
            String predicate = stmt.getPredicate().toString();
            String object = stmt.getObject().toString();

            Triple triple = new Triple(subject, predicate, object);
            graph.addTriple(triple);
        }

        return graph;
    }

    /**
     * Helper method to load a Jena model from ontology content
     */
    private Model loadModel(String ontologyContent, String format) {
        if (ontologyContent == null || ontologyContent.isEmpty()) {
            throw new IllegalArgumentException("Ontology content cannot be empty");
        }

        Model model = ModelFactory.createDefaultModel();
        String jenaFormat = convertFormatToJenaFormat(format);

        try {
            model.read(
                    new java.io.ByteArrayInputStream(ontologyContent.getBytes(StandardCharsets.UTF_8)),
                    null,
                    jenaFormat
            );
        } catch (RiotException e) {
            throw new IllegalArgumentException("Failed to parse ontology in format: " + jenaFormat, e);
        }

        return model;
    }

    /**
     * Helper method to extract label from URI
     */
    private String extractLabel(String uri) {
        if (uri == null) return "";

        if (uri.contains("#")) {
            return uri.substring(uri.lastIndexOf('#') + 1);
        } else if (uri.contains("/")) {
            return uri.substring(uri.lastIndexOf('/') + 1);
        }
        return uri;
    }

    /**
     * Helper method to process statements with a handler function
     */
    private <T> void processStatements(StmtIterator iterator, Function<Statement, T> handler) {
        try {
            while (iterator.hasNext()) {
                handler.apply(iterator.nextStatement());
            }
        } finally {
            if (iterator != null) {
                iterator.close();
            }
        }
    }
    /**
     * Helper method to convert format string to Jena format
     */
    private String convertFormatToJenaFormat(String format) {
        if (format.equalsIgnoreCase("rdfxml")) {
            return "RDF/XML";
        } else if (format.equalsIgnoreCase("jsonld")) {
            return "JSON-LD";
        } else if (format.equalsIgnoreCase("ntriples")) {
            return "N-TRIPLE";
        } else if (format.equalsIgnoreCase("trig")) {
            return "TRIG";
        } else if (format.equalsIgnoreCase("turtle")) {
            return "TURTLE";
        } else {
            throw new IllegalArgumentException("Unsupported format: " + format);
        }
    }
}