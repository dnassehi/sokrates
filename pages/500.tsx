import { useRouter } from 'next/router';
export default function Custom500() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">500 – Oisann, noe gikk galt</h1>
      <p className="mb-6">Vi beklager. Vårt team er varslet.</p>
      <div className="flex gap-4">
        <button onClick={() => router.reload()} className="bg-blue-600 text-white px-4 py-2 rounded">Prøv igjen</button>
        <a href="mailto:damoun.nassehi@uib.no?subject=Feilrapport%20500" className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Rapporter feil</a>
      </div>
    </div>
  );
}