// Script to create an admin user
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

// Create readline interface for interactive input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdmin() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    let email, name, password;

    // Check if arguments were provided
    if (args.length >= 3) {
      // Use command line arguments
      email = args[0];
      name = args[1];
      password = args[2];
      console.log(`Using provided arguments for email: ${email}, name: ${name}`);
    } else {
      // Interactive mode
      console.log('=== Create Admin User ===');
      email = await prompt('Enter admin email: ');
      name = await prompt('Enter admin name: ');
      password = await prompt('Enter admin password (min 8 characters): ');
    }

    // Validate inputs
    if (!email || !email.includes('@')) {
      console.error('Error: Please provide a valid email address');
      return;
    }

    if (!name || name.trim().length === 0) {
      console.error('Error: Please provide a name');
      return;
    }

    if (!password || password.length < 8) {
      console.error('Error: Password must be at least 8 characters long');
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existingUser) {
      console.log(`User with email ${email} already exists.`);
      
      // Ask if we should update the role to ADMIN if it's not already
      if (existingUser.role !== 'ADMIN') {
        const updateRole = await prompt(`User exists but is not an admin. Update role to ADMIN? (y/n): `);
        
        if (updateRole.toLowerCase() === 'y') {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { role: 'ADMIN' },
          });
          console.log(`User ${email} has been updated to ADMIN role.`);
        } else {
          console.log('No changes were made.');
        }
      } else {
        console.log('User is already an admin.');
      }
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      
      console.log(`Admin user created successfully:`);
      console.log(`- ID: ${newUser.id}`);
      console.log(`- Email: ${newUser.email}`);
      console.log(`- Name: ${newUser.name}`);
      console.log(`- Role: ${newUser.role}`);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();
