package com.semantic.semanticvisualizer.service.impl.ontologyHelpers;

import com.semantic.semanticvisualizer.model.NodeDetailsDTO;
import com.semantic.semanticvisualizer.service.impl.ontologyHelpers.utils.OntologyUtils;
import org.apache.jena.rdf.model.*;
import org.springframework.stereotype.Service;

@Service
public class OntologyNodeDetails {

    public NodeDetailsDTO extractDetails(Model model, String nodeId) {
        NodeDetailsDTO details = new NodeDetailsDTO();
        details.setId(nodeId);
        details.setLabel(OntologyUtils.extractLabel(nodeId));

        Resource nodeResource = model.createResource(nodeId);

        StmtIterator outgoing = model.listStatements(nodeResource, null, (RDFNode) null);
        while (outgoing.hasNext()) {
            Statement stmt = outgoing.nextStatement();
            RDFNode obj = stmt.getObject();
            if (obj.isResource()) {
                details.getOutgoingConnections().add(new NodeDetailsDTO.RelatedNodeDTO(
                        obj.toString(),
                        OntologyUtils.extractLabel(obj.toString()),
                        OntologyUtils.extractLabel(stmt.getPredicate().toString())
                ));
            }
        }

        StmtIterator incoming = model.listStatements(null, null, nodeResource);
        while (incoming.hasNext()) {
            Statement stmt = incoming.nextStatement();
            Resource subject = stmt.getSubject();
            details.getIncomingConnections().add(new NodeDetailsDTO.RelatedNodeDTO(
                    subject.toString(),
                    OntologyUtils.extractLabel(subject.toString()),
                    OntologyUtils.extractLabel(stmt.getPredicate().toString())
            ));
        }

        outgoing.close();
        incoming.close();

        return details;
    }
}
