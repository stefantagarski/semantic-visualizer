package com.semantic.semanticvisualizer.model.vqa;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VQASessionDTO {
    private String sessionId;
    private String questionId;
    private List<String> currentPathNodeURIs;
    private LocalDateTime startTime;
    private boolean completed;
    private int attempts;
    private int expectedPathLength;
    private double progress;
    private String difficulty;
}
