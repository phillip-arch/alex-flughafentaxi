import { Metadata } from 'next';
import BookingPageClient from './BookingPageClient';

export const metadata: Metadata = {
  title: 'Fahrt buchen',
  description: 'Buchen Sie Ihren Flughafentransfer in Wien in nur wenigen Schritten.',
};

export default function BookingPage() {
  return <BookingPageClient />;
}
