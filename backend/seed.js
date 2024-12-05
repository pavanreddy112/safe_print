    // Create an Owner
    const mongoose = require('mongoose');
    const Owner = require('./models/Owner');
    const Shop = require('./models/Shop');
    
    // MongoDB connection string
    const MONGO_URI = "mongodb+srv://preetharajraju:xUEso4bXLjOqiPy9@cluster0.ttbvs.mongodb.net/safe_print?retryWrites=true&w=majority";
    
    const seedDatabase = async () => {
      try {
        // Connect to the database
        await mongoose.connect(MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB.');
    
        // Create an Owner with all required fields
        const owner = await Owner.create({
          name: 'John Doe',
          email: 'john@example.com',
          username: 'johndoe123',
          password: 'securepassword',
          shopName: "John's Print Shop",
          shopAddress: '123 Print Lane, Print City, PR 12345',
        });
        console.log('Owner created:', owner);
    
        // Create a Shop associated with the Owner
        const shop = await Shop.create({ name: "John's Print Shop", owner: owner._id });
        console.log('Shop created:', shop);
    
        // Close the connection after seeding
        await mongoose.disconnect();
        console.log('Database seeding completed.');
      } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1); // Exit with failure
      }
    };
    
    // Run the seed function
    seedDatabase();
    