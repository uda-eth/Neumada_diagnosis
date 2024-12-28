// Mapping of event categories to relevant image URLs
export const categoryImages = {
  "Networking": "https://images.unsplash.com/photo-1511795409834-432f7b1dd2d9?w=800&h=400&fit=crop",
  "Coworking": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=400&fit=crop",
  "Social": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=400&fit=crop",
  "Sports": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop",
  "Cultural": "https://images.unsplash.com/photo-1514533212735-5df27d970db9?w=800&h=400&fit=crop",
  "Tech": "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=800&h=400&fit=crop",
  "Travel": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop",
};

// Fallback image if category doesn't match
export const defaultEventImage = "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=400&fit=crop";

// Get image URL based on category
export function getEventImage(category: string): string {
  return categoryImages[category as keyof typeof categoryImages] || defaultEventImage;
}
