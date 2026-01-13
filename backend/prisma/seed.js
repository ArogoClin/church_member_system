import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@church.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@church.com',
      passwordHash: hashedPassword
    }
  });

  console.log('Admin created:', admin.email);

  // Create sample Jumuias
  const jumuia1 = await prisma.jumuia.upsert({
    where: { name: 'St. Peter Jumuia' },
    update: {},
    create: {
      name: 'St. Peter Jumuia'
    }
  });

  const jumuia2 = await prisma.jumuia.upsert({
    where: { name: 'St. Paul Jumuia' },
    update: {},
    create: {
      name: 'St. Paul Jumuia'
    }
  });

  console.log('Jumuias created');

  // Create sample Groups
  const group1 = await prisma.group.upsert({
    where: { name: 'Choir' },
    update: {},
    create: {
      name: 'Choir'
    }
  });

  const group2 = await prisma.group.upsert({
    where: { name: 'Youth Ministry' },
    update: {},
    create: {
      name: 'Youth Ministry'
    }
  });

  console.log('Groups created');

  // Create sample members
  await prisma.member.deleteMany({}); // Clear existing members first

  const member1 = await prisma.member.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      gender: 'MALE',
      dateOfBirth: new Date('1985-06-15'),
      phone: '+254712345678',
      maritalStatus: 'MARRIED',
      numberOfChildren: 2,
      jumuiaId: jumuia1.id,
      groupId: group1.id,
      status: 'ACTIVE'
    }
  });

  const member2 = await prisma.member.create({
    data: {
      firstName: 'Mary',
      lastName: 'Smith',
      gender: 'FEMALE',
      dateOfBirth: new Date('1990-03-20'),
      phone: '+254723456789',
      maritalStatus: 'SINGLE',
      numberOfChildren: 0,
      jumuiaId: jumuia2.id,
      groupId: group2.id,
      status: 'ACTIVE'
    }
  });

  console.log('Sample members created');

  console.log('\nSeed completed successfully!');
  console.log('\nAdmin Credentials:');
  console.log('   Email: admin@church.com');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });