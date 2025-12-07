import React, { useState, useRef } from 'react';
import { useGraphInteraction } from '../../hooks/useGraphInteraction';
import VQADatasetUpload from './VQADatasetUpload.js';
import VQAQuestionPanel from './VQAQuestionPanel.js';
import VQAFeedbackPanel from './VQAFeedbackPanel';
import GraphVisualizer from '../GraphVisualizer/GraphVisualizer';
import './VQAComponent.css';
import VQAService from "@/services/VQAService.js";
import SearchBar from "@/components/GraphVisualizer/search-bar/SearchBar";

const VQAComponent = () => {
    const [datasetLoaded, setDatasetLoaded] = useState(false);
    const [graphData, setGraphData] = useState(null);
    const [_dataset, setDataset] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [session, setSession] = useState(null);
    const [validationResult, setValidationResult] = useState(null);
    const [score, setScore] = useState(0);
    const [_loading, setLoading] = useState(false);
    const [_selectedNodeInfo, setSelectedNodeInfo] = useState(null);
    const graphRef = useRef(null);

    const { userPath, handleNodeClick, resetPath, removeNodeAtIndex } = useGraphInteraction();

    const handleDatasetUpload = async (file) => {
        try {
            setLoading(true);

            let uploadedDataset = await VQAService.uploadDataset(file);
            setDataset(uploadedDataset);

            if (!uploadedDataset.questions?.length) {
                alert("Dataset contains no questions.");
                return;
            }

            setQuestions(uploadedDataset.questions);
            setCurrentQuestion(uploadedDataset.questions[0]);

            const backendGraph = await VQAService.getGraph(uploadedDataset.id);
            setGraphData(backendGraph);

            const sessionData = await VQAService.startSession(uploadedDataset.questions[0].id);
            setSession(sessionData);

            setDatasetLoaded(true);
        } catch (error) {
            alert("Failed to load dataset: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Next question
     */
    const handleNext = async () => {
        resetPath();
        setValidationResult(null);

        if (questionIndex < questions.length - 1) {
            const nextIndex = questionIndex + 1;
            const nextQuestion = questions[nextIndex];

            setQuestionIndex(nextIndex);
            setCurrentQuestion(nextQuestion);

            if (session) {
                try {
                    const sessionData = await VQAService.startSession(nextQuestion.id);
                    console.log("New session started:", sessionData);
                    setSession(sessionData);
                } catch (error) {
                    console.error("Failed to start new session:", error);
                }
            }
        }
    };

    const handleRemoveNode = (index) => {
        removeNodeAtIndex(index);
    };

    /** Called when user clicks a node inside the graph */
    const handleVQANodeSelect = (nodeId, event) => {
        if (!nodeId) return;

        // Find the full node object from graphData
        const node = graphData.nodes.find(n => n.id === nodeId);

        if (node && event) {
            // Store node info and position for popup
            setSelectedNodeInfo(node);
        }

        handleNodeClick(nodeId); // Add to VQA path
    };

    const handleSubmit = async () => {
        if (!session || userPath.length === 0) return;

        const payload = {
            sessionId: session.sessionId,
            questionId: currentQuestion.id,
            nodeURIs: userPath
        };

        const result = await VQAService.validatePath(session.sessionId, payload);
        setValidationResult(result);

        if (result.isCorrect) setScore(prev => prev + 1);

        resetPath();

        if (graphRef.current) {
            graphRef.current.resetView?.(); // Reset zoom/camera
            graphRef.current.clearHighlights?.(); // Clear any highlighted nodes/edges
            graphRef.current.deselectNode?.(); // Clear selected node
        }
    };


    if (!datasetLoaded || !graphData)
        return <VQADatasetUpload onDatasetUploaded={handleDatasetUpload} />;

    return (
        <div className="vqa-main-container">

            <VQAQuestionPanel
                question={currentQuestion}
                questionIndex={questionIndex}
                totalQuestions={questions.length}
                userPath={userPath}
                onReset={resetPath}
                onSubmit={handleSubmit}
                onRemoveNode={handleRemoveNode}
                score={score}
            />

            <div className="vqa-graph-section">

                {/* SEARCH BAR — DOES NOT AFFECT VQA PATH */}
                <div className="absolute top-4 left-4 z-50" style={{ width: 350 }}>
                    <SearchBar
                        key={currentQuestion.id}
                        graphData={graphData}
                        onNodeSelect={(id) => {
                            if (!id) return;
                            graphRef.current?.focusNode(id);
                        }}
                        selectedNode={null}
                    />
                </div>

                <GraphVisualizer
                    ref={graphRef}
                    graphData={graphData}
                    onNodeSelect={handleVQANodeSelect}     // ONLY graph clicks go to VQA path
                    hideControls={true}
                />
            </div>

            <VQAFeedbackPanel
                validationResult={validationResult}
                onNext={handleNext}
                onRetry={() => {
                    resetPath();
                    setValidationResult(null);
                }}
                hasMore={questionIndex < questions.length - 1}
            />
        </div>
    );
};

export default VQAComponent;
