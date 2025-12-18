const API_KEY = "4a9c7db621d64b1b2b484eb909a01de0";

export async function fetchTopNews() {
  const response = await fetch(
    `https://gnews.io/api/v4/top-headlines?lang=en&country=in&max=10&token=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }

  return response.json();
}
