import { useEffect, useState } from 'react';
import { Box, Spinner, VStack, Text } from '@chakra-ui/react';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';
import { Hero } from '../components/Hero';
import { MovieRow } from '../components/MovieRow';
import { useAuth } from '../hooks/useAuth';

export const Home = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const [actionMovies, setActionMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [dramaMovies, setDramaMovies] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);
  const [scifiMovies, setScifiMovies] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [myList, setMyList] = useState([]);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const moviesRef = ref(db, 'movies');
        const snapshot = await get(moviesRef);

        if (snapshot.exists()) {
          const moviesData = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
            ...data
          }));

          setMovies(moviesData);

          // Set featured movie (highest views)
          const featured = moviesData.sort((a, b) => (b.views || 0) - (a.views || 0))[0];
          setFeaturedMovie(featured);

          // Group by genre
          setActionMovies(moviesData.filter(m => m.genre === 'action'));
          setComedyMovies(moviesData.filter(m => m.genre === 'comedy'));
          setDramaMovies(moviesData.filter(m => m.genre === 'drama'));
          setHorrorMovies(moviesData.filter(m => m.genre === 'horror'));
          setScifiMovies(moviesData.filter(m => m.genre === 'sci-fi'));

          // Load user-specific data if logged in
          if (user) {
            // Continue watching
            const progressRef = ref(db, `users/${user.uid}/watchProgress`);
            const progressSnapshot = await get(progressRef);
            if (progressSnapshot.exists()) {
              const progressData = Object.entries(progressSnapshot.val()).map(([id, data]) => {
                const movie = moviesData.find(m => m.id === id);
                return movie ? { ...movie, ...data } : null;
              }).filter(Boolean);
              setContinueWatching(progressData);
            }

            // My List
            if (user.favorites && user.favorites.length > 0) {
              const myListData = moviesData.filter(m => user.favorites.includes(m.id));
              setMyList(myListData);
            }
          }
        }
      } catch (error) {
        console.error('Error loading movies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [user]);

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.primary" thickness="4px" />
          <Text>Loading content...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="brand.background">
      {/* Hero Banner */}
      {featuredMovie && <Hero movie={featuredMovie} />}

      {/* Movie Rows */}
      <Box mt="-150px" position="relative" zIndex={1}>
        {continueWatching.length > 0 && (
          <MovieRow title="Continue Watching for You" movies={continueWatching} showProgress />
        )}

        {myList.length > 0 && (
          <MovieRow title="My List" movies={myList} />
        )}

        <MovieRow title="Trending Now" movies={movies.sort((a, b) => (b.views || 0) - (a.views || 0))} />

        {actionMovies.length > 0 && <MovieRow title="Action & Adventure" movies={actionMovies} />}
        {comedyMovies.length > 0 && <MovieRow title="Comedies" movies={comedyMovies} />}
        {dramaMovies.length > 0 && <MovieRow title="Dramas" movies={dramaMovies} />}
        {horrorMovies.length > 0 && <MovieRow title="Horror & Thriller" movies={horrorMovies} />}
        {scifiMovies.length > 0 && <MovieRow title="Sci-Fi & Fantasy" movies={scifiMovies} />}

        <MovieRow title="New Releases" movies={movies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))} />
        <MovieRow title="Popular on ANOTHER" movies={movies.sort((a, b) => (b.likes || 0) - (a.likes || 0))} />
      </Box>
    </Box>
  );
};
