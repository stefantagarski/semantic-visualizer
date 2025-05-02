package com.semantic.semanticvisualizer.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Triple {
    //RDF triple (subject-predicate-object)
    private String subject;
    private String predicate;
    private String object;
}
