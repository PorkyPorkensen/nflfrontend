import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';


export default function Layout() {
  const location = useLocation();
  
  // Don't show LiveGamesHeader on home page or root
  const showLiveGames = location.pathname !== '/' && !location.pathname.includes('/home');

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation Header */}
      <Header />
      
      {/* Live Games Header - Shows on every page except home */}

      
      {/* Page Content */}
      <Outlet />

      {/* Footer */}
      <footer className="mt-10 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center">
          <a
            href="/privacy-policy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Privacy Policy
          </a>
        </div>
      </footer>
    </div>
  );
}