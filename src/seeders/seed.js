import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { sequelize, user, room_types, rooms, bookings, transactions } from '../models/index.js';

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();

    console.log('Syncing database schema...');
    await sequelize.sync({ force: true }); // Reset and recreate tables

    console.log('Generating seed data...');

    // 1. Seed Users
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const usersData = [
      {
        username: 'admin_user',
        email: 'admin@hotel.com',
        password: passwordHash,
        phone_number: faker.phone.number({ style: 'national' }),
        role: 'admin'
      },
      {
        username: 'manager_user',
        email: 'manager@hotel.com',
        password: passwordHash,
        phone_number: faker.phone.number({ style: 'national' }),
        role: 'manager'
      }
    ];

    for (let i = 0; i < 8; i++) {
      usersData.push({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: passwordHash,
        phone_number: faker.phone.number({ style: 'national' }),
        role: faker.helpers.arrayElement(['staff', 'customer'])
      });
    }

    const createdUsers = await user.bulkCreate(usersData);
    console.log(`✅ Created ${createdUsers.length} users.`);

    // 2. Seed Room Types
    const roomTypesData = [
      {
        name: 'Standard Single',
        description: 'Cozy single room suitable for solo travelers.',
        base_rate: 50.00,
        max_occupancy: 1,
        amenities: ['Free WiFi', 'Air Conditioning', 'TV']
      },
      {
        name: 'Deluxe Double',
        description: 'Spacious double room with king size bed and city view.',
        base_rate: 120.00,
        max_occupancy: 2,
        amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Balcony']
      },
      {
        name: 'Executive Suite',
        description: 'Luxury suite with living room and ocean view.',
        base_rate: 250.00,
        max_occupancy: 4,
        amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Jacuzzi', 'Breakfast Included']
      },
      {
        name: 'Presidential Suite',
        description: 'Top-tier luxury experience with private pool and butler service.',
        base_rate: 500.00,
        max_occupancy: 6,
        amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Jacuzzi', 'Private Pool', 'Butler']
      }
    ];

    const createdRoomTypes = await room_types.bulkCreate(roomTypesData);
    console.log(`✅ Created ${createdRoomTypes.length} room types.`);

    // 3. Seed Rooms
    const roomsData = [];
    for (const type of createdRoomTypes) {
      for (let j = 1; j <= 4; j++) {
        roomsData.push({
          room_type_id: type.id,
          status: faker.helpers.arrayElement(['available', 'occupied', 'maintenance'])
        });
      }
    }

    const createdRooms = await rooms.bulkCreate(roomsData);
    console.log(`✅ Created ${createdRooms.length} rooms.`);

    // 4. Seed Bookings
    const customerUsers = createdUsers.filter(u => u.role === 'customer' || u.role === 'staff');
    const bookingsData = [];

    for (let k = 0; k < 8; k++) {
      const randomUser = faker.helpers.arrayElement(customerUsers);
      const randomRoom = faker.helpers.arrayElement(createdRooms);
      const checkIn = faker.date.recent({ days: 15 });
      const checkOut = faker.date.future({ days: 10, refDate: checkIn });

      bookingsData.push({
        user_id: randomUser.id,
        room_id: randomRoom.id,
        check_in_date: checkIn,
        check_out_date: checkOut,
        total_price: faker.number.float({ min: 100, max: 1000, fractionDigits: 2 }),
        status: faker.helpers.arrayElement(['pending', 'confirmed', 'cancelled'])
      });
    }

    const createdBookings = await bookings.bulkCreate(bookingsData);
    console.log(`✅ Created ${createdBookings.length} bookings.`);

    // 5. Seed Transactions
    const transactionsData = [];
    for (const bookingItem of createdBookings) {
      transactionsData.push({
        booking_id: bookingItem.id,
        amount: bookingItem.total_price,
        payment_method: faker.helpers.arrayElement(['cash', 'credit card', 'aba']),
        payment_status: faker.helpers.arrayElement(['pending', 'completed', 'failed'])
      });
    }

    const createdTransactions = await transactions.bulkCreate(transactionsData);
    console.log(`✅ Created ${createdTransactions.length} transactions.`);

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
