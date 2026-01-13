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
  Badge,
  useColorMode,
} from '@chakra-ui/react';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';
import { MovieCard } from '../components/MovieCard';
import { useWatchlist } from '../hooks/useWatchlist';
import { FiFilter } from 'react-icons/fi';

export const TvShows = () => {
  const { colorMode } = useColorMode();

  const [shows, setShows] = useState([]);
  const [filteredShows, setFilteredShows] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    filterAndSortShows();
  }, [shows, selectedGenre, sortBy]);

  const fetchShows = async () => {
    try {
      const moviesRef = ref(db, 'movies');
      const snapshot = await get(moviesRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const showsArray = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .filter((m) => m.type === 'series');
        setShows(showsArray);
      } else {
        setShows([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setShows([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortShows = () => {
    let filtered = [...shows];

    if (selectedGenre !== 'all') {
      filtered = filtered.filter((m) => m.genre === selectedGenre);
    }

    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'title':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        break;
    }

    setFilteredShows(filtered);
  };

  const handleWatchlistToggle = (show) => {
    if (watchlist.includes(show.id)) removeFromWatchlist(show.id);
    else addToWatchlist(show.id);
  };

  const genres = [...new Set(shows.map((m) => m.genre).filter(Boolean))];

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
        <VStack align="stretch" spacing={6} mb={8}>
          <HStack justify="space-between">
            <Heading size="2xl" fontFamily="heading">
              Series
            </Heading>
            <Badge px={3} py={1} fontSize="md" variant="subtle">
              {filteredShows.length} Items
            </Badge>
          </HStack>

          <HStack spacing={4} flexWrap="wrap">
            <HStack>
              <FiFilter />
              <Text opacity={0.75} fontSize="sm">
                Filter:
              </Text>
            </HStack>

            <Select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              maxW="200px"
              size="sm"
            >
              <option value="all">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </option>
              ))}
            </Select>

            <ButtonGroup size="sm" isAttached>
              <Button onClick={() => setSortBy('recent')} variant={sortBy === 'recent' ? 'solidBW' : 'ghostBW'}>
                Recent
              </Button>
              <Button onClick={() => setSortBy('popular')} variant={sortBy === 'popular' ? 'solidBW' : 'ghostBW'}>
                Popular
              </Button>
              <Button onClick={() => setSortBy('title')} variant={sortBy === 'title' ? 'solidBW' : 'ghostBW'}>
                A-Z
              </Button>
            </ButtonGroup>
          </HStack>
        </VStack>

        {filteredShows.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
            {filteredShows.map((show) => (
              <MovieCard
                key={show.id}
                movie={show}
                onAddToList={() => handleWatchlistToggle(show)}
                isInList={watchlist.includes(show.id)}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Center py={20}>
            <VStack spacing={2}>
              <Text fontSize="2xl" fontWeight="700">
                No series found
              </Text>
              <Text opacity={0.7}>Try adjusting your filters.</Text>
            </VStack>
          </Center>
        )}
      </Container>
    </Box>
  );
};
