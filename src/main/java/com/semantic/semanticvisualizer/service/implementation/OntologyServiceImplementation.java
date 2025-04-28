package com.semantic.semanticvisualizer.service.implementation;

import com.semantic.semanticvisualizer.model.OntologyGraphDTO;
import com.semantic.semanticvisualizer.model.Triple;
import com.semantic.semanticvisualizer.service.OntologyService;
import org.springframework.stereotype.Service;
import org.apache.jena.rdf.model.*;
import org.apache.jena.riot.RiotException;


import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

@Service
public class OntologyServiceImplementation implements OntologyService {
    @Override
    public OntologyGraphDTO parseOntology(String ontologyContent) {
        Model model = ModelFactory.createDefaultModel();

        try {
            model.read(
                    new ByteArrayInputStream(ontologyContent.getBytes(StandardCharsets.UTF_8)),
                    null,
                    "TURTLE" // assuming Turtle syntax

            );
        } catch (RiotException e) {
            throw new IllegalArgumentException("Failed to parse ontology: Invalid OWL/Turtle format.", e);
        }

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
}
