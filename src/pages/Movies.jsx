import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Select,
  HStack,
  Button,
  Text,
  VStack,
  Spinner,
  Center,
  ButtonGroup,
} from '@chakra-ui/react';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';
import { MovieCard } from '../components/MovieCard';
import { useWatchlist } from '../hooks/useWatchlist';
import { FiFilter } from 'react-icons/fi';

export const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    filterAndSortMovies();
  }, [movies, selectedGenre, selectedYear, sortBy]);

  const fetchMovies = async () => {
    try {
      const moviesRef = ref(db, 'movies');
      const snapshot = await get(moviesRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const moviesArray = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .filter((m) => m.type === 'movie' || !m.type);
        setMovies(moviesArray);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortMovies = () => {
    let filtered = [...movies];

    if (selectedGenre !== 'all') {
      filtered = filtered.filter((m) => m.genre === selectedGenre);
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter((m) => m.year === parseInt(selectedYear));
    }

    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'year':
        filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        break;
    }

    setFilteredMovies(filtered);
  };

  const handleWatchlistToggle = (movie) => {
    if (watchlist.includes(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie.id);
    }
  };

  const genres = [...new Set(movies.map((m) => m.genre).filter(Boolean))];
  const years = [...new Set(movies.map((m) => m.year).filter(Boolean))].sort((a, b) => b - a);

  if (loading) {
    return (
      <Center minH="100vh" bg="#0F171E">
        <Spinner size="xl" color="#00A8E1" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="#0F171E" pt={24} pb={12}>
      <Container maxW="1920px" px={{ base: 4, md: 12 }}>
        {/* Header */}
        <VStack align="stretch" spacing={6} mb={8}>
          <Heading size="2xl" color="white" fontFamily="HeadingFont">
            Movies
          </Heading>

          {/* Filters */}
          <HStack spacing={4} flexWrap="wrap">
            <HStack>
              <FiFilter color="#00A8E1" />
              <Text color="gray.400" fontSize="sm">Filter:</Text>
            </HStack>

            <Select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              maxW="200px"
              bg="#1A242F"
              border="1px solid rgba(255,255,255,0.1)"
              color="white"
              size="sm"
            >
              <option value="all">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </option>
              ))}
            </Select>

            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              maxW="150px"
              bg="#1A242F"
              border="1px solid rgba(255,255,255,0.1)"
              color="white"
              size="sm"
            >
              <option value="all">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Select>

            <ButtonGroup size="sm" isAttached variant="outline">
              <Button
                onClick={() => setSortBy('recent')}
                bg={sortBy === 'recent' ? '#00A8E1' : 'transparent'}
                color={sortBy === 'recent' ? 'white' : 'gray.400'}
                _hover={{ bg: sortBy === 'recent' ? '#0095C8' : '#1A242F' }}
                borderColor="rgba(255,255,255,0.1)"
              >
                Recent
              </Button>
              <Button
                onClick={() => setSortBy('popular')}
                bg={sortBy === 'popular' ? '#00A8E1' : 'transparent'}
                color={sortBy === 'popular' ? 'white' : 'gray.400'}
                _hover={{ bg: sortBy === 'popular' ? '#0095C8' : '#1A242F' }}
                borderColor="rgba(255,255,255,0.1)"
              >
                Popular
              </Button>
              <Button
                onClick={() => setSortBy('title')}
                bg={sortBy === 'title' ? '#00A8E1' : 'transparent'}
                color={sortBy === 'title' ? 'white' : 'gray.400'}
                _hover={{ bg: sortBy === 'title' ? '#0095C8' : '#1A242F' }}
                borderColor="rgba(255,255,255,0.1)"
              >
                A-Z
              </Button>
            </ButtonGroup>
          </HStack>

          <Text color="gray.400" fontSize="sm">
            {filteredMovies.length} {filteredMovies.length === 1 ? 'movie' : 'movies'}
          </Text>
        </VStack>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onAddToList={handleWatchlistToggle}
                isInList={watchlist.includes(movie.id)}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Center py={20}>
            <VStack spacing={4}>
              <Text fontSize="2xl" color="white">No movies found</Text>
              <Text color="gray.500">Try adjusting your filters</Text>
            </VStack>
          </Center>
        )}
      </Container>
    </Box>
  );
};
