package com.semantic.semanticvisualizer.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
//import org.apache.jena.graph.Triple;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class OntologyGraphDTO {

   private Set<String> nodes = new HashSet<>();
   private List<Triple> edges = new ArrayList<>();

   // method for adding new triples to the graph , has single source of truth
   public void addTriple(Triple triple){
        if(triple != null) {
            nodes.add(triple.getSubject());
            nodes.add(triple.getObject());
            edges.add(triple);
        }
   }

   // resets the state of the triple
   public void clear(){
       nodes.clear();
       edges.clear();
   }

}
