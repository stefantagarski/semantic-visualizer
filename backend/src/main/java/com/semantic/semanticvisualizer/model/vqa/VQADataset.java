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
public class VQADataset {
    private String id;
    private String name;
    private String format; // e.g., "FVQA (JSON)"
    private List<VQAQuestion> questions;
    private int questionCount;
    private LocalDateTime uploadedAt;
    private String description;
}
