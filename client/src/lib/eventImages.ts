// Mapping of event categories to relevant image URLs - optimized for faster loading
export const categoryImages = {
  "Networking": "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800&h=400&fit=crop&q=80",
  "Coworking": "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&h=400&fit=crop&q=80",
  "Social": "https://images.unsplash.com/photo-1511795409834-432f7b1dd2d9?w=800&h=400&fit=crop&q=80",
  "Sports": "https://images.unsplash.com/photo-1444491741275-3747c53c99b4?w=800&h=400&fit=crop&q=80",
  "Cultural": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop&q=80",
  "Tech": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=400&fit=crop&q=80",
  "Travel": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=400&fit=crop&q=80",
};

// High-quality fallback image
export const defaultEventImage = "https://images.unsplash.com/photo-1511795409834-432f7b1dd2d9?w=800&h=400&fit=crop&q=80";

// Get image URL based on category with error handling
export function getEventImage(category: string): string {
  if (!category) return defaultEventImage;

  const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  return categoryImages[normalizedCategory as keyof typeof categoryImages] || defaultEventImage;
}