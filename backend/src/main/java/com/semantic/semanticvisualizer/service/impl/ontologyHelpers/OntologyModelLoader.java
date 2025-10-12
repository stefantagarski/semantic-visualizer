package com.semantic.semanticvisualizer.service.impl.ontologyHelpers;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RiotException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Component
public class OntologyModelLoader {

    public Model loadModel(String ontologyContent, String format) {
        if (ontologyContent == null || ontologyContent.isEmpty()) {
            throw new IllegalArgumentException("Ontology content cannot be empty");
        }

        Model model = ModelFactory.createDefaultModel();
        try {
            model.read(
                    new java.io.ByteArrayInputStream(ontologyContent.getBytes(StandardCharsets.UTF_8)),
                    null,
                    convertFormat(format)
            );
        } catch (RiotException e) {
            throw new IllegalArgumentException("Failed to parse ontology in format: " + format, e);
        }

        return model;
    }

    private String convertFormat(String format) {
        if (format == null) {
            throw new IllegalArgumentException("Format cannot be null");
        }

        return switch (format.toLowerCase().trim()) {
            case "rdfxml", "rdf/xml" -> Lang.RDFXML.getName();
            case "jsonld", "json-ld" -> Lang.JSONLD.getName();
            case "ntriples", "n-triples", "nt" -> Lang.NTRIPLES.getName();
            case "trig" -> Lang.TRIG.getName();
            case "turtle", "ttl" -> Lang.TURTLE.getName();
            default ->
                    throw new IllegalArgumentException("Unsupported format: " + format + ". Supported formats: turtle, rdfxml, jsonld, ntriples, trig, nquads");
        };
    }

    public Model loadModelFromFile(MultipartFile file, String format) throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            Model model = ModelFactory.createDefaultModel();
            model.read(inputStream, null, convertFormat(format));
            return model;
        }
    }
}