// pages/404.tsx
export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404 – Siden ble ikke funnet</h1>
      <p className="mb-6">Beklager, vi finner ikke siden du leter etter.</p>
      <a
        href="mailto:damoun.nassehi@uib.no?subject=Feilrapport%20404"
        className="text-blue-600 hover:underline"
      >
        Rapporter feil
      </a>
    </div>
  );
}
