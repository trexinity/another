import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Spinner,
  Center,
  Image,
  Badge,
  Tabs,
  TabList,
  Tab,
} from '@chakra-ui/react';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';
import { MovieRow } from '../components/MovieRow';
import { FiPlay, FiPlus, FiInfo } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../hooks/useWatchlist';

export const Home = () => {
  const [movies, setMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const navigate = useNavigate();
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  useEffect(() => {
    fetchMovies();
  }, []);

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
        
        if (moviesArray.length > 0) {
          const randomMovie = moviesArray[Math.floor(Math.random() * moviesArray.length)];
          setFeaturedMovie(randomMovie);
        }
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = (movie) => {
    if (watchlist.includes(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie.id);
    }
  };

  // Categorize content
  const continueWatching = movies.filter(m => m.progress > 0);
  const primeOriginals = movies.filter(m => m.isPrimeOriginal);
  const movies_ = movies.filter(m => m.type === 'movie' || !m.type);
  const tvShows = movies.filter(m => m.type === 'series');
  const trending = [...movies].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  const recentlyAdded = [...movies].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

  // Group by genre
  const moviesByGenre = movies.reduce((acc, movie) => {
    const genre = movie.genre || 'Other';
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(movie);
    return acc;
  }, {});

  if (loading) {
    return (
      <Center minH="100vh" bg="#0F171E">
        <Spinner size="xl" thickness="4px" color="#00A8E1" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="#0F171E" pt={16}>
      {/* Hero Banner - Amazon Prime Style */}
      {featuredMovie && (
        <Box
          position="relative"
          h={{ base: '60vh', md: '85vh' }}
          w="100%"
          overflow="hidden"
          mb={0}
        >
          {/* Background Image with Gradient */}
          <Box position="relative" h="100%" w="100%">
            <Image
              src={featuredMovie.thumbnailUrl}
              alt={featuredMovie.title}
              w="100%"
              h="100%"
              objectFit="cover"
              position="absolute"
              top={0}
              left={0}
            />
            
            {/* Multi-layer Gradient Overlay */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgGradient="linear(to-r, #0F171E 0%, rgba(15,23,30,0.8) 40%, transparent 70%)"
            />
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              h="300px"
              bgGradient="linear(to-t, #0F171E 0%, transparent 100%)"
            />
          </Box>

          {/* Content */}
          <Container
            maxW="1920px"
            position="absolute"
            bottom={{ base: '60px', md: '100px' }}
            left={0}
            right={0}
            px={{ base: 6, md: 12 }}
          >
            <VStack align="flex-start" spacing={4} maxW="700px">
              {/* Prime Original Badge */}
              {featuredMovie.isPrimeOriginal && (
                <HStack spacing={2}>
                  <Box w="80px" h="20px" bg="#00A8E1" display="flex" alignItems="center" justifyContent="center">
                    <Text fontSize="10px" fontWeight="bold" color="white">prime</Text>
                  </Box>
                  <Text fontSize="sm" color="white" fontWeight="bold">ORIGINAL</Text>
                </HStack>
              )}

              {/* Title */}
              <Heading
                size="3xl"
                fontWeight="black"
                lineHeight="1.1"
                color="white"
                fontFamily="HeadingFont"
                textShadow="2px 2px 20px rgba(0,0,0,0.8)"
              >
                {featuredMovie.title}
              </Heading>

              {/* Meta Info */}
              <HStack spacing={4} fontSize="sm" color="gray.300">
                {featuredMovie.year && <Text fontWeight="bold">{featuredMovie.year}</Text>}
                {featuredMovie.rating && (
                  <HStack spacing={1}>
                    <Badge bg="rgba(255,255,255,0.2)" color="white">{featuredMovie.rating}</Badge>
                  </HStack>
                )}
                {featuredMovie.duration && <Text>{featuredMovie.duration}</Text>}
                {featuredMovie.genre && <Text textTransform="capitalize">{featuredMovie.genre}</Text>}
              </HStack>

              {/* Description */}
              <Text
                fontSize="lg"
                noOfLines={3}
                color="gray.200"
                lineHeight="1.6"
              >
                {featuredMovie.description}
              </Text>

              {/* Action Buttons */}
              <HStack spacing={4} pt={2}>
                <Button
                  leftIcon={<FiPlay />}
                  size="lg"
                  bg="white"
                  color="black"
                  _hover={{ bg: 'gray.200', transform: 'scale(1.05)' }}
                  onClick={() => navigate(`/movie/${featuredMovie.id}`)}
                  fontWeight="bold"
                  px={8}
                >
                  Play Now
                </Button>

                <Button
                  leftIcon={watchlist.includes(featuredMovie.id) ? <FiInfo /> : <FiPlus />}
                  size="lg"
                  variant="outline"
                  borderColor="white"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200', transform: 'scale(1.05)' }}
                  onClick={() => handleWatchlistToggle(featuredMovie)}
                  fontWeight="bold"
                  px={8}
                >
                  {watchlist.includes(featuredMovie.id) ? 'View Details' : 'Add to Watchlist'}
                </Button>
              </HStack>
            </VStack>
          </Container>
        </Box>
      )}

      {/* Category Tabs */}
      <Box bg="#0F171E" py={4} position="sticky" top="60px" zIndex={100} borderBottom="1px solid" borderColor="rgba(255,255,255,0.1)">
        <Container maxW="1920px" px={{ base: 6, md: 12 }}>
          <Tabs variant="unstyled" index={selectedTab} onChange={setSelectedTab}>
            <TabList>
              {['All', 'Movies', 'TV Shows', 'Sports', 'Live TV'].map((tab, index) => (
                <Tab
                  key={tab}
                  color="gray.400"
                  _selected={{ color: 'white', borderBottom: '3px solid #00A8E1' }}
                  _hover={{ color: 'white' }}
                  fontWeight="600"
                  fontSize="md"
                  pb={3}
                >
                  {tab}
                </Tab>
              ))}
            </TabList>
          </Tabs>
        </Container>
      </Box>

      {/* Content Rows */}
      <Container maxW="1920px" pb={12} px={{ base: 4, md: 12 }}>
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <MovieRow
            title="Continue Watching"
            movies={continueWatching}
            onAddToList={handleWatchlistToggle}
            myList={watchlist}
          />
        )}

        {/* My Watchlist */}
        {watchlist.length > 0 && (
          <MovieRow
            title="My Watchlist"
            movies={movies.filter(m => watchlist.includes(m.id))}
            onAddToList={handleWatchlistToggle}
            myList={watchlist}
          />
        )}

        {/* Prime Originals */}
        {primeOriginals.length > 0 && (
          <MovieRow
            title="Prime Originals"
            movies={primeOriginals}
            onAddToList={handleWatchlistToggle}
            myList={watchlist}
          />
        )}

        {/* Trending */}
        <MovieRow
          title="Trending Now"
          movies={trending}
          onAddToList={handleWatchlistToggle}
          myList={watchlist}
        />

        {/* Recently Added */}
        <MovieRow
          title="Recently Added"
          movies={recentlyAdded}
          onAddToList={handleWatchlistToggle}
          myList={watchlist}
        />

        {/* Genre Rows */}
        {Object.keys(moviesByGenre).map((genre) => (
          <MovieRow
            key={genre}
            title={genre.charAt(0).toUpperCase() + genre.slice(1)}
            movies={moviesByGenre[genre]}
            onAddToList={handleWatchlistToggle}
            myList={watchlist}
          />
        ))}

        {/* Recommended for You */}
        <MovieRow
          title="Recommended for You"
          movies={movies.slice(0, 10)}
          onAddToList={handleWatchlistToggle}
          myList={watchlist}
        />
      </Container>
    </Box>
  );
};
