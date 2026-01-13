import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Text,
  VStack,
  Select,
  HStack,
  Image,
  Heading,
  Badge,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash';

export const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [allMovies, setAllMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    const loadMovies = async () => {
      const moviesRef = ref(db, 'movies');
      const snapshot = await get(moviesRef);
      if (snapshot.exists()) {
        const moviesData = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data,
        }));
        setAllMovies(moviesData);
      }
    };
    loadMovies();
  }, []);

  useEffect(() => {
    let results = [...allMovies];

    if (searchQuery) {
      results = results.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.genre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.cast?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedGenre !== 'all') {
      results = results.filter((movie) => movie.genre === selectedGenre);
    }

    if (selectedYear !== 'all') {
      results = results.filter((movie) => movie.year === parseInt(selectedYear));
    }

    switch (sortBy) {
      case 'newest':
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'views':
        results.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'title':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredMovies(results);
  }, [searchQuery, selectedGenre, selectedYear, sortBy, allMovies]);

  const handleSearch = debounce((value) => {
    setSearchQuery(value);
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  }, 300);

  const years = [...new Set(allMovies.map((m) => m.year))].sort((a, b) => b - a);

  return (
    <Box minH="100vh" pt={24} pb={12} bg="brand.background">
      <Container maxW="1400px">
        <VStack spacing={6} align="stretch">
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search for movies, shows, genres..."
              defaultValue={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              bg="brand.cardBg"
              border="1px solid"
              borderColor="gray.700"
              _focus={{ borderColor: 'brand.primary' }}
              fontSize="lg"
            />
          </InputGroup>

          <HStack spacing={4} flexWrap="wrap">
            <Select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              bg="brand.cardBg"
              maxW="200px"
            >
              <option value="all">All Genres</option>
              <option value="action">Action</option>
              <option value="comedy">Comedy</option>
              <option value="drama">Drama</option>
              <option value="horror">Horror</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="thriller">Thriller</option>
              <option value="romance">Romance</option>
              <option value="documentary">Documentary</option>
              <option value="animation">Animation</option>
            </Select>

            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              bg="brand.cardBg"
              maxW="150px"
            >
              <option value="all">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>

            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              bg="brand.cardBg"
              maxW="200px"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="views">Most Viewed</option>
              <option value="title">Title (A-Z)</option>
            </Select>
          </HStack>

          <Text color="gray.400">
            {filteredMovies.length} result{filteredMovies.length !== 1 ? 's' : ''} found
          </Text>

          {filteredMovies.length > 0 ? (
            <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
              {filteredMovies.map((movie) => (
                <Box
                  key={movie.id}
                  cursor="pointer"
                  onClick={() => navigate(`/watch/${movie.id}`)}
                  borderRadius="lg"
                  overflow="hidden"
                  transition="all 0.3s"
                  _hover={{
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 30px rgba(229, 9, 20, 0.4)',
                  }}
                >
                  <Image
                    src={movie.thumbnailUrl}
                    alt={movie.title}
                    w="100%"
                    h="280px"
                    objectFit="cover"
                  />
                  <Box p={3} bg="brand.cardBg">
                    <Text fontWeight="bold" noOfLines={1} mb={2}>
                      {movie.title}
                    </Text>
                    <HStack spacing={2}>
                      <Badge colorScheme="red" fontSize="xs">
                        {movie.genre}
                      </Badge>
                      <Text fontSize="xs" color="gray.400">
                        {movie.year}
                      </Text>
                    </HStack>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Box textAlign="center" py={20}>
              <Heading size="lg" mb={2}>
                No results found
              </Heading>
              <Text color="gray.400">
                Try adjusting your search or filters
              </Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};
