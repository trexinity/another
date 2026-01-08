import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Text,
  HStack,
  VStack,
  IconButton,
  useToast,
  Spinner,
  Container,
} from '@chakra-ui/react';
import ReactPlayer from 'react-player';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { ref, get, update, increment } from 'firebase/database';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';

export const Watch = () => {
  const { id } = useParams(); // Get movie ID from URL
  const navigate = useNavigate();
  const { user, addToFavorites, removeFromFavorites } = useAuth();
  const toast = useToast();

  // State management
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Load movie data when page loads
  useEffect(() => {
    const loadMovie = async () => {
      try {
        const movieRef = ref(db, `movies/${id}`);
        const snapshot = await get(movieRef);

        if (snapshot.exists()) {
          const movieData = { id, ...snapshot.val() };
          setMovie(movieData);

          // Check if this movie is in user's favorites
          if (user && user.favorites) {
            setIsFavorite(user.favorites.includes(id));
          }

          // Load watch progress if user was watching before
          if (user) {
            const progressRef = ref(db, `users/${user.uid}/watchProgress/${id}`);
            const progressSnapshot = await get(progressRef);
            if (progressSnapshot.exists()) {
              setWatchProgress(progressSnapshot.val().progress || 0);
            }
          }
        } else {
          toast({
            title: 'Movie not found',
            status: 'error',
            duration: 3000,
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading movie:', error);
        toast({
          title: 'Error loading video',
          description: error.message,
          status: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id, user, navigate, toast]);

  // Track view count (only once per session)
  const trackView = async () => {
    if (hasTrackedView || !movie) return;

    try {
      const viewsRef = ref(db, `movies/${id}/views`);
      await update(ref(db, `movies/${id}`), {
        views: increment(1)
      });

      setHasTrackedView(true);

      // Add to user's watch history
      if (user) {
        const historyRef = ref(db, `users/${user.uid}/watchHistory/${id}`);
        await update(historyRef, {
          watchedAt: new Date().toISOString(),
          title: movie.title,
          thumbnailUrl: movie.thumbnailUrl,
        });
      }
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  // Save watch progress (where user paused/stopped)
  const saveProgress = async (progress) => {
    if (!user || !movie) return;

    try {
      const progressRef = ref(db, `users/${user.uid}/watchProgress/${id}`);
      await update(progressRef, {
        progress, // Progress in seconds
        lastWatchedAt: new Date().toISOString(),
        title: movie.title,
        thumbnailUrl: movie.thumbnailUrl,
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Called when video progresses
  const handleProgress = (state) => {
    const currentTime = state.playedSeconds;
    
    // Track view after 10 seconds of watching
    if (currentTime > 10 && !hasTrackedView) {
      trackView();
    }

    // Save progress every 10 seconds
    if (Math.floor(currentTime) % 10 === 0) {
      saveProgress(currentTime);
    }
  };

  // Toggle favorite
  const handleFavoriteToggle = async () => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'Sign in to add favorites',
        status: 'warning',
        duration: 3000,
      });
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await removeFromFavorites(id);
        setIsFavorite(false);
        toast({
          title: 'Removed from favorites',
          status: 'info',
          duration: 2000,
        });
      } else {
        await addToFavorites(id);
        setIsFavorite(true);
        toast({
          title: 'Added to favorites',
          status: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Format duration (seconds to minutes)
  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.primary" thickness="4px" />
          <Text>Loading video...</Text>
        </VStack>
      </Box>
    );
  }

  if (!movie) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Text>Video not found</Text>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="brand.background">
      {/* Video Player */}
      <Box position="relative" bg="black">
        <ReactPlayer
          url={movie.videoUrl}
          width="100%"
          height="100vh"
          playing={playing}
          controls={true}
          onProgress={handleProgress}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload', // Disable download button
              },
            },
          }}
          // Start from saved progress
          onReady={(player) => {
            if (watchProgress > 0) {
              player.seekTo(watchProgress, 'seconds');
            }
          }}
        />

        {/* Back Button Overlay */}
        <IconButton
          icon={<ArrowBackIcon />}
          position="absolute"
          top={4}
          left={4}
          onClick={() => navigate('/')}
          bg="rgba(0,0,0,0.6)"
          color="white"
          _hover={{ bg: 'rgba(0,0,0,0.8)' }}
          size="lg"
          borderRadius="full"
          aria-label="Go back"
        />
      </Box>

      {/* Movie Details */}
      <Container maxW="1400px" py={8}>
        <HStack justify="space-between" align="start" mb={6}>
          <VStack align="start" spacing={3} flex={1}>
            <Heading size="2xl" color="brand.text">
              {movie.title}
            </Heading>

            <HStack spacing={4} color="brand.textGray">
              <Text>{movie.year}</Text>
              <Text>•</Text>
              <Text textTransform="capitalize">{movie.genre}</Text>
              <Text>•</Text>
              <Text>{formatDuration(movie.duration)}</Text>
              <Text>•</Text>
              <Text>{movie.views || 0} views</Text>
            </HStack>

            {movie.cast && (
              <Text color="brand.textGray">
                <Text as="span" fontWeight="bold">Cast:</Text> {movie.cast}
              </Text>
            )}

            {movie.director && (
              <Text color="brand.textGray">
                <Text as="span" fontWeight="bold">Director:</Text> {movie.director}
              </Text>
            )}
          </VStack>

          {/* Favorite Button */}
          <IconButton
            icon={isFavorite ? <AiFillHeart /> : <AiOutlineHeart />}
            onClick={handleFavoriteToggle}
            colorScheme={isFavorite ? 'red' : 'gray'}
            size="lg"
            fontSize="2xl"
            aria-label="Add to favorites"
          />
        </HStack>

        {/* Description */}
        <Box
          p={6}
          bg="brand.cardBg"
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.700"
        >
          <Text fontSize="lg" lineHeight="1.8">
            {movie.description}
          </Text>
        </Box>
      </Container>
    </Box>
  );
};
