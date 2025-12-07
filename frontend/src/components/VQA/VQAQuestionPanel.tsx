import { HelpCircle, RotateCcw, CheckCircle2, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';


interface VQAQuestionPanelProps {
    question: any;
    questionIndex: number;
    totalQuestions: number;
    userPath: string[];
    onReset: () => void;
    onSubmit: () => void;
    onRemoveNode: (index: number) => void;
    score: number;
}

const VQAQuestionPanel = ({
                              question,
                              questionIndex,
                              totalQuestions,
                              userPath,
                              onReset,
                              onSubmit,
                              onRemoveNode,
                              score
                          }: VQAQuestionPanelProps) => {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'bg-green-500/10 text-green-700 dark:text-green-400';
            case 'medium': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
            case 'hard': return 'bg-red-500/10 text-red-700 dark:text-red-400';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="w-96 border-r border-border bg-card flex flex-col">

            {/* Header */}
            <div className="bg-gradient-to-r from-secondary/20 to-secondary/30 border-b border-border p-6">
                <h2 className="text-2xl font-bold mb-2 text-foreground">VQA Explorer</h2>
                <p className="text-sm text-muted-foreground">Navigate the graph to answer questions</p>

                <Card className="mt-4 bg-card border-border">
                    <div className="p-3 flex justify-between text-sm">
                        <span>Question {questionIndex + 1}/{totalQuestions}</span>
                    </div>
                </Card>
            </div>

            {/* Question Section */}
            <div className="p-6 border-b border-border">
                <div className="flex items-start gap-3 mb-4">
                    <HelpCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <p className="text-base font-medium text-foreground leading-relaxed">
                        {question?.questionText || question?.question}
                    </p>
                </div>

                {question?.difficulty && (
                    <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty.toUpperCase()}
                    </Badge>
                )}
            </div>

            {/* Path Section */}
            <ScrollArea className="flex-1 px-6 py-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Your Path:</h3>
                {userPath.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                        Click nodes in sequence to build your path
                    </p>
                ) : (
                    <div className="space-y-2">
                        {userPath.map((node, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-sm font-medium text-foreground">
                                    {node.split('/').pop()}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-destructive/10"
                                    onClick={() => onRemoveNode(idx)}
                                >
                                    <X className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {/* Actions */}
            <div className="p-6 border-t border-border bg-muted/30">
                <Button
                    className="w-full mb-3"
                    onClick={onSubmit}
                    disabled={userPath.length === 0}
                >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Submit Answer
                </Button>

                <Button
                    variant="outline"
                    className="w-full bg-card text-foreground border-border hover:bg-accent"
                    onClick={onReset}
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                </Button>
            </div>
        </div>
    );
};

export default VQAQuestionPanel;
