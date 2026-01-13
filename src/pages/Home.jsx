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
  useColorMode,
} from '@chakra-ui/react';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';
import { MovieRow } from '../components/MovieRow';
import { FiPlay, FiPlus, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../hooks/useWatchlist';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export const Home = () => {
  const { colorMode } = useColorMode();
  const [movies, setMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
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
        const moviesArray = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setMovies(moviesArray);

        // Featured: highest views
        const sorted = [...moviesArray].sort((a, b) => (b.views || 0) - (a.views || 0));
        setFeaturedMovie(sorted[0] || moviesArray[0]);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = (movie) => {
    if (watchlist.includes(movie.id)) removeFromWatchlist(movie.id);
    else addToWatchlist(movie.id);
  };

  // Categories
  const trending = [...movies].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 12);
  const recentlyAdded = [...movies]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 12);
  const moviesList = movies.filter((m) => m.type === 'movie' || !m.type);
  const seriesList = movies.filter((m) => m.type === 'series');

  const moviesByGenre = movies.reduce((acc, movie) => {
    const genre = movie.genre || 'Other';
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(movie);
    return acc;
  }, {});

  if (loading) {
    return (
      <Center minH="100vh" bg={colorMode === 'dark' ? 'black' : 'white'}>
        <Spinner size="xl" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={colorMode === 'dark' ? 'black' : 'white'} pt={16}>
      {/* Hero Section */}
      {featuredMovie && (
        <MotionBox
          position="relative"
          h={{ base: '70vh', md: '90vh' }}
          w="100%"
          overflow="hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background */}
          <Box position="relative" h="100%" w="100%">
            <Image
              src={featuredMovie.thumbnailUrl}
              alt={featuredMovie.title}
              w="100%"
              h="100%"
              objectFit="cover"
              position="absolute"
              filter="brightness(0.4)"
            />

            {/* Gradients */}
            <Box
              position="absolute"
              inset={0}
              bgGradient={
                colorMode === 'dark'
                  ? 'linear(to-r, black 0%, rgba(0,0,0,0.8) 40%, transparent 70%)'
                  : 'linear(to-r, white 0%, rgba(255,255,255,0.8) 40%, transparent 70%)'
              }
            />
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              h="40%"
              bgGradient={
                colorMode === 'dark'
                  ? 'linear(to-t, black, transparent)'
                  : 'linear(to-t, white, transparent)'
              }
            />
          </Box>

          {/* Content */}
          <Container
            maxW="1920px"
            position="absolute"
            bottom={{ base: '80px', md: '120px' }}
            left={0}
            right={0}
            px={{ base: 6, md: 12 }}
          >
            <MotionBox
              maxW="700px"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <VStack align="flex-start" spacing={5}>
                {/* Badges */}
                <HStack spacing={3} flexWrap="wrap">
                  {featuredMovie.year && <Badge fontSize="sm">{featuredMovie.year}</Badge>}
                  {featuredMovie.rating && <Badge fontSize="sm">{featuredMovie.rating}</Badge>}
                  {featuredMovie.genre && (
                    <Badge fontSize="sm" textTransform="capitalize">
                      {featuredMovie.genre}
                    </Badge>
                  )}
                </HStack>

                {/* Title */}
                <Heading
                  as="h1"
                  size="3xl"
                  fontWeight="black"
                  lineHeight="1.1"
                  letterSpacing="heading"
                  textShadow="0 4px 20px rgba(0,0,0,0.5)"
                >
                  {featuredMovie.title}
                </Heading>

                {/* Description */}
                {featuredMovie.description && (
                  <Text fontSize="lg" noOfLines={3} lineHeight="tall" opacity={0.9}>
                    {featuredMovie.description}
                  </Text>
                )}

                {/* Stats */}
                <HStack spacing={4} fontSize="sm" opacity={0.8}>
                  {featuredMovie.views > 0 && <Text>{featuredMovie.views.toLocaleString()} views</Text>}
                  {featuredMovie.likes > 0 && <Text>{featuredMovie.likes.toLocaleString()} likes</Text>}
                </HStack>

                {/* Actions */}
                <HStack spacing={3} pt={2}>
                  <Button
                    leftIcon={<FiPlay />}
                    size="lg"
                    variant="solid"
                    onClick={() => navigate(`/movie/${featuredMovie.id}`)}
                    fontWeight="bold"
                    px={8}
                  >
                    Play
                  </Button>

                  <Button
                    leftIcon={watchlist.includes(featuredMovie.id) ? <FiCheck /> : <FiPlus />}
                    size="lg"
                    variant="outline"
                    onClick={() => handleWatchlistToggle(featuredMovie)}
                    fontWeight="bold"
                    px={8}
                  >
                    {watchlist.includes(featuredMovie.id) ? 'In Watchlist' : 'Watchlist'}
                  </Button>
                </HStack>
              </VStack>
            </MotionBox>
          </Container>
        </MotionBox>
      )}

      {/* Content Rows */}
      <Container maxW="1920px" pb={16} px={{ base: 4, md: 12 }}>
        {watchlist.length > 0 && (
          <MovieRow
            title="My Watchlist"
            items={movies.filter((m) => watchlist.includes(m.id))}
            onItemClick={(m) => navigate(`/movie/${m.id}`)}
          />
        )}

        <MovieRow title="Trending Now" items={trending} onItemClick={(m) => navigate(`/movie/${m.id}`)} />

        <MovieRow title="Recently Added" items={recentlyAdded} onItemClick={(m) => navigate(`/movie/${m.id}`)} />

        {moviesList.length > 0 && (
          <MovieRow title="Movies" items={moviesList.slice(0, 12)} onItemClick={(m) => navigate(`/movie/${m.id}`)} />
        )}

        {seriesList.length > 0 && (
          <MovieRow title="Series" items={seriesList.slice(0, 12)} onItemClick={(m) => navigate(`/movie/${m.id}`)} />
        )}

        {Object.keys(moviesByGenre)
          .slice(0, 5)
          .map((genre) => (
            <MovieRow
              key={genre}
              title={genre.charAt(0).toUpperCase() + genre.slice(1)}
              items={moviesByGenre[genre].slice(0, 12)}
              onItemClick={(m) => navigate(`/movie/${m.id}`)}
            />
          ))}
      </Container>
    </Box>
  );
};
