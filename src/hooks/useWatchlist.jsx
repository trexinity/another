import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';

const WatchlistContext = createContext();

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within WatchlistProvider');
  }
  return context;
};

export const WatchlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      return;
    }

    const storageKey = `watchlist_${user.uid}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse watchlist:', error);
        setWatchlist([]);
      }
    }
  }, [user]);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (!user) return;

    const storageKey = `watchlist_${user.uid}`;
    localStorage.setItem(storageKey, JSON.stringify(watchlist));
  }, [watchlist, user]);

  const addToWatchlist = (movieId) => {
    if (!watchlist.includes(movieId)) {
      setWatchlist((prev) => [...prev, movieId]);
    }
  };

  const removeFromWatchlist = (movieId) => {
    setWatchlist((prev) => prev.filter((id) => id !== movieId));
  };

  const isInWatchlist = (movieId) => {
    return watchlist.includes(movieId);
  };

  const clearWatchlist = () => {
    setWatchlist([]);
  };

  const value = {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    clearWatchlist,
  };

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
};
