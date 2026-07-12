const app = require('./app');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
