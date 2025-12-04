package com.semantic.semanticvisualizer.service.impl.ontologyHelpers;

import com.semantic.semanticvisualizer.model.dto.NodeDetailsDTO;
import com.semantic.semanticvisualizer.service.impl.ontologyHelpers.utils.OntologyUtils;
import org.apache.jena.rdf.model.*;
import org.springframework.stereotype.Service;

@Service
public class OntologyNodeDetails {

    public NodeDetailsDTO extractDetails(Model model, String nodeId) {

        if (model == null || nodeId == null || nodeId.isEmpty()) {
            throw new IllegalArgumentException("Model and nodeId must be provided");
        }

        NodeDetailsDTO details = new NodeDetailsDTO();
        details.setId(nodeId);
        details.setLabel(OntologyUtils.extractLabelFromModel(model, nodeId));

        Resource nodeResource = model.createResource(nodeId);

        StmtIterator outgoing = model.listStatements(nodeResource, null, (RDFNode) null);
        while (outgoing.hasNext()) {
            Statement stmt = outgoing.nextStatement();
            RDFNode obj = stmt.getObject();

            String objectId, objectLabel;

            if (obj.isResource()) { // handling resources
                objectId = obj.toString();
                objectLabel = OntologyUtils.extractLabelFromModel(model, objectId);
            } else if (obj.isLiteral()) { // handling literals
                objectId = obj.asLiteral().getString();
                objectLabel = objectId; // literals are their own labels
            } else {
                continue; // skip unknown types
            }

            details.getOutgoingConnections().add(new NodeDetailsDTO.RelatedNodeDTO(
                    objectId,
                    objectLabel,
                    OntologyUtils.extractLabelFromModel(model, stmt.getPredicate().toString())
            ));
        }

        StmtIterator incoming = model.listStatements(null, null, nodeResource);
        while (incoming.hasNext()) {
            Statement stmt = incoming.nextStatement();
            Resource subject = stmt.getSubject();
            details.getIncomingConnections().add(new NodeDetailsDTO.RelatedNodeDTO(
                    subject.toString(),
                    OntologyUtils.extractLabelFromModel(model, subject.toString()),
                    OntologyUtils.extractLabelFromModel(model, stmt.getPredicate().toString())
            ));
        }

        outgoing.close();
        incoming.close();

        return details;
    }
}
