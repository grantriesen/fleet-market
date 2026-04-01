// app/refund/page.tsx
import { MarketingHeader, MarketingFooter } from '@/components/MarketingLayout';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <MarketingHeader />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <p className="text-[#E8472F] font-bold uppercase tracking-wide text-sm mb-3">Legal</p>
          <h1 className="text-4xl font-bold text-white mb-4">Refund Policy</h1>
          <p className="text-gray-400">Last updated: April 1, 2026</p>
        </div>

        {/* Summary box */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-10">
          <h2 className="text-lg font-bold text-white mb-2">Summary</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Fleet Market subscriptions are billed monthly or annually with no long-term contracts. You may cancel at any time. We offer a 7-day money-back guarantee for new subscribers. After the guarantee period, refunds are evaluated on a case-by-case basis.
          </p>
        </div>

        <div className="space-y-10">
          {[
            {
              title: '1. Subscription Billing',
              content: `Fleet Market is a subscription service billed on a recurring basis — either monthly or annually depending on your chosen plan. Your subscription automatically renews at the end of each billing period unless cancelled.

You will be charged on the same day each month (or year for annual plans). Charges appear on your statement as "Fleet Market" or "Fleetmarket.us".`
            },
            {
              title: '2. 7-Day Money-Back Guarantee',
              content: `New subscribers are eligible for a full refund within 7 days of their initial payment. To request a refund under this guarantee, contact us at support@fleetmarket.us within 7 days of your first charge.

This guarantee applies to your first payment only and is available once per customer. The guarantee does not apply to subsequent billing cycles or renewals.`
            },
            {
              title: '3. Cancellation Policy',
              content: `You may cancel your Fleet Market subscription at any time from your account settings. Cancellation takes effect at the end of your current billing period — your site will remain live and accessible until that date.

We do not offer prorated refunds for partial months or years when you cancel mid-period. After cancellation, your site will go offline at the end of your paid period.`
            },
            {
              title: '4. Add-On Refunds',
              content: `Add-ons (Inventory Management, Service Scheduling, and Rental Management) are billed as part of your overall subscription. The same 7-day guarantee and cancellation policy applies to add-ons.

If you remove an add-on mid-billing period, you will retain access to that add-on until the end of your current billing period. No prorated refund is issued for removed add-ons.`
            },
            {
              title: '5. Early Adopter Promotions',
              content: `If you signed up through a partner referral with early adopter pricing (free add-ons for 3 or 6 months), the promotional period is non-refundable once the free period has begun. At the end of the promotional period, standard pricing applies automatically.`
            },
            {
              title: '6. Annual Billing Refunds',
              content: `For annual subscriptions, refund requests made within 7 days of payment are eligible for a full refund. After the 7-day window, annual subscriptions are non-refundable for the remainder of the annual term.

If you switch from annual to monthly billing, the change will take effect at your next renewal date. No partial refund is issued for the unused annual period.`
            },
            {
              title: '7. Service Disruptions',
              content: `In the event of extended service disruptions (more than 24 consecutive hours of downtime) caused by Fleet Market infrastructure failures, we will issue a prorated credit to your account for the affected period.

This credit will be applied to your next billing cycle. Credits are not transferable and have no cash value.`
            },
            {
              title: '8. Rental Deposits (Dealer Customers)',
              content: `If you use the Rental Management add-on to collect deposits from your customers, refund policies for those deposits are set by you as the dealer. Fleet Market is not responsible for deposit refunds to your end customers — those transactions are governed by your rental agreement with your customers.`
            },
            {
              title: '9. How to Request a Refund',
              content: `To request a refund, please contact us at:

Email: support@fleetmarket.us
Subject: Refund Request — [your account email]

Include your account email, the reason for your request, and the date of the charge. We will respond within 2 business days. Approved refunds are processed within 5–10 business days and returned to your original payment method.`
            },
            {
              title: '10. Changes to This Policy',
              content: `We may update this Refund Policy from time to time. Changes will be posted to this page with an updated date. Continued use of Fleet Market after any changes constitutes acceptance of the updated policy.`
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
