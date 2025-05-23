export default function SubmissionComplete({ onNewRequest }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <p className="text-2xl mb-6">Oppsummeringen din er sendt!</p>
      <button onClick={onNewRequest} className="bg-blue-600 text-white px-6 py-2 rounded">Ny henvendelse</button>
    </div>
  );
}