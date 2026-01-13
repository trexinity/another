import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
  Center,
  Text,
  VStack,
  useColorMode,
} from '@chakra-ui/react';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';
import { MovieCard } from '../components/MovieCard';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../hooks/useWatchlist';

export const MyList = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const { watchlist, removeFromWatchlist } = useWatchlist();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlistMovies();
  }, [watchlist]);

  const fetchWatchlistMovies = async () => {
    if (watchlist.length === 0) {
      setMovies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const moviesRef = ref(db, 'movies');
      const snapshot = await get(moviesRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const moviesArray = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .filter((m) => watchlist.includes(m.id));

        setMovies(moviesArray);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center minH="100vh" bg={colorMode === 'dark' ? 'black' : 'white'}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={colorMode === 'dark' ? 'black' : 'white'} pt={24} pb={12}>
      <Container maxW="1920px" px={{ base: 4, md: 12 }}>
        <VStack align="stretch" spacing={8}>
          <Box>
            <Heading size="3xl" mb={2} letterSpacing="heading">
              My Watchlist
            </Heading>
            <Text opacity={0.7} fontSize="lg">
              {movies.length} {movies.length === 1 ? 'item' : 'items'} in your watchlist
            </Text>
          </Box>

          {movies.length > 0 ? (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={6}>
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  onAddToList={removeFromWatchlist}
                  isInList={true}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Center py={20}>
              <VStack spacing={4}>
                <Text fontSize="2xl" fontWeight="700">
                  Your watchlist is empty
                </Text>
                <Text opacity={0.7}>
                  Add movies and series to watch them later
                </Text>
              </VStack>
            </Center>
          )}
        </VStack>
      </Container>
    </Box>
  );
};
