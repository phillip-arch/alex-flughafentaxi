import { Metadata } from 'next';
import BookingForm from '@/components/BookingForm';

export const metadata: Metadata = {
  title: 'Fahrt buchen',
  description: 'Buchen Sie Ihren Flughafentransfer in Wien in nur wenigen Schritten.',
};

export default function BookingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Transfer buchen</h1>
      <BookingForm />
    </div>
  );
}
