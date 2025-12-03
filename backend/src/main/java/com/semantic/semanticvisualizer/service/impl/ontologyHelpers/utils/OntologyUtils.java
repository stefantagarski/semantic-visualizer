package com.semantic.semanticvisualizer.service.impl.ontologyHelpers.utils;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDFS;
import org.springframework.stereotype.Component;

@Component
public class OntologyUtils {

    public static String extractLabel(String uri) {
        if (uri.isEmpty()) {
            return "";
        }
        if (uri.contains("#")) {
            return uri.substring(uri.lastIndexOf('#') + 1);
        } else if (uri.contains("/")) {
            return uri.substring(uri.lastIndexOf('/') + 1);
        }
        return uri;
    }

    public static String extractLabelFromModel(Model model, String uri) {
        if (model == null || uri == null || uri.isEmpty()) {
            return extractLabel(uri);
        }
        try {
            Resource resource = model.getResource(uri);

            if (resource.hasProperty(RDFS.label)) {
                return resource.getProperty(RDFS.label).getString();
            }
        } catch (Exception e) {
            // Fall back to the basic heuristic
        }
        return extractLabel(uri);
    }

}
