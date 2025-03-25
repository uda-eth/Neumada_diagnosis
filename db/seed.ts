
import { db } from './index';
import { events, users } from './schema';

async function seed() {
  // Insert test users first
  const userIds = await db.insert(users).values([
    {
      username: "lucahudek",
      email: "luca@test.com",
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
      username: "maria_design",
      email: "maria@test.com",
      password: "hashed_password",
      fullName: "Maria Torres",
      profileType: "member",
      location: "Mexico City",
      interests: ["Design", "Art"],
      age: 28
    }
  ]).returning({ insertedId: users.id });

  // Insert test events
  await db.insert(events).values([
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
      creatorId: userIds[0].insertedId
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
      creatorId: userIds[1].insertedId
    }
  ]);
}

seed()
  .catch(console.error)
  .finally(() => {
    console.log("Seeding completed");
    process.exit();
  });
