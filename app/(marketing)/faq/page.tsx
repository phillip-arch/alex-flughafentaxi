import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description: 'Answers to common questions about our airport transfer service in Vienna.',
};

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
      <div className="space-y-6 max-w-3xl">
        <div className="p-6 border rounded-2xl">
          <h3 className="text-xl font-bold mb-2">How do I find my driver?</h3>
          <p className="text-slate-600">Your driver will be waiting for you at the arrival hall with a name sign.</p>
        </div>
        <div className="p-6 border rounded-2xl">
          <h3 className="text-xl font-bold mb-2">Can I pay by card?</h3>
          <p className="text-slate-600">Yes, all our drivers accept major credit and debit cards.</p>
        </div>
        <div className="p-6 border rounded-2xl">
          <h3 className="text-xl font-bold mb-2">What if my flight is delayed?</h3>
          <p className="text-slate-600">We monitor flight times. Your driver will adjust the pickup time accordingly at no extra cost.</p>
        </div>
      </div>
    </div>
  );
}
