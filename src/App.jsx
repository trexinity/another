import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { TvShows } from './pages/TvShows';
import { Browse } from './pages/Browse';
import { Search } from './pages/Search';
import { MyList } from './pages/MyList';
import { Admin } from './pages/Admin';
import { MovieDetail } from './pages/MovieDetail';
import { AuthProvider } from './hooks/useAuth';
import { useAuth } from './hooks/useAuth';
import { Box } from '@chakra-ui/react';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <Box minH="100vh">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/movies" element={<ProtectedRoute><Movies /></ProtectedRoute>} />
        <Route path="/tv-shows" element={<ProtectedRoute><TvShows /></ProtectedRoute>} />
        <Route path="/sports" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/live-tv" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/my-list" element={<ProtectedRoute><MyList /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/movie/:id" element={<ProtectedRoute><MovieDetail /></ProtectedRoute>} />
      </Routes>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
