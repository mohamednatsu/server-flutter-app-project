const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
       datasources: {
              db: {
                     url: process.env.DATABASE_URL + "&connection_limit=5",
              },
       },
});

// Handle clean shutdown
process.on('beforeExit', async () => {
       await prisma.$disconnect();
});

module.exports = prisma;