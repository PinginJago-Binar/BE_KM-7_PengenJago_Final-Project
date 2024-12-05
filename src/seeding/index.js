import runAllSeeds from "../seeding/seeds/seeds.js";

const seedDatabase = async () => {
  try {
    await runAllSeeds();
    console.log("Database seeding completed!");
  } catch (error) {
    console.error("Error during seeding:", error);
  }
};

seedDatabase();
