import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@taskflow.com';
const ADMIN_PASSWORD = 'Admin123456';

async function main() {
  console.log('🌱 Starting database seeding...');

  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists. Skipping seed.');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    return;
  }

  console.log('👤 Creating admin user...');

  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: adminPasswordHash,
      isVerified: true,
      avatar: null,
    },
  });

  console.log('✅ Admin created successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Admin Login Credentials:');
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('💡 Next Steps:');
  console.log('   1. Login to the application');
  console.log('   2. Create your first workspace');
  console.log('   3. Add team members');
  console.log('   4. Create projects and boards');
  console.log('   5. Start managing tasks');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
