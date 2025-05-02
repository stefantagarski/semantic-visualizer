package com.semantic.semanticvisualizer.service.implementation;

import com.semantic.semanticvisualizer.model.OntologyGraphDTO;
import com.semantic.semanticvisualizer.model.Triple;
import com.semantic.semanticvisualizer.service.OntologyService;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.apache.jena.rdf.model.*;
import org.apache.jena.riot.RiotException;


import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

@Service
public class OntologyServiceImplementation implements OntologyService {
    @Override
    public OntologyGraphDTO parseOntology(String ontologyContent, String format) {
        Model model = ModelFactory.createDefaultModel();

        String jenaFormat = getString(format);

        try {
            model.read(
                    new ByteArrayInputStream(ontologyContent.getBytes(StandardCharsets.UTF_8)),
                    null,
                    jenaFormat
            );
        } catch (RiotException e) {
            throw new IllegalArgumentException("Failed to parse ontology in format: " + jenaFormat, e);
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

    @NotNull
    private static String getString(String format) {
        String jenaFormat;

        if (format.equalsIgnoreCase("rdfxml")) {
            jenaFormat = "RDF/XML";
        } else if (format.equalsIgnoreCase("jsonld")) {
            jenaFormat = "JSON-LD";
        } else if (format.equalsIgnoreCase("ntriples")) {
            jenaFormat = "N-TRIPLE";
        } else if (format.equalsIgnoreCase("trig")) {
            jenaFormat = "TRIG";
        } else if (format.equalsIgnoreCase("turtle")) {
            jenaFormat = "TURTLE";
        } else {
            throw new IllegalArgumentException("Unsupported format: " + format);
        }
        return jenaFormat;
    }
}
