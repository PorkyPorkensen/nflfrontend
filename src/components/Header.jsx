import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import AuthModal from './AuthModal';
import { FEATURES } from '../config/features';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLeagueMenu, setShowLeagueMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  // Determine current league from URL
  const getCurrentLeague = () => {
    if (location.pathname.startsWith('/nfl')) return 'nfl';
    if (location.pathname.startsWith('/nba')) return 'nba';
    if (location.pathname.startsWith('/nhl')) return 'nhl';
    return null;
  };

  const currentLeague = getCurrentLeague();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      // console.error('Error signing out:', error);
    }
  };

  const openAuthModal = () => {
    setShowAuthModal(true);
    setIsMenuOpen(false);
  };

  // Helper function to determine if a route is active
  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm mb-6">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <NavLink to="/" className="flex items-center">
            <img 
              src="/logo1.png" 
              alt="SportSync" 
              className="h-36 w-auto mr-3 cursor-pointer"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            <h1 className="text-xl font-bold text-gray-800 font-oswald cursor-pointer" style={{display: 'none'}}>SportSync</h1>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-2 lg:space-x-4 items-center">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 lg:px-4 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 underline'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`
              }
            >
              Home
            </NavLink>

            {/* League Selector Dropdown */}
            <div className="relative group">
              <button className="px-3 py-2 lg:px-4 rounded-lg font-medium transition-colors text-sm lg:text-base text-gray-600 hover:text-gray-800 hover:bg-gray-200 flex items-center">
                <span>Leagues</span>
                <svg className="w-4 h-4 ml-1 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <NavLink
                  to="/nfl"
                  className={({ isActive }) =>
                    `block w-full text-left px-4 py-3 hover:bg-gray-50 rounded-t-lg font-medium ${
                      isActive ? 'bg-blue-50 text-blue-700 border-b border-gray-200' : 'text-gray-700'
                    }`
                  }
                >
                  🏈 NFL
                </NavLink>
                <NavLink
                  to="/nba"
                  className={({ isActive }) =>
                    `block w-full text-left px-4 py-3 hover:bg-gray-50 rounded-b-lg font-medium ${
                      isActive ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
                    }`
                  }
                >
                  🏀 NBA
                </NavLink>
                <NavLink
                  to="/nhl"
                  className={({ isActive }) =>
                    `block w-full text-left px-4 py-3 hover:bg-gray-50 rounded-b-lg font-medium ${
                      isActive ? 'bg-gray-50 text-gray-700' : 'text-gray-700'
                    }`
                  }
                >
                  🏒 NHL
                </NavLink>
              </div>
            </div>

            {/* Conditional League-Specific Links */}
            {currentLeague === 'nfl' && (
              <>
                <NavLink
                  to="/nfl/standings"
                  className={({ isActive }) =>
                    `px-3 py-2 lg:px-4 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border border-blue-200 underline'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                    }`
                  }
                >
                  Standings
                </NavLink>
                {FEATURES.bracket && (
                  <NavLink
                    to="/nfl/bracket-maker"
                    className={({ isActive }) =>
                      `px-3 py-2 lg:px-4 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border border-blue-200 underline'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                      }`
                    }
                  >
                    <span className="hidden xl:inline">Bracket Maker</span>
                    <span className="xl:hidden">Brackets</span>
                  </NavLink>
                )}
                {FEATURES.leaderboard && (
                  <NavLink
                    to="/nfl/leaderboard"
                    className={({ isActive }) =>
                      `px-3 py-2 lg:px-4 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border border-blue-200 underline'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                      }`
                    }
                  >
                    Leaderboard
                  </NavLink>
                )}
              </>
            )}

            {/* NBA League-Specific Links */}
            {currentLeague === 'nba' && (
              <>
                <NavLink
                  to="/nba/standings"
                  className={({ isActive }) =>
                    `px-3 py-2 lg:px-4 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                      isActive
                        ? 'bg-orange-100 text-orange-700 border border-orange-200 underline'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                    }`
                  }
                >
                  Standings
                </NavLink>
              </>
            )}

            {/* NHL League-Specific Links */}
            {currentLeague === 'nhl' && (
              <>
                <NavLink
                  to="/nhl/standings"
                  className={({ isActive }) =>
                    `px-3 py-2 lg:px-4 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                      isActive
                        ? 'bg-gray-100 text-gray-700 border border-gray-200 underline'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                    }`
                  }
                >
                  Standings
                </NavLink>
              </>
            )}
          </nav>

          

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  Hello, {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMenu}
            className={`md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-colors ${
              isMenuOpen ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <nav className="py-4 space-y-2">
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                `block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`
              }
            >
              Home
            </NavLink>

            {/* League Selector for Mobile */}
            <div className="px-4 py-2 mt-2 mb-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Leagues</p>
              <NavLink
                to="/nfl"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors mb-1 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`
                }
              >
                🏈 NFL
              </NavLink>
              <NavLink
                to="/nba"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`
                }
              >
                🏀 NBA
              </NavLink>
              <NavLink
                to="/nhl"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-gray-700 border border-gray-200'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`
                }
              >
                🏒 NHL
              </NavLink>
            </div>

            {/* Conditional League-Specific Links for Mobile */}
            {currentLeague === 'nfl' && (
              <>
                <NavLink
                  to="/nfl/standings"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`
                  }
                >
                  Standings
                </NavLink>
                {FEATURES.bracket && (
                  <NavLink
                    to="/nfl/bracket-maker"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`
                    }
                  >
                    Bracket Maker
                  </NavLink>
                )}
                {FEATURES.leaderboard && (
                  <NavLink
                    to="/nfl/leaderboard"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`
                    }
                  >
                    Leaderboard
                  </NavLink>
                )}
              </>
            )}

            {/* NBA League-Specific Links for Mobile */}
            {currentLeague === 'nba' && (
              <>
                <NavLink
                  to="/nba/standings"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`
                  }
                >
                  Standings
                </NavLink>
              </>
            )}

            {/* NHL League-Specific Links for Mobile */}
            {currentLeague === 'nhl' && (
              <>
                <NavLink
                  to="/nhl/standings"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-100 text-gray-700 border border-gray-200'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`
                  }
                >
                  Standings
                </NavLink>
              </>
            )}
            
            {/* Mobile Auth Section */}
            <div className="border-t border-gray-200 pt-3 mt-3">
              {currentUser ? (
                <div className="space-y-2">
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="block w-full text-left px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign In
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </header>
  );
}