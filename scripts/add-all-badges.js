// Script to add all badges to a specific user
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Badge types from the application
const BADGE_TYPES = [
  'CAZADOR_DE_CRATERES',
  'GUARDIAN_DEL_ASFALTO',
  'FOTOGRAFO_URBANO',
  'DETECTIVE_NOCTURNO',
  'HEROE_DEL_BARRIO',
  'REPORTERO_VELOZ',
  'CARTOGRAFO_URBANO',
  'MAESTRO_DEL_DETALLE'
];

async function addAllBadgesToUser(userId) {
  try {
    console.log(`Adding all badges to user with ID: ${userId}`);
    
    // Get existing badges for the user to avoid duplicates
    const existingBadges = await prisma.userBadge.findMany({
      where: {
        userId: userId
      },
      select: {
        badgeType: true
      }
    });
    
    const existingBadgeTypes = existingBadges.map(badge => badge.badgeType);
    console.log('Existing badges:', existingBadgeTypes);
    
    // Filter out badge types that the user already has
    const badgesToAdd = BADGE_TYPES.filter(
      badgeType => !existingBadgeTypes.includes(badgeType)
    );
    
    if (badgesToAdd.length === 0) {
      console.log('User already has all badges. No new badges to add.');
      return;
    }
    
    console.log(`Adding ${badgesToAdd.length} new badges:`, badgesToAdd);
    
    // Create badges for the user
    const results = await Promise.all(
      badgesToAdd.map(badgeType => 
        prisma.userBadge.create({
          data: {
            userId: userId,
            badgeType: badgeType,
            earnedAt: new Date()
          }
        })
      )
    );
    
    console.log(`Successfully added ${results.length} badges to user ${userId}`);
    results.forEach(badge => {
      console.log(`- Added badge: ${badge.badgeType}, ID: ${badge.id}`);
    });
    
  } catch (error) {
    console.error('Error adding badges:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get user ID from command line argument or use the provided one
const userId = process.argv[2] || 'cm96dh1c000006b0lbdg0jmfd';

// Execute the function
addAllBadgesToUser(userId);
