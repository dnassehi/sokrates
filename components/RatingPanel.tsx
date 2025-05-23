// components/RatingPanel.tsx
import { useState } from 'react';

interface RatingPanelProps {
  sessionId: string;
  patientId: string;
}

export default function RatingPanel({ sessionId, patientId }: RatingPanelProps) {
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const saveRating = async () => {
    if (score == null) {
      setError('Velg en karakter før du lagrer.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/saveRating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, patientId, score, comment }),
      });
      if (!res.ok) throw new Error('Serverfeil ved lagring');
      // Du kan eventuelt vise en toast her
    } catch (err: any) {
      setError(err.message || 'Ukjent feil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-t mt-6">
      <h3 className="text-lg font-semibold mb-2">Din vurdering av anamnesen</h3>

      <div className="flex gap-4 mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={n}
              checked={score === n}
              onChange={() => setScore(n)}
              className="mr-1"
            />
            {n}
          </label>
        ))}
      </div>

      <textarea
        placeholder="Kommentar (valgfritt)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full border rounded p-2 mb-4 focus:outline-none focus:ring"
        rows={3}
      />

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      <button
        onClick={saveRating}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Lagrer…' : 'Lagre vurdering'}
      </button>
    </div>
  );
}
