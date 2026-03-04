import { Metadata } from 'next';
import BookingForm from '@/components/BookingForm';

export const metadata: Metadata = {
  title: 'Book Your Ride',
  description: 'Book your airport transfer in Vienna in just a few steps.',
};

export default function BookingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Book Your Transfer</h1>
      <BookingForm />
    </div>
  );
}
