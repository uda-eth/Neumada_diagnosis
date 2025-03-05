import Anthropic from '@anthropic-ai/sdk';
import { db } from '@db';
import { users } from '@db/schema';
import { eq, ne } from 'drizzle-orm';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface MatchScore {
  userId: number;
  score: number;
  compatibility_reason: string;
}

export async function findMatches(currentUser: any, limit: number = 5): Promise<MatchScore[]> {
  // Get all other users
  const potentialMatches = await db.select().from(users).where(ne(users.id, currentUser.id));

  const matches: MatchScore[] = [];

  for (const potentialMatch of potentialMatches) {
    const userProfile = {
      interests: currentUser.interests || [],
      location: currentUser.location,
      profession: currentUser.profession,
      bio: currentUser.bio
    };

    const matchProfile = {
      interests: potentialMatch.interests || [],
      location: potentialMatch.location,
      profession: potentialMatch.profession,
      bio: potentialMatch.bio
    };

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        messages: [{
          role: "user", 
          content: `Analyze these two digital nomad profiles and provide a compatibility score (0-100) and reason:

User 1: ${JSON.stringify(userProfile)}
User 2: ${JSON.stringify(matchProfile)}

Consider factors like:
- Shared interests
- Location alignment
- Professional synergy
- Potential collaboration opportunities

Return the response as valid JSON with format:
{
  "score": number,
  "reason": "brief explanation"
}`
        }]
      });

      if (response.content[0].type === 'text') {
        const result = JSON.parse(response.content[0].text);
        matches.push({
          userId: potentialMatch.id,
          score: result.score,
          compatibility_reason: result.reason
        });
      }
    } catch (error) {
      console.error(`Error matching with user ${potentialMatch.id}:`, error);
    }
  }

  // Sort by score and return top matches
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}