export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          مرحباً بكم في MJ CHAUFFAGE
        </h1>
        <h2 className="text-3xl font-bold text-blue-600 mb-8">
          Bienvenue chez MJ CHAUFFAGE
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🔧 Installation Services
            </h3>
            <p className="text-gray-600">
              Professional heating system installation for homes and businesses in Algeria.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🛠️ Maintenance & Repair
            </h3>
            <p className="text-gray-600">
              Expert maintenance and repair services to keep your heating systems running efficiently.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🛒 Quality Equipment
            </h3>
            <p className="text-gray-600">
              Premium boilers, radiators, and heating accessories from trusted brands.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-blue-800 mb-4">
            🇩🇿 Proudly Serving Algeria
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">✅ Payment Methods:</h4>
              <ul className="text-gray-700 space-y-1">
                <li>💰 Cash on Delivery</li>
                <li>💳 Dahabia Card (Algeria Post)</li>
                <li>🏦 Bank Transfer</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">🌟 Features:</h4>
              <ul className="text-gray-700 space-y-1">
                <li>🌐 Arabic & French Support</li>
                <li>🚚 Algeria-wide Delivery</li>
                <li>⚡ Google OAuth Login</li>
                <li>📱 Mobile Responsive</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-4">
            Start Shopping
          </button>
          <button className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
            Book Service
          </button>
        </div>
      </div>
    </div>
  )
}