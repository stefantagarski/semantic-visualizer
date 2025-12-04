package com.semantic.semanticvisualizer.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Triple {
    //RDF triple (subject-predicate-object)
    private String subject;
    private String predicate;
    private String object;
}
