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

        String normalizedFormat = format.toLowerCase().trim();

        if (normalizedFormat.equals("rdfxml") || normalizedFormat.equals("rdf/xml")) {
            return Lang.RDFXML.getName();
        } else if (normalizedFormat.equals("jsonld") || normalizedFormat.equals("json-ld")) {
            return Lang.JSONLD.getName();
        } else if (normalizedFormat.equals("ntriples") || normalizedFormat.equals("n-triples")
                || normalizedFormat.equals("nt")) {
            return Lang.NTRIPLES.getName();
        } else if (normalizedFormat.equals("trig")) {
            return Lang.TRIG.getName();
        } else if (normalizedFormat.equals("turtle") || normalizedFormat.equals("ttl")) {
            return Lang.TURTLE.getName();
        } else {
            throw new IllegalArgumentException("Unsupported format: " + format + ". Supported formats: turtle, rdfxml, jsonld, ntriples, trig, nquads");
        }
    }

    public Model loadModelFromFile(MultipartFile file, String format) throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            Model model = ModelFactory.createDefaultModel();
            model.read(inputStream, null, convertFormat(format));
            return model;
        }
    }
}