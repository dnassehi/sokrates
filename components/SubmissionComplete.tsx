// components/SubmissionComplete.tsx
import React from 'react';

interface SubmissionCompleteProps {
  onNewRequest: () => void;
}

export default function SubmissionComplete({ onNewRequest }: SubmissionCompleteProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <p className="text-2xl font-semibold mb-6">
        Oppsummeringen din er sendt!
      </p>
      <button
        onClick={onNewRequest}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
      >
        Ny henvendelse
      </button>
    </div>
  );
}
