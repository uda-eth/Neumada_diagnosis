import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique referral code for a user if they don't already have one
 */
export async function generateReferralCode(userId: number): Promise<string> {
  // First check if user already has a referral code
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { referralCode: true }
  });
  
  if (user?.referralCode) {
    return user.referralCode;
  }
  
  // Generate a unique code
  const referralCode = uuidv4().substring(0, 8);
  
  // Update the user record with the new code
  await db.update(users)
    .set({ referralCode })
    .where(eq(users.id, userId));
    
  return referralCode;
}

/**
 * Records a referral when a new user signs up via referral link
 */
export async function recordReferral(referralCode: string, newUserId: number): Promise<boolean> {
  try {
    // Find the referring user
    const referrer = await db.query.users.findFirst({
      where: eq(users.referralCode, referralCode),
      columns: { id: true }
    });
    
    if (!referrer) {
      return false;
    }
    
    // Update the new user with the referrer ID
    await db.update(users)
      .set({ referredBy: referrer.id })
      .where(eq(users.id, newUserId));
      
    return true;
  } catch (error) {
    console.error("Error recording referral:", error);
    return false;
  }
}

/**
 * Builds a share URL for a specific content type
 */
export function buildShareUrl(
  contentType: 'event' | 'profile' | 'invite',
  contentId: string | number,
  referralCode: string
): string {
  const baseUrl = 'https://malymvp.replit.app';
  
  switch (contentType) {
    case 'event':
      return `${baseUrl}/event/${contentId}?ref=${referralCode}`;
    case 'profile':
      return `${baseUrl}/profile/${contentId}?ref=${referralCode}`;
    case 'invite':
      return `${baseUrl}/join?ref=${referralCode}`;
    default:
      return `${baseUrl}/?ref=${referralCode}`;
  }
}

/**
 * Gets a share message for a specific content type
 */
export function getShareMessage(
  contentType: 'event' | 'profile' | 'invite',
  userName: string,
  contentName?: string
): string {
  switch (contentType) {
    case 'event':
      return `${userName} has invited you to check out "${contentName}" on Maly. Create an account to join!`;
    case 'profile':
      return `${userName} has invited you to connect on Maly. Create an account to view their profile!`;
    case 'invite':
      return `${userName} has invited you to join Maly - the digital nomad community platform! 🌎`;
    default:
      return `Join me on Maly - the digital nomad community platform! 🌎`;
  }
}