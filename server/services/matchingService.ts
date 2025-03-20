import { db } from '@db';
import { users } from '@db/schema';
import { eq, ne } from 'drizzle-orm';

// Importing Anthropic but with a conditional check later
let Anthropic: any;
try {
  Anthropic = require('@anthropic-ai/sdk');
} catch (e) {
  console.warn('Anthropic SDK not available, using fallback compatibility scoring');
}

export interface MatchScore {
  userId: number;
  score: number;
  compatibility_reason: string;
}

// Helper function to calculate similarity score without API
function calculateCompatibilityScore(user1: any, user2: any): { score: number, reason: string } {
  let score = 50; // Base score
  const reasons: string[] = [];

  // Compare interests
  const interests1: string[] = user1.interests || [];
  const interests2: string[] = user2.interests || [];
  const sharedInterests = interests1.filter(i => interests2.includes(i));
  
  if (sharedInterests.length > 0) {
    const interestScore = Math.min(30, sharedInterests.length * 10);
    score += interestScore;
    reasons.push(`${sharedInterests.length} shared interests including ${sharedInterests.slice(0, 2).join(', ')}`);
  } else {
    reasons.push('No shared interests found');
  }

  // Compare location
  if (user1.location && user2.location && user1.location === user2.location) {
    score += 15;
    reasons.push(`Both in ${user1.location}`);
  }

  // Compare profession
  if (user1.profession && user2.profession) {
    if (user1.profession === user2.profession) {
      score += 15;
      reasons.push(`Both work as ${user1.profession}`);
    } else {
      score += 5;
      reasons.push(`Different professional backgrounds`);
    }
  }

  // Cap the score at 100
  score = Math.min(100, score);
  
  return {
    score,
    reason: reasons.join('. ')
  };
}

export async function findMatches(currentUser: any, limit: number = 5): Promise<MatchScore[]> {
  // Get all other users
  const potentialMatches = await db.select().from(users).where(ne(users.id, currentUser.id));
  const matches: MatchScore[] = [];

  // Check if we have Anthropic API key
  const hasAnthropicApiKey = !!process.env.ANTHROPIC_API_KEY && !!Anthropic;
  let anthropicClient: any;
  
  if (hasAnthropicApiKey) {
    try {
      anthropicClient = new Anthropic.default({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    } catch (error) {
      console.warn('Failed to initialize Anthropic client, using fallback scoring', error);
    }
  }

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
      let matchResult;

      if (anthropicClient) {
        // If we have Anthropic API key, use it
        const response = await anthropicClient.messages.create({
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
          matchResult = JSON.parse(response.content[0].text);
        }
      } else {
        // Otherwise use our fallback function
        matchResult = calculateCompatibilityScore(userProfile, matchProfile);
      }

      matches.push({
        userId: potentialMatch.id,
        score: matchResult.score,
        compatibility_reason: matchResult.reason
      });
    } catch (error) {
      console.error(`Error matching with user ${potentialMatch.id}:`, error);
      
      // Even if there's an error, still add a fallback match
      const fallbackResult = calculateCompatibilityScore(userProfile, matchProfile);
      matches.push({
        userId: potentialMatch.id,
        score: fallbackResult.score,
        compatibility_reason: fallbackResult.reason
      });
    }
  }

  // Sort by score and return top matches
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}