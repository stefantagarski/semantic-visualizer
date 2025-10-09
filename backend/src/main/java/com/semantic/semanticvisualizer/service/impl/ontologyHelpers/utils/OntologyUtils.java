package com.semantic.semanticvisualizer.service.impl.ontologyHelpers.utils;

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
}
