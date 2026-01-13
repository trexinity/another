import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  Center,
} from '@chakra-ui/react';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';
import { MovieCard } from '../components/MovieCard';
import { useWatchlist } from '../hooks/useWatchlist';

export const MyList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { watchlist, removeFromWatchlist } = useWatchlist();

  const bg = useColorModeValue('white', '#0a0a0a');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    fetchWatchlistMovies();
  }, [watchlist]);

  const fetchWatchlistMovies = async () => {
    if (watchlist.length === 0) {
      setMovies([]);
      setLoading(false);
      return;
    }

    try {
      const moviesRef = ref(db, 'movies');
      const snapshot = await get(moviesRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const moviesArray = Object.keys(data)
          .filter((key) => watchlist.includes(key))
          .map((key) => ({
            id: key,
            ...data[key],
          }));

        setMovies(moviesArray);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (movie) => {
    removeFromWatchlist(movie.id);
  };

  return (
    <Box minH="100vh" bg={bg} pt={24} pb={12}>
      <Container maxW="1600px">
        <VStack align="stretch" spacing={8}>
          {/* Header */}
          <VStack align="stretch" spacing={2}>
            <Heading size="2xl" color={textColor} fontWeight="black">
              My List
            </Heading>
            <Text color="gray.500" fontSize="lg">
              {movies.length} {movies.length === 1 ? 'movie' : 'movies'} in your list
            </Text>
          </VStack>

          {/* Movies Grid */}
          {!loading && movies.length > 0 ? (
            <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onAddToList={handleRemove}
                  isInList={true}
                />
              ))}
            </SimpleGrid>
          ) : !loading ? (
            <Center py={20}>
              <VStack spacing={4}>
                <Text fontSize="2xl" color={textColor}>
                  Your list is empty
                </Text>
                <Text color="gray.500">
                  Add movies to your list to watch them later
                </Text>
              </VStack>
            </Center>
          ) : null}
        </VStack>
      </Container>
    </Box>
  );
};
