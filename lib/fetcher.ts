// Enkelt fetch-wrapper til SWR
export default function fetcher<T = any>(url: string): Promise<T> {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Fetch error (${res.status})`);
    return res.json() as Promise<T>;
  });
}
