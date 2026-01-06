import { useState, useEffect } from 'react';
import axios from 'axios';

const WORKER_URL = import.meta.env.VITE_WORKER_URL;

export const useMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${WORKER_URL}/api/movies`);
      if (response.data.success) {
        setMovies(response.data.movies);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (query) => {
    try {
      const response = await axios.get(`${WORKER_URL}/api/movies/search?q=${query}`);
      return response.data.success ? response.data.results : [];
    } catch (err) {
      return [];
    }
  };

  const trackView = async (movieId) => {
    try {
      await axios.post(`${WORKER_URL}/api/analytics/view`, { movieId });
    } catch (err) {
      console.error('Track view error:', err);
    }
  };

  return { movies, loading, error, searchMovies, trackView };
};
