// components/InitModal.tsx
import React from 'react';

interface InitModalProps {
  onAccept: () => void;
}

export default function InitModal({ onAccept }: InitModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Velkommen til Sokrates.chat</h2>
        <p className="mb-6">
          Denne chatten vil stille deg sokratiske spørsmål for å samle inn
          din sykehistorie før konsultasjonen hos legen. Når du er klar,
          trykk på knappen under for å starte.
        </p>
        <button
          onClick={onAccept}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
        >
          Start chat
        </button>
      </div>
    </div>
  );
}
