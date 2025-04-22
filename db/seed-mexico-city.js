// Seed script to create 20 realistic user profiles from Mexico City
import { db } from './index.js';
import { users } from './schema.js';
import bcrypt from 'bcrypt';

async function seedMexicoCityUsers() {
  try {
    console.log('Starting to seed 20 Mexico City user profiles...');
    
    // Password hashing
    const saltRounds = 10;
    const defaultPassword = await bcrypt.hash('password123', saltRounds);
    
    // Collection of realistic Mexican profile images
    const profileImages = [
      'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=2080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520423465871-0866049020b7?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1740&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=1935&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?q=80&w=1980&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1727&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?q=80&w=1989&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485206412256-701ccc5b93ca?q=80&w=1824&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?q=80&w=1974&auto=format&fit=crop'
    ];
    
    // Moods with realistic distribution
    const moodOptions = [
      ["Networking", "Dining Out"],
      ["Adventure", "Exploring"],
      ["Dating", "Socializing"],
      ["Dining Out", "Socializing", "Networking"],
      ["Working", "Learning"],
      ["Relaxing", "Socializing"],
      ["Creating", "Learning"],
      ["Adventure", "Dating"],
      ["Exploring", "Adventure"],
      ["Networking", "Working"],
      ["Socializing", "Dating", "Parties"],
      ["Learning", "Teaching"],
      ["Working", "Creating"],
      ["Parties", "Socializing"],
      ["Dating", "Relaxing"],
      ["Exploring", "Learning"],
      ["Working", "Networking", "Creating"],
      ["Socializing", "Dining Out"],
      ["Focusing", "Creating"],
      ["Networking", "Socializing", "Exploring"]
    ];
    
    // Common Mexican interests with variety
    const interestOptions = [
      ["Mexican cuisine", "Salsa dancing", "History", "Art galleries"],
      ["Photography", "Coffee culture", "Street food", "Hiking"],
      ["Mezcal tasting", "Local markets", "Film festivals", "Yoga"],
      ["Street art", "Live music", "Tacos", "Museums"],
      ["Mariachi", "Soccer", "Cooking", "Ancient ruins"],
      ["Cycling", "Startups", "Cultural events", "Mezcal"],
      ["Spanish literature", "Jazz", "Vegetarian cuisine", "Architecture"],
      ["Digital nomad lifestyle", "Craft beer", "Mexican folk art", "Rock climbing"],
      ["Latin music", "Design", "Tequila tasting", "Volleyball"],
      ["Boxing", "Graphic design", "Authentic cuisine", "Technology"],
      ["Sustainable living", "Pottery", "Taco tours", "Meditation"],
      ["Ballet Folklórico", "Tennis", "Vegan food", "Photography"],
      ["Entrepreneurship", "Salsa music", "Cooking classes", "Traditional crafts"],
      ["Fitness", "Baseball", "Mexican wines", "Coding"],
      ["Language exchange", "Electronic music", "Cocktail making", "Hiking"],
      ["Board games", "Basketball", "Fashion", "Podcasting"],
      ["Traditional dance", "Running", "Poetry", "Urban exploration"],
      ["Film production", "Lucha libre", "Chocolate tasting", "Jazz"],
      ["Interior design", "Swimming", "Street photography", "Local traditions"],
      ["Volunteering", "Ceramics", "Fusion cuisine", "Digital art"]
    ];
    
    // Collection of professions common in Mexico City
    const professions = [
      "Software Developer", "Marketing Specialist", "Chef", "Architect",
      "Digital Designer", "Journalist", "University Professor", "Entrepreneur",
      "Tour Guide", "Yoga Instructor", "Photographer", "Doctor",
      "Film Producer", "Consultant", "Graphic Designer", "Musician",
      "Language Teacher", "Financial Analyst", "Artist", "Travel Blogger"
    ];
    
    // Mexican user profiles data
    const mexicoCityUsers = [
      {
        username: "alejandra_mx",
        email: "alejandra@example.com",
        fullName: "Alejandra Rodríguez",
        gender: "Female",
        sexualOrientation: "Straight",
        bio: "Art director with a passion for contemporary Mexican design. I love exploring the city's vibrant art scene and trying out new restaurants in Roma Norte.",
        location: "Mexico City",
        birthLocation: "Guadalajara",
        nextLocation: "Oaxaca",
        interests: interestOptions[0],
        currentMoods: moodOptions[0],
        profession: professions[0],
        age: 29
      },
      {
        username: "carlos_df",
        email: "carlos@example.com",
        fullName: "Carlos Mendoza",
        gender: "Male",
        sexualOrientation: "Straight",
        bio: "Coffee enthusiast and street photographer. You'll find me wandering through Coyoacán on weekends capturing the colors and culture of this amazing city.",
        location: "Mexico City",
        birthLocation: "Mexico City",
        nextLocation: "Puerto Vallarta",
        interests: interestOptions[1],
        currentMoods: moodOptions[1],
        profession: professions[1],
        age: 32
      },
      {
        username: "sofia_cdmx",
        email: "sofia@example.com",
        fullName: "Sofía Vázquez",
        gender: "Female",
        sexualOrientation: "Bisexual",
        bio: "Culinary arts graduate specializing in modern Mexican cuisine. Looking to connect with other foodies and local chefs. Mezcal aficionada.",
        location: "Mexico City",
        birthLocation: "Puebla",
        nextLocation: "San Miguel de Allende",
        interests: interestOptions[2],
        currentMoods: moodOptions[2],
        profession: professions[2],
        age: 27
      },
      {
        username: "miguel_arq",
        email: "miguel@example.com",
        fullName: "Miguel Ángel Torres",
        gender: "Male",
        sexualOrientation: "Gay",
        bio: "Architect fascinated by the mix of colonial and modern structures in CDMX. Love discussing urban planning over good coffee or mezcal.",
        location: "Mexico City",
        birthLocation: "Monterrey",
        nextLocation: "Barcelona",
        interests: interestOptions[3],
        currentMoods: moodOptions[3],
        profession: professions[3],
        age: 34
      },
      {
        username: "daniela_design",
        email: "daniela@example.com",
        fullName: "Daniela Herrera",
        gender: "Female",
        sexualOrientation: "Straight",
        bio: "Digital designer who loves the creative energy of Condesa. Always looking for collaboration opportunities and new artistic experiences.",
        location: "Mexico City",
        birthLocation: "Veracruz",
        nextLocation: "Mexico City",
        interests: interestOptions[4],
        currentMoods: moodOptions[4],
        profession: professions[4],
        age: 26
      },
      {
        username: "javier_reporter",
        email: "javier@example.com",
        fullName: "Javier Ortiz",
        gender: "Male",
        sexualOrientation: "Straight",
        bio: "Journalist covering Mexico City's cultural scene. Always on the lookout for interesting stories and authentic local experiences.",
        location: "Mexico City",
        birthLocation: "Mexico City",
        nextLocation: "Buenos Aires",
        interests: interestOptions[5],
        currentMoods: moodOptions[5],
        profession: professions[5],
        age: 38
      },
      {
        username: "ana_academia",
        email: "ana@example.com",
        fullName: "Ana María Gutiérrez",
        gender: "Female",
        sexualOrientation: "Lesbian",
        bio: "Professor of anthropology specializing in pre-Hispanic cultures. Love sharing knowledge about Mexico's rich history while exploring the city's museums.",
        location: "Mexico City",
        birthLocation: "Mérida",
        nextLocation: "Mexico City",
        interests: interestOptions[6],
        currentMoods: moodOptions[6],
        profession: professions[6],
        age: 41
      },
      {
        username: "eduardo_startup",
        email: "eduardo@example.com",
        fullName: "Eduardo Sánchez",
        gender: "Male",
        sexualOrientation: "Straight",
        bio: "Tech entrepreneur working on sustainable solutions for urban challenges. Looking to connect with other innovators and explore Mexico City's startup ecosystem.",
        location: "Mexico City",
        birthLocation: "Querétaro",
        nextLocation: "New York",
        interests: interestOptions[7],
        currentMoods: moodOptions[7],
        profession: professions[7],
        age: 31
      },
      {
        username: "lucia_tours",
        email: "lucia@example.com",
        fullName: "Lucía Ramírez",
        gender: "Female",
        sexualOrientation: "Straight",
        bio: "Tour guide specializing in Mexico City's hidden gems. I know all the secret spots and authentic taquerías that tourists rarely discover.",
        location: "Mexico City",
        birthLocation: "Mexico City",
        nextLocation: "Mexico City",
        interests: interestOptions[8],
        currentMoods: moodOptions[8],
        profession: professions[8],
        age: 29
      },
      {
        username: "mariana_yoga",
        email: "mariana@example.com",
        fullName: "Mariana López",
        gender: "Female",
        sexualOrientation: "Bisexual",
        bio: "Yoga instructor and wellness advocate. Teaching mindfulness while enjoying the chaotic beauty of Mexico City. Open to meeting fellow mindfulness practitioners.",
        location: "Mexico City",
        birthLocation: "Cancún",
        nextLocation: "Tulum",
        interests: interestOptions[9],
        currentMoods: moodOptions[9],
        profession: professions[9],
        age: 28
      },
      {
        username: "roberto_foto",
        email: "roberto@example.com",
        fullName: "Roberto Jiménez",
        gender: "Male",
        sexualOrientation: "Straight",
        bio: "Photographer capturing the soul of Mexico City. Specializing in street photography and cultural events. Always carrying my camera to document urban life.",
        location: "Mexico City",
        birthLocation: "Oaxaca",
        nextLocation: "Mexico City",
        interests: interestOptions[10],
        currentMoods: moodOptions[10],
        profession: professions[10],
        age: 35
      },
      {
        username: "carmen_medica",
        email: "carmen@example.com",
        fullName: "Carmen Flores",
        gender: "Female",
        sexualOrientation: "Straight",
        bio: "Doctor who loves the contrast between my intense hospital work and Mexico City's vibrant cultural scene. Looking for friends to explore museums and concerts.",
        location: "Mexico City",
        birthLocation: "Guadalajara",
        nextLocation: "Mexico City",
        interests: interestOptions[11],
        currentMoods: moodOptions[11],
        profession: professions[11],
        age: 36
      },
      {
        username: "diego_cine",
        email: "diego@example.com",
        fullName: "Diego Morales",
        gender: "Male",
        sexualOrientation: "Gay",
        bio: "Film producer working between Mexico City's vibrant scenes and international projects. Always on the lookout for creative talent and inspiring locations.",
        location: "Mexico City",
        birthLocation: "Mexico City",
        nextLocation: "Los Angeles",
        interests: interestOptions[12],
        currentMoods: moodOptions[12],
        profession: professions[12],
        age: 33
      },
      {
        username: "gabriela_consultant",
        email: "gabriela@example.com",
        fullName: "Gabriela Vargas",
        gender: "Female",
        sexualOrientation: "Straight",
        bio: "Business consultant helping local entrepreneurs thrive. Love balancing work with exploring Mexico City's vibrant neighborhoods and cultural offerings.",
        location: "Mexico City",
        birthLocation: "Monterrey",
        nextLocation: "Mexico City",
        interests: interestOptions[13],
        currentMoods: moodOptions[13],
        profession: professions[13],
        age: 30
      },
      {
        username: "fernando_designer",
        email: "fernando@example.com",
        fullName: "Fernando Díaz",
        gender: "Male",
        sexualOrientation: "Straight",
        bio: "Graphic designer influenced by Mexico City's rich visual culture. Working with local brands to create authentic Mexican designs with a contemporary twist.",
        location: "Mexico City",
        birthLocation: "Puebla",
        nextLocation: "Mexico City",
        interests: interestOptions[14],
        currentMoods: moodOptions[14],
        profession: professions[14],
        age: 28
      },
      {
        username: "isabel_musica",
        email: "isabel@example.com",
        fullName: "Isabel Martínez",
        gender: "Female",
        sexualOrientation: "Straight",
        bio: "Musician blending traditional Mexican sounds with modern influences. Performing in venues across Mexico City and looking to collaborate with other artists.",
        location: "Mexico City",
        birthLocation: "Mexico City",
        nextLocation: "Berlin",
        interests: interestOptions[15],
        currentMoods: moodOptions[15],
        profession: professions[15],
        age: 25
      },
      {
        username: "pablo_profe",
        email: "pablo@example.com",
        fullName: "Pablo García",
        gender: "Male",
        sexualOrientation: "Straight",
        bio: "Language teacher helping expats navigate Mexican Spanish and culture. Passionate about intercultural exchange and Mexico City's literary scene.",
        location: "Mexico City",
        birthLocation: "Guadalajara",
        nextLocation: "Mexico City",
        interests: interestOptions[16],
        currentMoods: moodOptions[16],
        profession: professions[16],
        age: 37
      },
      {
        username: "valentina_finanzas",
        email: "valentina@example.com",
        fullName: "Valentina Ramos",
        gender: "Female",
        sexualOrientation: "Straight",
        bio: "Financial analyst by day, culture enthusiast by night. Love exploring Mexico City's free museums and concerts while discovering the best street food around.",
        location: "Mexico City",
        birthLocation: "Mexico City",
        nextLocation: "New York",
        interests: interestOptions[17],
        currentMoods: moodOptions[17],
        profession: professions[17],
        age: 29
      },
      {
        username: "ricardo_arte",
        email: "ricardo@example.com",
        fullName: "Ricardo Fuentes",
        gender: "Male",
        sexualOrientation: "Bisexual",
        bio: "Visual artist drawing inspiration from Mexico City's contrasts and complexity. My studio is in Roma Norte where I explore themes of identity and urban life.",
        location: "Mexico City",
        birthLocation: "San Luis Potosí",
        nextLocation: "Mexico City",
        interests: interestOptions[18],
        currentMoods: moodOptions[18],
        profession: professions[18],
        age: 31
      },
      {
        username: "laura_viajes",
        email: "laura@example.com",
        fullName: "Laura Domínguez",
        gender: "Female",
        sexualOrientation: "Straight",
        bio: "Travel blogger documenting Mexico City's endless discoveries. Always seeking authentic experiences and connecting travelers with the real essence of CDMX.",
        location: "Mexico City",
        birthLocation: "Tijuana",
        nextLocation: "Mexico City",
        interests: interestOptions[19],
        currentMoods: moodOptions[19],
        profession: professions[19],
        age: 27
      }
    ];
    
    // Create the user records
    for (let i = 0; i < mexicoCityUsers.length; i++) {
      const user = mexicoCityUsers[i];
      
      // Add the profile image from our collection
      const profileImage = profileImages[i];
      
      // Insert user into database
      await db.insert(users).values({
        username: user.username,
        email: user.email,
        password: defaultPassword,
        fullName: user.fullName,
        gender: user.gender,
        sexualOrientation: user.sexualOrientation,
        bio: user.bio,
        profileImage: profileImage,
        location: user.location,
        birthLocation: user.birthLocation,
        nextLocation: user.nextLocation,
        interests: user.interests,
        currentMoods: user.currentMoods,
        profession: user.profession,
        age: user.age,
        createdAt: new Date()
      });
      
      console.log(`Created user: ${user.username}`);
    }
    
    console.log('Mexico City seed complete! Created 20 user profiles.');
    
  } catch (error) {
    console.error('Error seeding Mexico City users:', error);
    throw error;
  }
}

// Run the seed function
seedMexicoCityUsers()
  .then(() => {
    console.log('Database seeding completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });