"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { validateCastFile, formatFileSize, formatDuration } from "@/lib/recordingUtils";

interface RecordingUploadProps {
  prId: Id<"pullRequests">;
  onUploadComplete?: (metadata: { duration: number; fileSize: number }) => void;
  onError?: (error: string) => void;
}

export function RecordingUpload({
  prId,
  onUploadComplete,
  onError,
}: RecordingUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [recordingMetadata, setRecordingMetadata] = useState<{
    duration: number;
    fileSize: number;
  } | null>(null);

  const generateUploadUrl = useMutation(api.recordings.generateRecordingUploadUrl);
  const attachRecording = useMutation(api.recordings.attachRecordingToPR);

  const handleFileSelect = async (selectedFile: File) => {
    setValidationError(null);
    setUploadSuccess(false);
    setFile(selectedFile);

    // Validate the file
    const validation = await validateCastFile(selectedFile);
    if (!validation.valid) {
      setValidationError(validation.error || "Invalid file");
      setFile(null);
      return;
    }

    // Store metadata for later
    if (validation.metadata) {
      setRecordingMetadata({
        duration: validation.metadata.duration,
        fileSize: selectedFile.size,
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !recordingMetadata) {
      setValidationError("No file selected");
      return;
    }

    setIsUploading(true);
    setValidationError(null);

    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file to Convex storage
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const { storageId } = await response.json();

      // Attach recording to PR
      await attachRecording({
        prId,
        storageId,
        metadata: recordingMetadata,
      });

      setUploadSuccess(true);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onUploadComplete?.(recordingMetadata);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setValidationError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClear = () => {
    setFile(null);
    setValidationError(null);
    setUploadSuccess(false);
    setRecordingMetadata(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".cast"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {!file ? (
          <div className="space-y-3">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Drag and drop your .cast file here
              </p>
              <p className="text-xs text-gray-500 mt-1">or</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Browse files
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Asciicast v2 or v3 format, max 50MB
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              {recordingMetadata && (
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <p>Duration: {formatDuration(recordingMetadata.duration)}</p>
                  <p>Size: {formatFileSize(recordingMetadata.fileSize)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {validationError && (
        <div className="flex items-start space-x-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Upload Error</p>
            <p className="text-sm text-red-700 mt-1">{validationError}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="flex items-start space-x-3 bg-green-50 border border-green-200 rounded-lg p-4">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">
              Recording uploaded successfully!
            </p>
            <p className="text-sm text-green-700 mt-1">
              Your session recording has been attached to this PR.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {file && !uploadSuccess && (
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClear}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Upload Recording</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          How to record your session:
        </h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Install asciinema: <code className="bg-blue-100 px-1 rounded">brew install asciinema</code></li>
          <li>Start recording: <code className="bg-blue-100 px-1 rounded">asciinema rec session.cast</code></li>
          <li>Run your agent and complete the task</li>
          <li>Exit the shell to stop recording</li>
          <li>Upload the generated .cast file here</li>
        </ol>
      </div>
    </div>
  );
}

