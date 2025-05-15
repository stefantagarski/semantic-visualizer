import React, { useState, useRef } from 'react';
import { Upload, File, Check, X, FileText } from 'lucide-react';

const FileUploadForm = ({
                            onSubmit,
                            formatType,
                            setFormatType,
                            onCancel,
                            isLoading
                        }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const openFileSelector = () => {
        fileInputRef.current.click();
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (selectedFile) {
            onSubmit(e, selectedFile);
        }
    };

    return (
        <div className="card-form" onDragEnter={handleDrag}>
            <h2 className="card-title">
                <FileText className="inline-block mr-2" />
                Upload Ontology File
            </h2>

            <input
                type="file"
                id="ontology-file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
            />

            {!selectedFile ? (
                <div
                    className={`upload-area flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
                    }`}
                    onClick={openFileSelector}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <Upload size={48} className="text-blue-500 mb-4" />
                    <p className="text-lg font-medium text-gray-700">
                        Drag and drop your file here
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        or click to browse files
                    </p>
                    <p className="text-xs text-gray-400 mt-4">
                        Supported formats: TURTLE, RDF/XML, JSON-LD, N-TRIPLE, TRIG
                    </p>
                </div>
            ) : (
                <div className="selected-file bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                <File className="text-blue-500" size={24} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500">
                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={removeFile}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="upload-status mt-3 flex items-center">
                        <div className="bg-green-100 p-1 rounded-full mr-2">
                            <Check size={16} className="text-green-500" />
                        </div>
                        <span className="text-sm text-green-700">Ready to upload</span>
                    </div>
                </div>
            )}

            <div className="form-footer mt-6">
                <div className="format-select flex items-center">
                    <label className="text-gray-700 mr-2">Format:</label>
                    <select
                        value={formatType}
                        onChange={(e) => setFormatType(e.target.value)}
                        className="bg-white border border-gray-300 text-gray-800 rounded-md px-3 py-2"
                    >
                        <option value="turtle">TURTLE</option>
                        <option value="rdfxml">RDF/XML</option>
                        <option value="jsonld">JSON-LD</option>
                        <option value="ntriples">N-TRIPLE</option>
                        <option value="trig">TRIG</option>
                    </select>
                </div>

                <div className="form-buttons">
                    <button
                        onClick={handleFormSubmit}
                        className={`primary-btn flex items-center ${!selectedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading || !selectedFile}
                    >
                        {isLoading ? (
                            <>
                                <div className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={18} className="mr-2" />
                                Upload
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="secondary-btn"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileUploadForm;