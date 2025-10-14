"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Download, ExternalLink, Play } from "lucide-react";
import { formatFileSize, formatDuration, extractAsciinemaId } from "@/lib/recordingUtils";

interface RecordingDisplayProps {
  prId: Id<"pullRequests">;
  showDownload?: boolean;
}

export function RecordingDisplay({
  prId,
  showDownload = true,
}: RecordingDisplayProps) {
  const recordingMetadata = useQuery(api.recordings.getRecordingMetadata, {
    prId,
  });
  const downloadUrl = useQuery(api.recordings.getRecordingDownloadUrl, {
    prId,
  });

  if (!recordingMetadata?.hasRecording) {
    return null;
  }

  const { recordingUrl, metadata } = recordingMetadata;
  const isAsciinemaOrg = recordingUrl?.includes("asciinema.org");
  const recordingId = isAsciinemaOrg ? extractAsciinemaId(recordingUrl || "") : null;

  return (
    <div className="space-y-4">
      {/* Recording Header */}
      <div className="flex items-center space-x-2">
        <Play className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Agent Session Recording
        </h3>
      </div>

      {/* Embedded Player (if asciinema.org) */}
      {isAsciinemaOrg && recordingId && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <script
            async
            id={`asciicast-${recordingId}`}
            src={`https://asciinema.org/a/${recordingId}.js`}
          ></script>
          <div id={`asciicast-${recordingId}`} className="p-4">
            <p className="text-sm text-gray-600">
              Loading recording player...
            </p>
          </div>
        </div>
      )}

      {/* Recording Info */}
      {metadata && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Duration
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDuration(metadata.duration)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                File Size
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {formatFileSize(metadata.fileSize)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">
              Format
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {metadata.format}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {recordingUrl && (
          <a
            href={recordingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View on Asciinema</span>
          </a>
        )}

        {showDownload && downloadUrl && (
          <a
            href={downloadUrl}
            download
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download .cast</span>
          </a>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> You can replay this recording locally with{" "}
          <code className="bg-blue-100 px-1 rounded">asciinema play session.cast</code>
        </p>
      </div>
    </div>
  );
}

