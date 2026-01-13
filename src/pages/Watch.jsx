import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { db } from '../config/firebase';
import { CustomVideoPlayer } from '../components/CustomVideoPlayer';
import { FiThumbsUp, FiShare2 } from 'react-icons/fi';
import { BiArrowBack } from 'react-icons/bi';

export const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const loadMovie = async () => {
      try {
        const movieRef = ref(db, `movies/${id}`);
        const snapshot = await get(movieRef);
        
        if (snapshot.exists()) {
          const movieData = { id, ...snapshot.val() };
          setMovie(movieData);
          
          // Increment view count
          await update(movieRef, {
            views: (movieData.views || 0) + 1,
          });
        } else {
          console.error('Movie not found');
        }
      } catch (error) {
        console.error('Error loading movie:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  const handleLike = async () => {
    if (!movie) return;
    
    try {
      const movieRef = ref(db, `movies/${id}`);
      const newLikes = liked ? (movie.likes || 0) - 1 : (movie.likes || 0) + 1;
      
      await update(movieRef, {
        likes: Math.max(0, newLikes),
      });
      
      setMovie({ ...movie, likes: newLikes });
      setLiked(!liked);
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: movie.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Center h="100vh" bg="black">
        <Spinner size="xl" color="red.600" thickness="4px" />
      </Center>
    );
  }

  if (!movie) {
    return (
      <Center h="100vh" bg="black" flexDirection="column">
        <Text fontSize="2xl" color="white" mb={4}>
          Movie not found
        </Text>
        <Button
          bg="red.600"
          color="white"
          _hover={{ bg: 'red.700' }}
          onClick={() => navigate('/')}
        >
          Go Home
        </Button>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="black" pt={16}>
      {/* Back Button */}
      <Container maxW="container.xl" px={4}>
        <Button
          leftIcon={<BiArrowBack />}
          variant="ghost"
          color="white"
          _hover={{ bg: 'gray.800' }}
          onClick={() => navigate(-1)}
          mb={4}
        >
          Back
        </Button>
      </Container>

      {/* Video Player */}
      <Box w="100%" bg="black">
        <Container maxW="container.xl" px={4}>
          <CustomVideoPlayer
            videoUrl={movie.videoUrl}
            videoSource={movie.videoSource || 'cloudinary'}
            title={movie.title}
          />
        </Container>
      </Box>

      {/* Movie Info */}
      <Container maxW="container.xl" px={4} py={8}>
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between" align="start" flexWrap="wrap">
            <VStack align="start" spacing={2} flex={1}>
              <Heading color="white" size="2xl">
                {movie.title}
              </Heading>
              
              <HStack spacing={4} flexWrap="wrap">
                <Badge colorScheme="red" fontSize="md" px={3} py={1}>
                  {movie.genre}
                </Badge>
                {movie.year && (
                  <Text color="gray.400" fontSize="lg">
                    {movie.year}
                  </Text>
                )}
                {movie.views > 0 && (
                  <Text color="gray.400" fontSize="sm">
                    {movie.views.toLocaleString()} views
                  </Text>
                )}
              </HStack>
            </VStack>

            <HStack spacing={3}>
              <Button
                leftIcon={<FiThumbsUp />}
                colorScheme={liked ? 'red' : 'gray'}
                variant={liked ? 'solid' : 'outline'}
                onClick={handleLike}
              >
                {movie.likes || 0}
              </Button>
              <Button
                leftIcon={<FiShare2 />}
                variant="outline"
                colorScheme="gray"
                onClick={handleShare}
              >
                Share
              </Button>
            </HStack>
          </HStack>

          <Text color="gray.300" fontSize="lg" lineHeight="tall">
            {movie.description}
          </Text>

          {(movie.cast || movie.director) && (
            <VStack align="stretch" spacing={3}>
              {movie.cast && (
                <Box>
                  <Text color="gray.500" fontSize="sm" mb={1}>
                    Cast
                  </Text>
                  <Text color="white" fontSize="md">
                    {movie.cast}
                  </Text>
                </Box>
              )}
              
              {movie.director && (
                <Box>
                  <Text color="gray.500" fontSize="sm" mb={1}>
                    Director
                  </Text>
                  <Text color="white" fontSize="md">
                    {movie.director}
                  </Text>
                </Box>
              )}
            </VStack>
          )}
        </VStack>
      </Container>
    </Box>
  );
};
