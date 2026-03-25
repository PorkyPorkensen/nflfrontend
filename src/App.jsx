import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './Home';
import NFLHome from './leagues/NFLHome';
import NBAHome from './leagues/NBAHome';
import Standings from './Standings';
import NBAStandings from './leagues/NBAStandings';
import BracketMaker from './BracketMaker';
import Leaderboard from './Leaderboard';
import PlayerStats from './PlayerStats';
import NBAPlayerStats from './NBAPlayerStats';
import TeamPage from './TeamPage';
import NBATeamPage from './NBATeamPage';
import { AuthProvider } from './firebase/AuthContext';
import { FEATURES } from './config/features';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Home route - League selector */}
            <Route index element={<Home />} />
            
            {/* NFL routes */}
            <Route path="nfl">
              <Route index element={<NFLHome />} />
              <Route path="standings" element={<Standings />} />
              <Route path="team/:teamId" element={<TeamPage />} />
              <Route path="player/:playerId" element={<PlayerStats />} />
              {FEATURES.bracket && <Route path="bracket-maker" element={<BracketMaker />} />}
              {FEATURES.leaderboard && <Route path="leaderboard" element={<Leaderboard />} />}
            </Route>

            {/* NBA routes */}
            <Route path="nba">
              <Route index element={<NBAHome />} />
              <Route path="standings" element={<NBAStandings />} />
              <Route path="team/:teamId" element={<NBATeamPage />} />
              <Route path="player/:playerId" element={<NBAPlayerStats />} />
            </Route>

            {/* Legacy redirects for existing bookmarks */}
            <Route path="standings" element={<Navigate to="/nfl/standings" replace />} />
            {FEATURES.bracket && <Route path="bracket-maker" element={<Navigate to="/nfl/bracket-maker" replace />} />}
            {FEATURES.leaderboard && <Route path="leaderboard" element={<Navigate to="/nfl/leaderboard" replace />} />}
            <Route path="home" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}