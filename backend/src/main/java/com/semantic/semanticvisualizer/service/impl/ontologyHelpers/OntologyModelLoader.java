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

    private static final String FORMAT_RDFXML = "rdfxml";
    private static final String FORMAT_RDFXML_ALT = "rdf/xml";
    private static final String FORMAT_JSONLD = "jsonld";
    private static final String FORMAT_JSONLD_ALT = "json-ld";
    private static final String FORMAT_NTRIPLES = "ntriples";
    private static final String FORMAT_NTRIPLES_ALT = "n-triples";
    private static final String FORMAT_NTRIPLES_SHORT = "nt";
    private static final String FORMAT_TRIG = "trig";
    private static final String FORMAT_TURTLE = "turtle";
    private static final String FORMAT_TURTLE_SHORT = "ttl";

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

        return switch (normalizedFormat) {
            case FORMAT_RDFXML, FORMAT_RDFXML_ALT -> Lang.RDFXML.getName();
            case FORMAT_JSONLD, FORMAT_JSONLD_ALT -> Lang.JSONLD.getName();
            case FORMAT_NTRIPLES, FORMAT_NTRIPLES_ALT, FORMAT_NTRIPLES_SHORT -> Lang.NTRIPLES.getName();
            case FORMAT_TRIG -> Lang.TRIG.getName();
            case FORMAT_TURTLE, FORMAT_TURTLE_SHORT -> Lang.TURTLE.getName();
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
