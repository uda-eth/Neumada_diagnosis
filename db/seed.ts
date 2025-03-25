
import { db } from './index';
import { events, users } from './schema';

async function seed() {
  // Insert test users
  await db.insert(users).values([
    {
      username: "emma_digital",
      email: "emma@test.com",
      password: "hashed_password",
      fullName: "Emma Rodriguez",
      profileType: "member",
      location: "Mexico City",
      interests: ["Tech", "Art", "Music"],
      currentMoods: ["Networking", "Learning"],
      age: 28,
    },
    // Add more test users as needed
  ]);

  // Insert test events
  await db.insert(events).values([
    {
      title: "Tech Meetup 2024",
      description: "Join us for an evening of tech talks and networking",
      city: "Mexico City",
      location: "Digital Hub, Roma Norte",
      date: new Date("2024-04-15T18:00:00"),
      category: "Professional",
      price: "free",
      ticketType: "free",
      capacity: 50,
    },
    // Add more test events as needed
  ]);
}

seed()
  .catch(console.error)
  .finally(() => process.exit());
