
import { db } from './index';
import { events, users } from './schema';

async function seed() {
  try {
    // Clean existing data first
    await db.delete(events);
    await db.delete(users);
    console.log('Existing data cleared');

    // Insert test users with ON CONFLICT handling
    const userInsertResult = await db.insert(users).values([
      {
        username: "lucahudek_test",
        email: "luca_test@test.com",
        password: "hashed_password",
        fullName: "Luca Hudek",
        profileType: "member",
        location: "Mexico City",
        interests: ["Digital Marketing", "Software Development", "Remote Work"],
        currentMoods: ["Creating", "Networking"],
        age: 32,
        profession: "Digital Nomad Platform Creator"
      },
      {
        username: "maria_design_test",
        email: "maria_test@test.com",
        password: "hashed_password",
        fullName: "Maria Torres",
        profileType: "member",
        location: "Mexico City",
        interests: ["Design", "Art"],
        age: 28
      }
    ])
    .onConflictDoNothing({ target: users.username })
    .returning({ insertedId: users.id });

    console.log('Users seeded:', userInsertResult.length);

    // Insert test events
    const eventResult = await db.insert(events).values([
      {
        title: "Octo Designer Sunglasses Pop-Up Launch Party",
        description: "Join us for an exclusive launch party celebrating Octo's latest collection of designer sunglasses.",
        city: "Mexico City",
        location: "Roma Norte Design District",
        date: new Date("2025-02-20T19:00:00"),
        category: "Retail",
        price: "75",
        ticketType: "paid",
        capacity: 100,
        creatorId: userInsertResult[0]?.insertedId
      },
      {
        title: "Pargot Restaurant Couples Food & Wine Pairing",
        description: "Experience an intimate evening of culinary excellence at Pargot Restaurant.",
        city: "Mexico City",
        location: "Pargot Restaurant, Condesa",
        date: new Date("2025-02-15T19:30:00"),
        category: "Dining",
        price: "195",
        ticketType: "paid",
        capacity: 24,
        creatorId: userInsertResult[1]?.insertedId
      }
    ]);

    console.log('Events seeded successfully');
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
}

seed()
  .catch(console.error)
  .finally(() => {
    console.log("Seeding completed");
    process.exit();
  });
