// pages/terms.tsx
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6 text-center">Vilkår og personvern</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">1. Vilkår og betingelser</h2>
          <p>Ved å bruke Sokrates.chat godtar du følgende:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Tjenesten er et AI-verktøy – ikke en erstatning for legekonsultasjon.</li>
            <li>All informasjon behandles pseudonymt og deles bare med den oppgitte legen.</li>
            <li>Vilkårene kan endres; oppdateringer publiseres her med dato.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Personvern</h2>
          <p>Vi følger GDPR, European AI Act og norske Normen:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Data pseudonymiseres – sletting krever klinikkode + timestamp.</li>
            <li>DPA med OpenAI er inngått; data anonymiseres og beholdes maksimalt 30 dager der.</li>
            <li>Våre egne logger slettes tidligst etter 5 år (forskningsperiode).</li>
          </ul>
          <p className="mt-4">
            Kontakt: <a href="mailto:damoun.nassehi@uib.no" className="text-blue-600 hover:underline">damoun.nassehi@uib.no</a>
          </p>
        </section>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            Tilbake til forsiden
          </Link>
        </div>
      </div>
    </div>
  );
}
