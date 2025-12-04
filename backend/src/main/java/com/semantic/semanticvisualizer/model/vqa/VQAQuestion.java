package com.semantic.semanticvisualizer.model.vqa;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VQAQuestion {

    @JsonProperty("id")
    @JsonAlias({"question_id"})
    private String id;

    @JsonProperty("questionText")
    @JsonAlias({"question"})
    private String questionText;

    @JsonProperty("expectedPath")
    @JsonAlias({"correctPathNodeUris", "answerPath"}) // expected answer path
    private List<String> expectedPath;

    @JsonProperty("answer")
    private String answer; // FVQA answer

    @JsonProperty("difficulty")
    private String difficulty;

    @JsonProperty("img_file")
    @JsonAlias({"imageId"})
    private String imageId;

    @JsonProperty("fact_surface")
    private String factSurface;

    @JsonProperty("fact_id")
    private String factId;

    @JsonProperty("triple")
    private TripleVQA triple; // FVQA triple

    @JsonProperty("answerTriplets")
    private List<TripleVQA> answerTriplets;

//    private String category;
//    private String source;
//    private String kbSource;
}
