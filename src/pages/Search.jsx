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
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWatchlist } from '../hooks/useWatchlist';

export const Search = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const { watchlist } = useWatchlist();
  const [searchParams] = useSearchParams();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get('q') || '';

  useEffect(() => {
    searchMovies();
  }, [query]);

  const searchMovies = async () => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const moviesRef = ref(db, 'movies');
      const snapshot = await get(moviesRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const moviesArray = Object.keys(data).map((key) => ({ id: key, ...data[key] }));

        const searchLower = query.toLowerCase();
        const filtered = moviesArray.filter(
          (m) =>
            m.title?.toLowerCase().includes(searchLower) ||
            m.description?.toLowerCase().includes(searchLower) ||
            m.genre?.toLowerCase().includes(searchLower) ||
            m.director?.toLowerCase().includes(searchLower) ||
            m.cast?.toLowerCase().includes(searchLower)
        );

        setResults(filtered);
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
              Search Results
            </Heading>
            <Text opacity={0.7} fontSize="lg">
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </Text>
          </Box>

          {results.length > 0 ? (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={6}>
              {results.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  isInList={watchlist.includes(movie.id)}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Center py={20}>
              <VStack spacing={4}>
                <Text fontSize="2xl" fontWeight="700">
                  No results found
                </Text>
                <Text opacity={0.7}>
                  Try searching with different keywords
                </Text>
              </VStack>
            </Center>
          )}
        </VStack>
      </Container>
    </Box>
  );
};
