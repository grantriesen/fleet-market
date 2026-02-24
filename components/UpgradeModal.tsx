interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export default function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4">👑</div>
          <h2 className="text-3xl font-bold mb-4">Upgrade to Premium</h2>
          <p className="text-lg text-gray-600 mb-8">
            {feature ? `Unlock ${feature} and more premium features` : 'Unlock all premium features'}
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="border rounded-lg p-6">
              <h3 className="font-bold text-xl mb-2">Basic</h3>
              <p className="text-3xl font-bold mb-4">$200<span className="text-sm text-gray-500">/mo</span></p>
              <ul className="text-left space-y-2 text-sm">
                <li>✓ 4 Core Pages</li>
                <li>✓ Basic Customization</li>
                <li>✓ SSL Certificate</li>
              </ul>
            </div>
            
            <div className="border-2 border-orange-500 rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
              <h3 className="font-bold text-xl mb-2">Professional</h3>
              <p className="text-3xl font-bold mb-4">$350<span className="text-sm text-gray-500">/mo</span></p>
              <ul className="text-left space-y-2 text-sm">
                <li>✓ Everything in Basic</li>
                <li>✓ Service Page</li>
                <li>✓ Inventory Management</li>
                <li>✓ Advanced Analytics</li>
              </ul>
              <button className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold mt-4 hover:bg-orange-600">
                Upgrade Now
              </button>
            </div>
            
            <div className="border rounded-lg p-6">
              <h3 className="font-bold text-xl mb-2">Enterprise</h3>
              <p className="text-3xl font-bold mb-4">$600<span className="text-sm text-gray-500">/mo</span></p>
              <ul className="text-left space-y-2 text-sm">
                <li>✓ Everything in Pro</li>
                <li>✓ Rental Management</li>
                <li>✓ Custom Features</li>
                <li>✓ Priority Support</li>
              </ul>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
