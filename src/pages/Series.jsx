import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
  Center,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';
import { MovieCard } from '../components/MovieCard';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../hooks/useWatchlist';
import { FiChevronDown } from 'react-icons/fi';

export const Series = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const { watchlist } = useWatchlist();

  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const moviesRef = ref(db, 'movies');
      const snapshot = await get(moviesRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const seriesArray = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .filter((m) => m.type === 'series');

        setSeries(seriesArray);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const genres = ['all', ...new Set(series.map((m) => m.genre).filter(Boolean))];

  let filteredSeries = series;

  if (selectedGenre !== 'all') {
    filteredSeries = filteredSeries.filter((m) => m.genre === selectedGenre);
  }

  if (sortBy === 'latest') {
    filteredSeries = [...filteredSeries].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else if (sortBy === 'popular') {
    filteredSeries = [...filteredSeries].sort((a, b) => (b.views || 0) - (a.views || 0));
  } else if (sortBy === 'title') {
    filteredSeries = [...filteredSeries].sort((a, b) => a.title.localeCompare(b.title));
  }

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
              Series
            </Heading>
            <Text opacity={0.7} fontSize="lg">
              Explore our collection of {series.length} series
            </Text>
          </Box>

          <HStack spacing={4} flexWrap="wrap">
            <Menu>
              <MenuButton as={Button} rightIcon={<FiChevronDown />} variant="outline" size="lg" fontWeight="700">
                Genre: {selectedGenre === 'all' ? 'All' : selectedGenre}
              </MenuButton>
              <MenuList>
                {genres.map((genre) => (
                  <MenuItem
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    fontWeight={selectedGenre === genre ? '900' : '600'}
                    textTransform="capitalize"
                  >
                    {genre === 'all' ? 'All Genres' : genre}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            <Menu>
              <MenuButton as={Button} rightIcon={<FiChevronDown />} variant="outline" size="lg" fontWeight="700">
                Sort: {sortBy === 'latest' ? 'Latest' : sortBy === 'popular' ? 'Popular' : 'A-Z'}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setSortBy('latest')} fontWeight={sortBy === 'latest' ? '900' : '600'}>
                  Latest First
                </MenuItem>
                <MenuItem onClick={() => setSortBy('popular')} fontWeight={sortBy === 'popular' ? '900' : '600'}>
                  Most Popular
                </MenuItem>
                <MenuItem onClick={() => setSortBy('title')} fontWeight={sortBy === 'title' ? '900' : '600'}>
                  Alphabetical
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>

          {filteredSeries.length > 0 ? (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={6}>
              {filteredSeries.map((show) => (
                <MovieCard
                  key={show.id}
                  movie={show}
                  onClick={() => navigate(`/movie/${show.id}`)}
                  isInList={watchlist.includes(show.id)}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Center py={20}>
              <Text fontSize="lg" opacity={0.7}>
                No series found
              </Text>
            </Center>
          )}
        </VStack>
      </Container>
    </Box>
  );
};
