package com.semantic.semanticvisualizer.service.impl.ontologyHelpers;

import com.semantic.semanticvisualizer.model.Triple;
import com.semantic.semanticvisualizer.model.dto.OntologyGraphDTO;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdf.model.StmtIterator;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class OntologyGraphBuilder {

    private static final int BATCH_SIZE = 500;

    public OntologyGraphDTO buildGraphFromModel(Model model, int maxNodes) {
        OntologyGraphDTO graph = new OntologyGraphDTO();
        Map<String, Integer> nodeDegrees = new HashMap<>();

        StmtIterator iterator = model.listStatements();
        List<Statement> batchStatements = new ArrayList<>(BATCH_SIZE);

        while (iterator.hasNext()) {
            batchStatements.add(iterator.nextStatement());
            if (batchStatements.size() >= BATCH_SIZE) {
                processBatch(graph, batchStatements, nodeDegrees);
                batchStatements.clear();
            }
        }

        if (!batchStatements.isEmpty()) {
            processBatch(graph, batchStatements, nodeDegrees);
        }

        return graph;
    }

    private void processBatch(OntologyGraphDTO graph, List<Statement> batchStatements,
                              Map<String, Integer> nodeDegrees) {

        for (Statement stmt : batchStatements) {
            String subject = stmt.getSubject().toString();
            String predicate = stmt.getPredicate().toString();
            String object = stmt.getObject().toString();

            graph.addTriple(new Triple(subject, predicate, object));

            nodeDegrees.merge(subject, 1, Integer::sum);
            nodeDegrees.merge(object, 1, Integer::sum);
        }
    }
}
