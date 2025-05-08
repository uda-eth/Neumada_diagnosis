import { db } from './index';
import { events, users } from './schema';

async function seedMexicoCityEvents() {
  try {
    console.log('Starting to seed 15 Mexico City events...');
    
    // Get a creator ID to associate with events
    const creatorResult = await db.select({ id: users.id }).from(users).limit(1);
    let creatorId = creatorResult[0]?.id || null;
    
    if (!creatorId) {
      console.log('No users found in database. Creating a default user...');
      
      // Create a default user if none exists
      const userResult = await db.insert(users).values({
        username: "event_creator",
        email: "creator@maly.app",
        password: "hashed_password",
        fullName: "Event Creator",
        profileType: "member",
        location: "Mexico City",
        interests: ["Events", "Community"],
        age: 30,
        profession: "Event Manager"
      })
      .returning({ id: users.id });
      
      if (userResult.length === 0) {
        throw new Error('Failed to create default user');
      }
      
      console.log('Default user created with ID:', userResult[0].id);
      
      // Use the new user ID
      creatorId = userResult[0].id;
    }
    
    // Current date (May 8, 2025)
    const baseDate = new Date('2025-05-08');
    
    // Array of event categories
    const categories = [
      'Tech', 'Dining', 'Arts', 'Wellness', 'Networking', 
      'Sports', 'Music', 'Education', 'Business', 'Entertainment'
    ];
    
    // Array of ticket types
    const ticketTypes = ['free', 'paid', 'donation'];
    
    // Array of neighborhoods in Mexico City
    const neighborhoods = [
      'Roma Norte', 'Condesa', 'Polanco', 'Coyoacán', 'Juárez',
      'Santa Fe', 'San Ángel', 'Zona Rosa', 'Chapultepec', 'Centro Histórico'
    ];
    
    // Generate 15 events with dates across the next month
    const eventValues = [];
    
    for (let i = 0; i < 15; i++) {
      // Create a date that's between 1 and 30 days in the future
      const daysToAdd = Math.floor(Math.random() * 30) + 1;
      const eventDate = new Date(baseDate);
      eventDate.setDate(baseDate.getDate() + daysToAdd);
      
      // Set a random time between 8am and 10pm
      const hours = Math.floor(Math.random() * 14) + 8; // 8am to 10pm
      const minutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)]; // 00, 15, 30, or 45 minutes
      eventDate.setHours(hours, minutes, 0, 0);
      
      // Random category
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      // Random ticket type
      const ticketType = ticketTypes[Math.floor(Math.random() * ticketTypes.length)];
      
      // Random neighborhood
      const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
      
      // Random price if paid, otherwise 0
      const price = ticketType === 'paid' ? 
        (Math.floor(Math.random() * 200) + 10).toString() : // $10 to $210
        '0';
      
      // Random capacity between 20 and 200
      const capacity = Math.floor(Math.random() * 181) + 20; // 20 to 200
      
      // Create event object
      const event = {
        title: getEventTitle(category, i),
        description: getEventDescription(category),
        city: "Mexico City",
        location: `${neighborhood}, Mexico City`,
        date: eventDate,
        category: category,
        price: price,
        ticket_type: ticketType,
        ticketType: ticketType, // Keep both for compatibility
        capacity: capacity,
        creator_id: creatorId,
        creatorId: creatorId, // Keep both for compatibility
        available_tickets: capacity,
        availableTickets: capacity, // Keep both for compatibility
        time_frame: getTimeFrame(eventDate, baseDate),
        timeFrame: getTimeFrame(eventDate, baseDate), // Keep both for compatibility
        created_at: new Date(),
        createdAt: new Date() // Keep both for compatibility
      };
      
      eventValues.push(event);
    }
    
    // Insert all events
    await db.insert(events).values(eventValues);
    
    console.log('Successfully seeded 15 events in Mexico City!');
  } catch (error) {
    console.error('Error seeding Mexico City events:', error);
    throw error;
  }
}

