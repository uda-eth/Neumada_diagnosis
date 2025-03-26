
import { getJson } from 'serpapi';

const SERPAPI_KEY = process.env.SERPAPI_KEY;

export async function webSearch(query: string) {
  try {
    const response = await getJson({
      engine: "google",
      q: query,
      api_key: SERPAPI_KEY,
      num: 3 // Limit to 3 results for conciseness
    });

    const results = response.organic_results?.map((result: any) => ({
      title: result.title,
      snippet: result.snippet,
      link: result.link
    })) || [];

    return results;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}
