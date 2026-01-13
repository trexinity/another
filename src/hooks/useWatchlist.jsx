import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useWatchlist = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    if (user) {
      loadWatchlist();
    } else {
      setWatchlist([]);
    }
  }, [user]);

  const loadWatchlist = () => {
    const saved = localStorage.getItem(`watchlist_${user.uid}`);
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  };

  const saveWatchlist = (list) => {
    if (user) {
      localStorage.setItem(`watchlist_${user.uid}`, JSON.stringify(list));
      setWatchlist(list);
    }
  };

  const addToWatchlist = (movieId) => {
    if (!watchlist.includes(movieId)) {
      const newList = [...watchlist, movieId];
      saveWatchlist(newList);
    }
  };

  const removeFromWatchlist = (movieId) => {
    const newList = watchlist.filter((id) => id !== movieId);
    saveWatchlist(newList);
  };

  const isInWatchlist = (movieId) => {
    return watchlist.includes(movieId);
  };

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  };
};