// Helper function to generate event titles
function getEventTitle(category: string, index: number): string {
  const titles = {
    'Tech': [
      'Mexico City Tech Meetup', 
      'Blockchain & Cryptocurrency Workshop',
      'AI Showcase: Future of Technology',
      'Startup Founders Networking Mixer',
      'Web3 Conference: Mexico Edition'
    ],
    'Dining': [
      'Mexican Cuisine Tasting Tour',
      'Mezcal & Tequila Pairing Experience',
      'Farm-to-Table Dinner Event',
      'Celebrity Chef Pop-up Restaurant',
      'Street Food Night Market'
    ],
    'Arts': [
      'Contemporary Art Exhibition Opening',
      'Frida Kahlo Inspired Art Workshop',
      'Photography Walk: Hidden Corners of CDMX',
      'Mexican Cinema Retrospective',
      'Live Portrait Drawing Session'
    ],
    'Wellness': [
      'Sunrise Yoga in Chapultepec Park',
      'Mindfulness & Meditation Retreat',
      'Wellness Weekend: Body & Mind',
      'Sound Bath Healing Session',
      'Fitness Boot Camp in the City'
    ],
    'Networking': [
      'Digital Nomad Networking Breakfast',
      'Young Professionals Mixer',
      'Women in Business Luncheon',
      'Expat Community Gathering',
      'Creative Industry Networking Night'
    ],
    'Sports': [
      'Mexico City Marathon Training Group',
      'Football Watch Party: National Team',
      'Group Hiking Trip to Nearby Mountains',
      'Bike Tour of Historic Mexico City',
      'Tennis Tournament & Social'
    ],
    'Music': [
      'Live Jazz Night in La Condesa',
      'Electronic Music Showcase',
      'Traditional Mariachi Performance',
      'Classical Music in Bellas Artes',
      'Indie Band Discovery Night'
    ],
    'Education': [
      'Spanish Language Exchange Meetup',
      'History of Mexico Walking Tour',
      'Creative Writing Workshop',
      'Public Speaking Masterclass',
      'Financial Literacy Seminar'
    ],
    'Business': [
      'Entrepreneurship Summit 2025',
      'Investment Opportunities in Mexico',
      'Marketing Strategies Workshop',
      'Small Business Owners Round Table',
      'E-commerce Success Stories Panel'
    ],
    'Entertainment': [
      'Comedy Night: Spanish & English',
      'Interactive Theater Experience',
      'Salsa Dancing Class & Social',
      'Film Screening with Director Q&A',
      'Game Night: Strategy & Fun'
    ]
  };
  
  // Get array of titles for the category, default to Tech if category doesn't exist
  const categoryTitles = titles[category] || titles['Tech'];
  
  // Use index modulo length to cycle through titles
  return categoryTitles[index % categoryTitles.length];
}

// Helper function to generate event descriptions
function getEventDescription(category: string): string {
  const descriptions = {
    'Tech': 'Join fellow technology enthusiasts for an exciting event featuring the latest innovations and networking opportunities with industry leaders. Perfect for professionals, hobbyists, and anyone curious about the future of tech.',
    'Dining': 'Indulge in a culinary adventure showcasing the rich and diverse flavors of Mexican cuisine. This event brings together food lovers for an unforgettable gastronomic experience in the heart of Mexico City.',
    'Arts': 'Immerse yourself in Mexico City\'s vibrant arts scene with this captivating event. Experience the creative expressions of talented artists and gain insights into the cultural tapestry that makes this city a global arts destination.',
    'Wellness': 'Prioritize your well-being at this rejuvenating wellness event. Designed to nurture mind, body, and spirit, participants will leave feeling refreshed and equipped with practices to enhance daily life.',
    'Networking': 'Expand your professional network at this dynamic gathering of motivated individuals from diverse industries. Create meaningful connections that could lead to collaborations, opportunities, and friendships.',
    'Sports': 'Get active and join fellow sports enthusiasts for this energetic event. Whether you\'re a seasoned athlete or just looking for fun, this is your chance to engage in healthy competition and camaraderie.',
    'Music': 'Experience the soul-stirring power of music at this exceptional event. From rhythm to melody, this gathering celebrates musical expression in one of Mexico City\'s most atmospheric venues.',
    'Education': 'Broaden your horizons and gain valuable knowledge at this enlightening educational event. Expert speakers will share insights on fascinating topics, stimulating intellectual curiosity and personal growth.',
    'Business': 'Connect with entrepreneurs, investors, and industry leaders at this premier business event. Gain strategic insights, explore partnership opportunities, and stay ahead of market trends in Mexico\'s dynamic business landscape.',
    'Entertainment': 'Prepare for an unforgettable evening of entertainment that will delight your senses. This event promises laughter, excitement, and the chance to create lasting memories in Mexico City\'s vibrant entertainment scene.'
  };
  
  return descriptions[category] || 'Join us for this exciting event in Mexico City. Connect with like-minded individuals and enjoy a memorable experience in one of the world\'s most vibrant metropolitan areas.';
}

// Helper function to determine time frame
function getTimeFrame(eventDate: Date, baseDate: Date): string {
  const diffTime = eventDate.getTime() - baseDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) return 'Today';
  if (diffDays <= 7) return 'This Week';
  
  // Check if it's this weekend (next Saturday and Sunday)
  const nextSaturdayDate = new Date(baseDate);
  const currentDay = baseDate.getDay(); // 0 = Sunday, 6 = Saturday
  const daysUntilSaturday = (6 - currentDay + 7) % 7;
  nextSaturdayDate.setDate(baseDate.getDate() + daysUntilSaturday);
  
  const nextSundayDate = new Date(nextSaturdayDate);
  nextSundayDate.setDate(nextSaturdayDate.getDate() + 1);
  
  if (
    (eventDate.getDate() === nextSaturdayDate.getDate() && eventDate.getMonth() === nextSaturdayDate.getMonth()) ||
    (eventDate.getDate() === nextSundayDate.getDate() && eventDate.getMonth() === nextSundayDate.getMonth())
  ) {
    return 'This Weekend';
  }
  
  // Check month
  if (eventDate.getMonth() === baseDate.getMonth()) return 'This Month';
  
  // If it's the next month
  return 'Next Month';
}

// Run the seed function
seedMexicoCityEvents()
  .then(() => {
    console.log('Mexico City events seeding completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });