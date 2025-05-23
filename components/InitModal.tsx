export default function InitModal({ onAccept }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg">
        <h2 className="text-2xl mb-4">Velkommen til Sokrates-chat!</h2>
        <p className="mb-4">Denne chatten hjelper deg å samle inn sykehistorien før timen.</p>
        <button onClick={onAccept} className="bg-blue-600 text-white px-4 py-2 rounded">Start chat</button>
      </div>
    </div>
  );
}