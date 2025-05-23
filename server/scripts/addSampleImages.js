const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
const eventImagesDir = path.join(uploadDir, 'events');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

if (!fs.existsSync(eventImagesDir)) {
  fs.mkdirSync(eventImagesDir);
}

// List of high-quality event images from Unsplash
const imageUrls = [
  {
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    filename: 'conference-1.jpg',
    category: 'conference'
  },
  {
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80',
    filename: 'conference-2.jpg',
    category: 'conference'
  },
  {
    url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2012&q=80',
    filename: 'workshop-1.jpg',
    category: 'workshop'
  },
  {
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80',
    filename: 'workshop-2.jpg',
    category: 'workshop'
  },
  {
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    filename: 'seminar-1.jpg',
    category: 'seminar'
  },
  {
    url: 'https://images.unsplash.com/photo-1560523159-4a9692d222f9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2036&q=80',
    filename: 'seminar-2.jpg',
    category: 'seminar'
  },
  {
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80',
    filename: 'networking-1.jpg',
    category: 'networking'
  },
  {
    url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1974&q=80',
    filename: 'networking-2.jpg',
    category: 'networking'
  },
  {
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    filename: 'other-1.jpg',
    category: 'other'
  },
  {
    url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
    filename: 'other-2.jpg',
    category: 'other'
  }
];

// Download images
async function downloadImages() {
  console.log('Downloading sample images...');
  
  for (const image of imageUrls) {
    try {
      const outputPath = path.join(eventImagesDir, image.filename);
      
      // Skip if file already exists
      if (fs.existsSync(outputPath)) {
        console.log(`Image ${image.filename} already exists, skipping...`);
        continue;
      }
      
      console.log(`Downloading ${image.filename}...`);
      const response = await axios({
        method: 'GET',
        url: image.url,
        responseType: 'stream'
      });
      
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      
      console.log(`Downloaded ${image.filename} successfully`);
    } catch (error) {
      console.error(`Error downloading ${image.filename}:`, error.message);
    }
  }
  
  console.log('All downloads completed!');
}

// Run the download function
downloadImages().catch(console.error); 