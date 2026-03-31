import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './Home';
import NFLHome from './leagues/nfl/NFLHome';
import NBAHome from './leagues/nba/NBAHome';
import NHLHome from './leagues/nhl/NHLHome';
import MLBHome from './leagues/mlb/MLBHome';
import Standings from './leagues/nfl/Standings';
import NBAStandings from './leagues/nba/NBAStandings';
import NHLStandings from './leagues/nhl/NHLStandings';
import MLBStandings from './leagues/mlb/MLBStandings';
import BracketMaker from './components/BracketMaker';
import Leaderboard from './components/Leaderboard';
import PlayerStats from './leagues/nfl/PlayerStats';
import NBAPlayerStats from './leagues/nba/NBAPlayerStats';
import TeamPage from './leagues/nfl/TeamPage';
import NBATeamPage from './leagues/nba/NBATeamPage';
import NHLTeamPage from './leagues/nhl/NHLTeamPage';
import NHLPlayerStats from './leagues/nhl/NHLPlayerStats';
import MLBTeamPage from './leagues/mlb/MLBTeamPage';
import MLBPlayerStats from './leagues/mlb/MLBPlayerStats';
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

            {/* NHL routes */}
            <Route path="nhl">
              <Route index element={<NHLHome />} />
              <Route path="standings" element={<NHLStandings />} />
              <Route path="team/:teamId" element={<NHLTeamPage />} />
              <Route path="player/:playerId" element={<NHLPlayerStats />} />
            </Route>

            {/* MLB routes */}
            <Route path="mlb">
              <Route index element={<MLBHome />} />
              <Route path="standings" element={<MLBStandings />} />
              <Route path="team/:teamId" element={<MLBTeamPage />} />
              <Route path="player/:playerId" element={<MLBPlayerStats />} />
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