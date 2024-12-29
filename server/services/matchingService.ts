import Anthropic from '@anthropic-ai/sdk';
import { db } from '@db';
import { users } from '@db/schema';
import { eq, ne } from 'drizzle-orm';

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
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
  
  // Prepare current user profile for AI analysis
  const userProfile = {
    interests: currentUser.interests || [],
    location: currentUser.location,
    nextLocation: currentUser.nextLocation,
    profession: currentUser.profession,
    currentMoods: currentUser.currentMoods || [],
    bio: currentUser.bio,
  };

  const matches: MatchScore[] = [];

  for (const potentialMatch of potentialMatches) {
    const matchProfile = {
      interests: potentialMatch.interests || [],
      location: potentialMatch.location,
      nextLocation: potentialMatch.nextLocation,
      profession: potentialMatch.profession,
      currentMoods: potentialMatch.currentMoods || [],
      bio: potentialMatch.bio,
    };

    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `Analyze these two digital nomad profiles and provide a compatibility score (0-100) and reason:

User 1: ${JSON.stringify(userProfile)}
User 2: ${JSON.stringify(matchProfile)}

Consider factors like:
- Shared interests
- Location alignment (current and next destinations)
- Professional background
- Travel style and preferences

Return the response as valid JSON with format:
{
  "score": number,
  "reason": "brief explanation"
}`
        }]
      });

      const result = JSON.parse(response.content[0].text);
      
      matches.push({
        userId: potentialMatch.id,
        score: result.score,
        compatibility_reason: result.reason
      });
    } catch (error) {
      console.error(`Error matching with user ${potentialMatch.id}:`, error);
    }
  }

  // Sort by score and return top matches
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
