import React, { useState, useEffect } from 'react';

// Main App component
const App = () => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [insightLoading, setInsightLoading] = useState(false); // State for LLM loading
  const [currentInsight, setCurrentInsight] = useState(null); // State for LLM response
  const [showInsightModal, setShowInsightModal] = useState(false); // State to control modal visibility

  // Simulate fetching cryptocurrency data
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const mockData = [
          { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 68500.23, change24h: 2.5, icon: '₿' },
          { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 3500.78, change24h: -1.2, icon: 'Ξ' },
          { id: 'ripple', name: 'XRP', symbol: 'XRP', price: 0.52, change24h: 0.8, icon: '✕' },
          { id: 'solana', name: 'Solana', symbol: 'SOL', price: 150.10, change24h: 4.1, icon: '◎' },
          { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', price: 0.18, change24h: -0.5, icon: 'Ð' },
          { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: 0.45, change24h: 1.3, icon: '₳' },
          { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', price: 75.60, change24h: -0.2, icon: 'Ł' },
          { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', price: 7.20, change24h: 3.0, icon: '●' },
        ];

        await new Promise(resolve => setTimeout(resolve, 1000));
        setCryptos(mockData);
      } catch (err) {
        setError('Failed to load cryptocurrency data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  // Function to get crypto insight using Gemini API
  const getCryptoInsight = async (cryptoName) => {
    setInsightLoading(true);
    setCurrentInsight(null); // Clear previous insight
    setShowInsightModal(true); // Show modal immediately with loading indicator

    try {
      let chatHistory = [];
      const prompt = `Provide a very brief, interesting fact or simple explanation about ${cryptoName}. Keep it to 2-3 sentences.`;
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will automatically provide this
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setCurrentInsight(text);
      } else {
        setCurrentInsight("Could not retrieve insight. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching Gemini API:", err);
      setCurrentInsight("Failed to fetch insight due to an error.");
    } finally {
      setInsightLoading(false);
    }
  };

  // Filter cryptocurrencies based on search term
  const filteredCryptos = cryptos.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 font-inter antialiased flex flex-col">
      {/* Header */}
      <header className="bg-black text-yellow-400 p-4 shadow-lg rounded-b-lg border-b border-green-500">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center">
            <span className="mr-2 text-green-400">📈</span> CryptoPulse
          </h1>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#" className="hover:text-green-300 transition-colors duration-200">Dashboard</a></li>
              <li><a href="#" className="hover:text-green-300 transition-colors duration-200">Portfolio</a></li>
              <li><a href="#" className="hover:text-green-300 transition-colors duration-200">Settings</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <h2 className="text-4xl font-extrabold text-yellow-400 mb-8 text-center">
          Live Cryptocurrency Prices
        </h2>

        {/* Search Bar */}
        <div className="mb-8 flex justify-center">
          <input
            type="text"
            placeholder="Search cryptocurrency..."
            className="w-full max-w-md p-3 rounded-lg border border-yellow-500 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
            <p className="ml-4 text-lg text-gray-400">Loading data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-800 border border-red-600 text-red-200 px-4 py-3 rounded-md relative text-center" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCryptos.length > 0 ? (
              filteredCryptos.map(crypto => (
                <CryptoCard
                  key={crypto.id}
                  crypto={crypto}
                  onGetInsight={getCryptoInsight} // Pass the function down
                />
              ))
            ) : (
              <div className="col-span-full text-center text-lg text-gray-400">
                No cryptocurrencies found matching your search.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Insight Modal */}
      {showInsightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-yellow-600 rounded-lg shadow-xl p-8 max-w-lg w-full relative">
            <button
              onClick={() => setShowInsightModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Crypto Insight ✨</h3>
            {insightLoading ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-green-500"></div>
                <p className="ml-4 text-lg text-gray-400">Generating insight...</p>
              </div>
            ) : (
              <p className="text-gray-200 text-lg leading-relaxed">{currentInsight}</p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black text-gray-400 p-4 mt-8 rounded-t-lg border-t border-green-500">
        <div className="container mx-auto text-center text-sm">
          <p>&copy; {new Date().getFullYear()} CryptoPulse. All rights reserved.</p>
          <p className="mt-2">Data provided for informational purposes only.</p>
        </div>
      </footer>
    </div>
  );
};

// CryptoCard Component
const CryptoCard = ({ crypto, onGetInsight }) => {
  const isPositive = crypto.change24h >= 0;
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
  const arrowIcon = isPositive ? '↑' : '↓';

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col border border-yellow-600">
      <div className="p-6 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center">
          <div className="text-4xl mr-4 text-green-400">{crypto.icon}</div>
          <div>
            <h3 className="text-2xl font-semibold text-yellow-300">{crypto.name}</h3>
            <p className="text-sm text-gray-400">{crypto.symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>
      <div className="p-6 flex justify-between items-center">
        <div className="text-lg text-gray-300">24h Change:</div>
        <div className={`text-xl font-bold ${changeColor}`}>
          {arrowIcon} {Math.abs(crypto.change24h).toFixed(2)}%
        </div>
      </div>
      <div className="p-4 bg-gray-700 text-center text-sm text-gray-400 border-t border-gray-600">
        Click for more details
      </div>
      <div className="p-4 bg-gray-700 flex justify-center border-t border-gray-600">
        <button
          onClick={() => onGetInsight(crypto.name)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Get Insight ✨
        </button>
      </div>
    </div>
  );
};

export default App;
