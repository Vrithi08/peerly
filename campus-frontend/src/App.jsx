import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Challenges from './pages/Challenges';
import HelpDesk from './pages/HelpDesk';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import CreateChallenge from './pages/CreateChallenge';
import ChallengeDetails from './pages/ChallengeDetails';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-[#0a0a0f] text-slate-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/help" element={<HelpDesk />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/create-challenge" element={<CreateChallenge />} />
              <Route path="/challenge/:id" element={<ChallengeDetails />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
