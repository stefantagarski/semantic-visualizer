package com.semantic.semanticvisualizer.service.implementation;

import com.semantic.semanticvisualizer.model.*;
import com.semantic.semanticvisualizer.service.OntologyService;
import org.apache.jena.rdf.model.*;
import org.apache.jena.riot.RiotException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class OntologyServiceImplementation implements OntologyService {

    @Override
    public OntologyGraphDTO parseOntology(String ontologyContent, String format) {
        Model model = loadModel(ontologyContent, format);
        OntologyGraphDTO graph = new OntologyGraphDTO();

        // Extract triples and build graph
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

    @Override
    public OntologyGraphDTO parseOntologyFile(MultipartFile file, String format) throws IOException {
        String content = new String(file.getBytes(), StandardCharsets.UTF_8);
        return parseOntology(content, format);
    }

    @Override
    public NodeDetailsDTO getNodeDetails(String nodeId, String ontologyContent, String format) {
        Model model = loadModel(ontologyContent, format);
        NodeDetailsDTO details = new NodeDetailsDTO();
        details.setId(nodeId);

        // Extract label from URI
        if (nodeId.contains("#")) {
            details.setLabel(nodeId.substring(nodeId.lastIndexOf('#') + 1));
        } else if (nodeId.contains("/")) {
            details.setLabel(nodeId.substring(nodeId.lastIndexOf('/') + 1));
        } else {
            details.setLabel(nodeId);
        }

        // Find outgoing connections (where nodeId is subject)
        Resource nodeResource = model.createResource(nodeId);
        StmtIterator outgoing = model.listStatements(nodeResource, null, (RDFNode) null);
        while (outgoing.hasNext()) {
            Statement stmt = outgoing.nextStatement();
            RDFNode obj = stmt.getObject();

            if (obj.isResource()) {
                NodeDetailsDTO.RelatedNodeDTO relatedNode = new NodeDetailsDTO.RelatedNodeDTO();
                String relatedNodeId = obj.toString();
                relatedNode.setNodeId(relatedNodeId);

                if (relatedNodeId.contains("#")) {
                    relatedNode.setNodeLabel(relatedNodeId.substring(relatedNodeId.lastIndexOf('#') + 1));
                } else if (relatedNodeId.contains("/")) {
                    relatedNode.setNodeLabel(relatedNodeId.substring(relatedNodeId.lastIndexOf('/') + 1));
                } else {
                    relatedNode.setNodeLabel(relatedNodeId);
                }

                String predicate = stmt.getPredicate().toString();
                if (predicate.contains("#")) {
                    relatedNode.setRelationshipType(predicate.substring(predicate.lastIndexOf('#') + 1));
                } else if (predicate.contains("/")) {
                    relatedNode.setRelationshipType(predicate.substring(predicate.lastIndexOf('/') + 1));
                } else {
                    relatedNode.setRelationshipType(predicate);
                }

                details.getOutgoingConnections().add(relatedNode);
            }
        }

        // Find incoming connections (where nodeId is object)
        StmtIterator incoming = model.listStatements(null, null, nodeResource);
        while (incoming.hasNext()) {
            Statement stmt = incoming.nextStatement();
            Resource subject = stmt.getSubject();

            NodeDetailsDTO.RelatedNodeDTO relatedNode = new NodeDetailsDTO.RelatedNodeDTO();
            String relatedNodeId = subject.toString();
            relatedNode.setNodeId(relatedNodeId);

            if (relatedNodeId.contains("#")) {
                relatedNode.setNodeLabel(relatedNodeId.substring(relatedNodeId.lastIndexOf('#') + 1));
            } else if (relatedNodeId.contains("/")) {
                relatedNode.setNodeLabel(relatedNodeId.substring(relatedNodeId.lastIndexOf('/') + 1));
            } else {
                relatedNode.setNodeLabel(relatedNodeId);
            }

            String predicate = stmt.getPredicate().toString();
            if (predicate.contains("#")) {
                relatedNode.setRelationshipType(predicate.substring(predicate.lastIndexOf('#') + 1));
            } else if (predicate.contains("/")) {
                relatedNode.setRelationshipType(predicate.substring(predicate.lastIndexOf('/') + 1));
            } else {
                relatedNode.setRelationshipType(predicate);
            }

            details.getIncomingConnections().add(relatedNode);
        }

        return details;
    }

    @Override
    public OntologyStatsDTO getOntologyStatistics(String ontologyContent, String format) {
        OntologyGraphDTO graph = parseOntology(ontologyContent, format);
        return graph.calculateStatistics();
    }

    /**
     * Helper method to load a Jena model from ontology content
     */
    private Model loadModel(String ontologyContent, String format) {
        Model model = ModelFactory.createDefaultModel();
        String jenaFormat = convertFormatToJenaFormat(format);

        try {
            model.read(
                    new ByteArrayInputStream(ontologyContent.getBytes(StandardCharsets.UTF_8)),
                    null,
                    jenaFormat
            );
        } catch (RiotException e) {
            throw new IllegalArgumentException("Failed to parse ontology in format: " + jenaFormat, e);
        }

        return model;
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