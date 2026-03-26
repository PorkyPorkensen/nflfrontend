import { Link } from "react-router-dom";

export default function Home() {
  const leagues = [
    {
      name: "NFL",
      icon: "🏈",
      description: "National Football League",
      color: "from-blue-500 to-blue-600",
      path: "/nfl",
      status: "active"
    },
    {
      name: "NBA",
      icon: "🏀",
      description: "National Basketball Association",
      color: "from-orange-500 to-orange-600",
      path: "/nba",
      status: "active"
    },
    {
      name: "NHL",
      icon: "🏒",
      description: "National Hockey League",
      color: "from-gray-700 to-gray-800",
      path: "/nhl",
      status: "active"
    }
  ];

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex items-center flex-col justify-center md:flex-row">
          <img 
            src="/logo3.png" 
            alt="SportSync" 
            className="h-20 w-auto mr-3 mb-4 md:mb-0"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'inline';
            }}
          />
          <h1 className="text-5xl font-bold text-gray-800" style={{display: 'none'}}>SportSync</h1>
        </div>
        <p className="text-xl text-gray-600 mt-8">
          Your one-stop shop for live scores, standings, and sports predictions
        </p>
      </div>

      {/* League Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {leagues.map((league) => (
          <Link
            key={league.name}
            to={league.path}
            className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${league.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
            
            {/* Content */}
            <div className="relative p-12 text-white flex flex-col justify-between min-h-64">
              <div>
                <div className="text-6xl mb-4">{league.icon}</div>
                <h2 className="text-4xl font-bold mb-2">{league.name}</h2>
                <p className="text-lg opacity-90">{league.description}</p>
              </div>
              
              <div className="flex items-center text-lg font-semibold">
                <span>Explore</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Hover effect border */}
            <div className="absolute inset-0 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
          </Link>
        ))}
      </div>

      {/* Features Preview */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">What We Offer</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Live Standings</h4>
              <p className="text-gray-600">
                Real-time league standings and rankings
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Game Updates</h4>
              <p className="text-gray-600">
                Live scores and game information
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Predictions</h4>
              <p className="text-gray-600">
                Make predictions and compete with friends
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}