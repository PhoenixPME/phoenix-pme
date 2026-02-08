const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function activateUser() {
  try {
    const user = await prisma.user.update({
      where: { email: 'bullion@phoenixpme.com' },
      data: { status: 'active' }
    });
    console.log('✅ User activated:', user.email, 'Status:', user.status);
  } catch (error) {
    console.error('❌ Error activating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

activateUser();
