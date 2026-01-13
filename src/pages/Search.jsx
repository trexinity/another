import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';
import { MovieCard } from '../components/MovieCard';
import { FiSearch } from 'react-icons/fi';
import { useWatchlist } from '../hooks/useWatchlist';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [movies, setMovies] = useState([]);
  const [results, setResults] = useState([]);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const bg = useColorModeValue('white', '#0a0a0a');
  const textColor = useColorModeValue('gray.800', 'white');
  const inputBg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.800');

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    searchMovies(query);
  }, [query, movies]);

  const fetchMovies = async () => {
    try {
      const moviesRef = ref(db, 'movies');
      const snapshot = await get(moviesRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const moviesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setMovies(moviesArray);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const searchMovies = (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const filtered = movies.filter((movie) =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (movie.description && movie.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (movie.genre && movie.genre.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (movie.cast && movie.cast.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (movie.director && movie.director.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setResults(filtered);
  };

  const handleSearch = (value) => {
    setQuery(value);
    setSearchParams(value ? { q: value } : {});
  };

  const handleWatchlistToggle = (movie) => {
    if (watchlist.includes(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie.id);
    }
  };

  return (
    <Box minH="100vh" bg={bg} pt={24} pb={12}>
      <Container maxW="1600px">
        <VStack align="stretch" spacing={8}>
          {/* Search Header */}
          <VStack align="stretch" spacing={4}>
            <Heading size="2xl" color={textColor} fontWeight="black">
              Search
            </Heading>

            <InputGroup size="lg" maxW="600px">
              <InputLeftElement>
                <FiSearch size={24} />
              </InputLeftElement>
              <Input
                placeholder="Search for movies, genres, actors..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                bg={inputBg}
                border="2px solid"
                borderColor={borderColor}
                _focus={{ borderColor: 'white' }}
                fontSize="lg"
                autoFocus
              />
            </InputGroup>

            {query && (
              <Text color={textColor} fontSize="lg">
                {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
              </Text>
            )}
          </VStack>

          {/* Results */}
          {query && results.length > 0 ? (
            <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
              {results.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onAddToList={handleWatchlistToggle}
                  isInList={watchlist.includes(movie.id)}
                />
              ))}
            </SimpleGrid>
          ) : query ? (
            <VStack py={20} spacing={4}>
              <Text fontSize="2xl" color={textColor}>
                No results found
              </Text>
              <Text color="gray.500">
                Try searching for something else
              </Text>
            </VStack>
          ) : (
            <VStack py={20} spacing={4}>
              <Text fontSize="2xl" color={textColor}>
                Start searching
              </Text>
              <Text color="gray.500">
                Search for movies, genres, or actors
              </Text>
            </VStack>
          )}
        </VStack>
      </Container>
    </Box>
  );
};
