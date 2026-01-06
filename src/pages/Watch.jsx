import { Box, Container, Heading, Text, Flex, Button, Spinner, Center } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovies } from '../hooks/useMovies';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { trackView } from '../config/firebase';
import { Navbar } from '../components/Navbar';

export const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { movies, loading, trackView: trackApiView } = useMovies();
  const { user } = useAuth();

  const movie = movies.find(m => m.id === id);

  useEffect(() => {
    if (movie && user) {
      trackView(user.uid, movie.id, movie);
      trackApiView(movie.id);
    }
  }, [movie, user]);

  if (loading) {
    return (
      <Center h="100vh" bg="gray.900">
        <Spinner size="xl" color="red.500" />
      </Center>
    );
  }

  if (!movie) {
    return (
      <Center h="100vh" bg="gray.900" flexDir="column" gap={4}>
        <Text fontSize="2xl">Movie not found</Text>
        <Button colorScheme="red" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Center>
    );
  }

  return (
    <Box bg="gray.900" minH="100vh" color="white">
      <Navbar />
      
      <Box pt="68px">
        <Box
          position="relative"
          w="100%"
          paddingTop="56.25%"
          bg="black"
        >
          <Box
            as="iframe"
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            src={movie.videoUrl}
            allowFullScreen
            allow="autoplay"
          />
        </Box>

        <Container maxW="1400px" py={8}>
          <Heading size="2xl" mb={4}>
            {movie.title}
          </Heading>

          <Flex gap={4} mb={6} flexWrap="wrap">
            <Text color="green.400" fontWeight="bold">{movie.match || 95}% Match</Text>
            <Text>{movie.year}</Text>
            <Text>{movie.rating}</Text>
            <Text>{movie.duration}</Text>
          </Flex>

          <Text fontSize="lg" lineHeight="1.8" color="gray.300" mb={8}>
            {movie.description}
          </Text>

          <Flex gap={4} mb={8}>
            <Box>
              <Text fontSize="sm" color="gray.400">Views</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.400">
                {movie.views || 0}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.400">Likes</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.400">
                {movie.likes || 0}
              </Text>
            </Box>
          </Flex>

          <Flex gap={3}>
            <Button colorScheme="red" leftIcon={<>👍</>}>
              Like
            </Button>
            <Button variant="outline" colorScheme="gray" leftIcon={<>+</>}>
              My List
            </Button>
            <Button variant="outline" colorScheme="gray" leftIcon={<>↗</>}>
              Share
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};
