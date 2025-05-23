require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management');
    console.log('Connected to MongoDB');

    // Drop the username index if it exists
    try {
      await mongoose.connection.db.collection('users').dropIndex('username_1');
      console.log('Dropped username index');
    } catch (error) {
      // Ignore error if index doesn't exist
      console.log('No username index found');
    }

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    const organizer = await User.create({
      name: 'Event Organizer',
      email: 'organizer@example.com',
      password: 'organizer123',
      role: 'organizer'
    });

    const user = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'user123',
      role: 'user'
    });

    console.log('Created sample users');

    // Create sample events
    const events = [
      {
        title: 'Tech Conference 2024',
        description: 'Annual technology conference featuring the latest innovations',
        date: new Date('2025-06-15T09:00:00Z'),
        location: 'Convention Center',
        capacity: 500,
        price: 299.99,
        category: 'conference',
        organizer: organizer._id,
        slug: 'tech-conference-2024',
        image: {
          url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678',
          alt: 'Tech Conference Hall'
        },
        tags: ['technology', 'innovation', 'networking'],
        socialSharing: {
          enabled: true,
          platforms: ['facebook', 'twitter', 'linkedin'],
          customMessage: 'Join us at the biggest tech conference of 2024!'
        },
        status: 'upcoming'
      },
      {
        title: 'Digital Marketing Workshop',
        description: 'Learn the latest digital marketing strategies and tools',
        date: new Date('2025-07-20T13:00:00Z'),
        location: 'Business Center',
        capacity: 50,
        price: 149.99,
        category: 'workshop',
        organizer: organizer._id,
        slug: 'digital-marketing-workshop',
        image: {
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
          alt: 'Digital Marketing Workshop'
        },
        tags: ['marketing', 'digital', 'business'],
        socialSharing: {
          enabled: true,
          platforms: ['facebook', 'linkedin'],
          customMessage: 'Boost your digital marketing skills!'
        },
        status: 'upcoming'
      },
      {
        title: 'Startup Networking Event',
        description: 'Connect with fellow entrepreneurs and investors',
        date: new Date('2025-08-10T18:00:00Z'),
        location: 'Innovation Hub',
        capacity: 100,
        price: 0,
        category: 'networking',
        organizer: organizer._id,
        slug: 'startup-networking-event',
        image: {
          url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
          alt: 'Networking Event'
        },
        tags: ['startup', 'networking', 'business'],
        socialSharing: {
          enabled: true,
          platforms: ['facebook', 'twitter', 'linkedin'],
          customMessage: 'Join the startup community!'
        },
        status: 'upcoming'
      },
      {
        title: 'AI & Machine Learning Summit',
        description: 'Deep dive into artificial intelligence and machine learning with industry experts',
        date: new Date('2025-09-05T10:00:00Z'),
        location: 'Tech Campus',
        capacity: 300,
        price: 399.99,
        category: 'conference',
        organizer: organizer._id,
        slug: 'ai-machine-learning-summit',
        image: {
          url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
          alt: 'AI Conference'
        },
        tags: ['AI', 'machine learning', 'data science', 'technology'],
        socialSharing: {
          enabled: true,
          platforms: ['facebook', 'twitter', 'linkedin'],
          customMessage: 'Explore the future of AI and ML! #AISummit2024'
        },
        status: 'upcoming'
      },
      {
        title: 'Web Development Bootcamp',
        description: 'Intensive 2-day bootcamp covering modern web development technologies',
        date: new Date('2025-07-01T09:00:00Z'),
        location: 'Code Academy',
        capacity: 30,
        price: 199.99,
        category: 'workshop',
        organizer: organizer._id,
        slug: 'web-development-bootcamp',
        image: {
          url: 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4',
          alt: 'Web Development Workshop'
        },
        tags: ['web development', 'javascript', 'react', 'nodejs'],
        socialSharing: {
          enabled: true,
          platforms: ['facebook', 'twitter', 'linkedin'],
          customMessage: 'Level up your web development skills! 🚀'
        },
        status: 'upcoming'
      },
      {
        title: 'Cybersecurity Seminar',
        description: 'Learn about the latest cybersecurity threats and protection strategies',
        date: new Date('2025-08-20T14:00:00Z'),
        location: 'Security Institute',
        capacity: 150,
        price: 249.99,
        category: 'seminar',
        organizer: organizer._id,
        slug: 'cybersecurity-seminar',
        image: {
          url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
          alt: 'Cybersecurity Seminar'
        },
        tags: ['cybersecurity', 'security', 'technology', 'IT'],
        socialSharing: {
          enabled: true,
          platforms: ['facebook', 'twitter', 'linkedin'],
          customMessage: 'Stay secure in the digital age! #CyberSecurity'
        },
        status: 'upcoming'
      },
      {
        title: 'Product Management Workshop',
        description: 'Master the art of product management with hands-on exercises',
        date: new Date('2024-09-15T10:00:00Z'),
        location: 'Innovation Center',
        capacity: 40,
        price: 299.99,
        category: 'workshop',
        organizer: organizer._id,
        slug: 'product-management-workshop',
        image: {
          url: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca',
          alt: 'Product Management Workshop'
        },
        tags: ['product management', 'agile', 'business', 'strategy'],
        socialSharing: {
          enabled: true,
          platforms: ['facebook', 'linkedin'],
          customMessage: 'Become a better product manager! 📈'
        },
        status: 'upcoming'
      },
      {
        title: 'Women in Tech Meetup',
        description: 'Networking event celebrating women in technology',
        date: new Date('2024-07-25T18:00:00Z'),
        location: 'Tech Hub',
        capacity: 120,
        price: 0,
        category: 'networking',
        organizer: organizer._id,
        slug: 'women-in-tech-meetup',
        image: {
          url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998',
          alt: 'Women in Tech Event'
        },
        tags: ['women in tech', 'networking', 'technology', 'diversity'],
        socialSharing: {
          enabled: true,
          platforms: ['facebook', 'twitter', 'linkedin', 'whatsapp'],
          customMessage: 'Empowering women in technology! 👩‍💻 #WomenInTech'
        },
        status: 'upcoming'
      },
      {
        title: 'Cloud Computing Conference',
        description: 'Explore the latest trends in cloud computing and DevOps',
        date: new Date('2024-10-01T09:00:00Z'),
        location: 'Cloud Center',
        capacity: 250,
        price: 349.99,
        category: 'conference',
        organizer: organizer._id,
        slug: 'cloud-computing-conference',
        image: {
          url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
          alt: 'Cloud Computing Conference'
        },
        tags: ['cloud', 'devops', 'AWS', 'azure', 'technology'],
        socialSharing: {
          enabled: true,
          platforms: ['facebook', 'twitter', 'linkedin'],
          customMessage: 'Join us in the cloud! ☁️ #CloudComputing'
        },
        status: 'upcoming'
      }
    ];

    await Event.insertMany(events);
    console.log('Created sample events');

    console.log('\nSample Data:');
    console.log('\nAdmin User:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('\nOrganizer:');
    console.log('Email: organizer@example.com');
    console.log('Password: organizer123');
    console.log('\nRegular User:');
    console.log('Email: user@example.com');
    console.log('Password: user123');

    console.log('\nDatabase seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 