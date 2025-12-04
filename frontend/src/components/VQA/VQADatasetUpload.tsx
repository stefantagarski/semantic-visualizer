"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileJson, AlertCircle, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VQADatasetUploadProps {
    onDatasetUploaded: (file: File) => Promise<void>
}

const VQADatasetUpload = ({ onDatasetUploaded }: VQADatasetUploadProps) => {
    const [datasetFile, setDatasetFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<"success" | "error" | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleDatasetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setDatasetFile(file)
            setError(null)
        }
    }

    const handleUpload = async () => {
        if (!datasetFile) {
            setError("Please select a VQA dataset file")
            return
        }

        setUploading(true)
        setError(null)

        try {
            await onDatasetUploaded(datasetFile)
            setUploadStatus("success")
        } catch (err: any) {
            setError(err.message || "Upload failed")
            setUploadStatus("error")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="container max-w-2xl mx-auto px-6 py-12">
            <Card className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Upload VQA Dataset</h2>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-3">VQA Dataset (JSON Format)</label>
                        <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleDatasetFileChange}
                                className="hidden"
                                id="dataset-upload"
                            />
                            <label htmlFor="dataset-upload" className="cursor-pointer flex flex-col items-center">
                                <FileJson className="w-12 h-12 text-muted-foreground mb-3" />
                                <p className="text-sm text-foreground mb-1">
                                    {datasetFile ? datasetFile.name : "Click to select VQA dataset"}
                                </p>
                                <p className="text-xs text-muted-foreground">JSON files only</p>
                            </label>
                        </div>

                        {datasetFile && (
                            <div className="mt-2 flex items-center gap-2 text-green-600 dark:text-green-500">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">File selected</span>
                            </div>
                        )}
                    </div>

                    <Button className="w-full" onClick={handleUpload} disabled={!datasetFile || uploading}>
                        {uploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Dataset
                            </>
                        )}
                    </Button>

                    <Card className="bg-primary/5 border-primary/20 p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-2">Expected Format</h3>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• JSON file with questions array</li>
                            <li>• Each question should have: questionText, expectedPath</li>
                            <li>• Optional: difficulty level (easy/medium/hard)</li>
                        </ul>
                    </Card>
                </div>
            </Card>
        </div>
    )
}

export default VQADatasetUpload
