// app/privacy/page.tsx
import { MarketingHeader, MarketingFooter } from '@/components/MarketingLayout';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <MarketingHeader />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <p className="text-[#E8472F] font-bold uppercase tracking-wide text-sm mb-3">Legal</p>
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: April 1, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-10">
          {[
            {
              title: '1. Information We Collect',
              content: `We collect information you provide directly to us when you create an account, set up your dealer website, or contact us for support. This includes your name, email address, business name, phone number, and payment information processed securely through Stripe.

We also automatically collect certain information when you use Fleet Market, including log data (IP address, browser type, pages visited), usage data (features you use, time spent), and device information.`
            },
            {
              title: '2. How We Use Your Information',
              content: `We use the information we collect to provide, maintain, and improve Fleet Market services; process transactions and send related information; send you technical notices and support messages; respond to your comments and questions; and monitor and analyze usage patterns to improve the platform.

We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist in our operations (such as Stripe for payments, Supabase for data storage, and Vercel for hosting) under appropriate confidentiality agreements.`
            },
            {
              title: '3. Dealer Website Data',
              content: `When you build a dealer website using Fleet Market, your customers may submit contact information, service requests, and rental inquiries through your site. This data belongs to you as the dealer. We store it on your behalf and do not use your customers' data for our own marketing purposes.

You are responsible for having appropriate privacy notices on your dealer website and for complying with applicable privacy laws regarding your customers' data.`
            },
            {
              title: '4. Payment Information',
              content: `All payment processing is handled by Stripe, a PCI-compliant payment processor. Fleet Market does not store your full credit card number or payment details. Stripe's privacy policy governs the handling of your payment information.

If you use the Rental Management add-on to collect deposits from your customers, those transactions are also processed through Stripe Connect and subject to Stripe's terms.`
            },
            {
              title: '5. Cookies and Tracking',
              content: `We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with small amounts of data that are stored on your device.

You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of Fleet Market.`
            },
            {
              title: '6. Data Retention',
              content: `We retain your information for as long as your account is active or as needed to provide services. If you cancel your subscription, we will retain your data for 30 days to allow for reactivation, after which it may be permanently deleted upon request.

You may request deletion of your account and associated data at any time by contacting support@fleetmarket.us.`
            },
            {
              title: '7. Security',
              content: `We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit using TLS and at rest using industry-standard encryption.

However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.`
            },
            {
              title: '8. Children\'s Privacy',
              content: `Fleet Market is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will delete that information promptly.`
            },
            {
              title: '9. Changes to This Policy',
              content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. For significant changes, we will send an email notification to the address associated with your account.`
            },
            {
              title: '10. Contact Us',
              content: `If you have any questions about this Privacy Policy or our privacy practices, please contact us at:

Fleet Market
Email: support@fleetmarket.us
Website: fleetmarket.us`
            },
          ].map(section => (
            <div key={section.title} className="border-b border-slate-800 pb-10">
              <h2 className="text-xl font-bold text-white mb-4">{section.title}</h2>
              {section.content.split('\n\n').map((para, i) => (
                <p key={i} className="text-gray-400 leading-relaxed mb-4 whitespace-pre-line">{para}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
