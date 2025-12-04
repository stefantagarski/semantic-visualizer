package com.semantic.semanticvisualizer.model.vqa;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TripleVQA {
    private KGEntity subject;
    private KGRelation relation;
    private KGEntity object;

    public static TripleVQA fromRdf(String subjUri, String predUri, String objUri) {
        return TripleVQA.builder()
                .subject(KGEntity.builder()
                        .label(extractLocalName(subjUri))
                        .uri(subjUri)
                        .build())
                .relation(KGRelation.builder()
                        .label(extractLocalName(predUri))
                        .uri(predUri)
                        .build())
                .object(KGEntity.builder()
                        .label(extractLocalName(objUri))
                        .uri(objUri)
                        .build())
                .build();
    }

    private static String extractLocalName(String uri) {
        if (uri == null) return null;
        int idx = Math.max(uri.lastIndexOf('#'), uri.lastIndexOf('/'));
        return idx >= 0 ? uri.substring(idx + 1) : uri;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class KGEntity {
        private String label;
        private String uri;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class KGRelation {
        private String label;
        private String uri;
    }
}
