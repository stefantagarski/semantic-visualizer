package com.semantic.semanticvisualizer.service;

import com.semantic.semanticvisualizer.model.OntologyGraphDTO;

public interface OntologyService {
    OntologyGraphDTO parseOntology(String ontologyContent);
}
