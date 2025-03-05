import { readFileSync } from 'fs';
import { join } from 'path';

// Default event images by category
const defaultEventImages: Record<string, string> = {
  "Retail": "/attached_assets/Screenshot 2025-03-04 at 10.37.43 PM.png",
  "Fashion": "/attached_assets/Screenshot 2025-03-04 at 10.37.43 PM.png",
  "Social": "/attached_assets/images-2.jpg",
  "Cultural": "/attached_assets/art-gallery-event-stockcake.jpg",
  "Sports": "/attached_assets/7358939e-2913-4b8f-a310-769736b37cba.jpg",
  "Dining": "/attached_assets/Screenshot 2025-03-04 at 10.35.46 PM.png",
  "Festivals": "/attached_assets/baac6810-cef8-4632-a20d-08ae3d08f3fc.jpg",
  "Professional": "/attached_assets/Screenshot 2025-03-04 at 10.37.43 PM.png"
};

export function getEventImage(category: string): string {
  return defaultEventImages[category] || defaultEventImages["Social"];
}
