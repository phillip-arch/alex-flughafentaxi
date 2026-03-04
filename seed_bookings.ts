import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedBookings() {
  const bookings = [];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // 10 for today
  for (let i = 0; i < 10; i++) {
    const isFromAirport = i % 2 === 0;
    const isToAirport = !isFromAirport;
    const hasChildSeat = i % 3 === 0;
    const hasExtraStop = i % 4 === 0;

    const pickup = isFromAirport ? 'Flughafen Wien' : 'Test Address ' + i;
    const destination = isToAirport ? 'Flughafen Wien' : 'Test Address ' + i;
    const notes = [];
    if (isFromAirport) notes.push('Flight: OS' + (100 + i));
    if (hasChildSeat) notes.push('Child seat required');
    if (hasExtraStop) notes.push('Extra stop at Main St ' + i);

    const pickupAt = new Date(today);
    pickupAt.setHours(8 + i, 0, 0, 0);

    bookings.push({
      full_name: 'Test User Today ' + i,
      email: `test_today_${i}@example.com`,
      phone: '+43660123456' + i,
      pickup,
      destination,
      pickup_at: pickupAt.toISOString(),
      passengers: 1 + (i % 4),
      luggage: 1 + (i % 2),
      vehicle_type: i % 3 === 0 ? 'Bus' : (i % 2 === 0 ? 'Kombi' : 'Limo'),
      price: 40 + (i * 2),
      status: 'confirmed',
      booking_reference: 'TODAY' + i + Math.floor(Math.random() * 1000),
      notes: notes.join(', '),
      ip_address: '127.0.0.1',
      confirm_token: uuidv4(),
      confirmed_at: new Date().toISOString()
    });
  }

  // 10 for tomorrow
  for (let i = 0; i < 10; i++) {
    const isFromAirport = i % 2 !== 0; // Swap logic
    const isToAirport = !isFromAirport;
    const hasChildSeat = i % 3 === 0;
    const hasExtraStop = i % 4 === 0;

    const pickup = isFromAirport ? 'Flughafen Wien' : 'Test Address Tomorrow ' + i;
    const destination = isToAirport ? 'Flughafen Wien' : 'Test Address Tomorrow ' + i;
    const notes = [];
    if (isFromAirport) notes.push('Flight: LH' + (200 + i));
    if (hasChildSeat) notes.push('Child seat required');
    if (hasExtraStop) notes.push('Extra stop at High St ' + i);

    const pickupAt = new Date(tomorrow);
    pickupAt.setHours(9 + i, 30, 0, 0);

    bookings.push({
      full_name: 'Test User Tomorrow ' + i,
      email: `test_tomorrow_${i}@example.com`,
      phone: '+43660987654' + i,
      pickup,
      destination,
      pickup_at: pickupAt.toISOString(),
      passengers: 2 + (i % 3),
      luggage: 1 + (i % 3),
      vehicle_type: i % 3 === 0 ? 'Bus' : (i % 2 === 0 ? 'Kombi' : 'Limo'),
      price: 45 + (i * 3),
      status: 'confirmed',
      booking_reference: 'TMRW' + i + Math.floor(Math.random() * 1000),
      notes: notes.join(', '),
      ip_address: '127.0.0.1',
      confirm_token: uuidv4(),
      confirmed_at: new Date().toISOString()
    });
  }

  const { error } = await supabase.from('bookings').insert(bookings);

  if (error) {
    console.error('Error inserting bookings:', error);
  } else {
    console.log('Successfully inserted 20 test bookings.');
  }
}

seedBookings();
