import CreateAuctionForm from '@/components/auctions/CreateAuctionForm';
import WalletConnector from '@/components/WalletConnector';

export default function CreateAuctionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🦅</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PhoenixPME</h1>
              <p className="text-gray-600 text-sm">Decentralized Precious Metals Exchange</p>
            </div>
          </div>
          <WalletConnector />
        </header>

        {/* Main Content */}
        <main>
          <CreateAuctionForm />
        </main>

        {/* Footer Info */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How PhoenixPME Auctions Work</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="font-semibold text-lg mb-2">Secure Escrow</h3>
              <p className="text-gray-600">
                Funds held in smart contract until delivery confirmed. 0% counterparty risk.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <div className="text-3xl mb-4">⚖️</div>
              <h3 className="font-semibold text-lg mb-2">Fair Pricing</h3>
              <p className="text-gray-600">
                Sellers set their own spot prices. No forced valuations. You control your pricing.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <div className="text-3xl mb-4">🔗</div>
              <h3 className="font-semibold text-lg mb-2">Cross-Chain</h3>
              <p className="text-gray-600">
                Pay with Coreum tokens, XRP, or stablecoins. Physical delivery with tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
