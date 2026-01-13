import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  VStack,
  Badge,
  Button,
  Spinner,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';
import { CustomVideoPlayer } from '../components/CustomVideoPlayer';
import { FiArrowLeft, FiCalendar, FiUser, FiFilm } from 'react-icons/fi';

export const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const bg = useColorModeValue('white', 'black');
  const cardBg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const movieRef = ref(db, `movies/${id}`);
        const snapshot = await get(movieRef);
        
        if (snapshot.exists()) {
          setMovie({ id, ...snapshot.val() });
        } else {
          console.error('Movie not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id, navigate]);

  if (loading) {
    return (
      <Center minH="100vh" bg={bg}>
        <Spinner size="xl" thickness="4px" />
      </Center>
    );
  }

  if (!movie) {
    return (
      <Center minH="100vh" bg={bg}>
        <Text>Movie not found</Text>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={bg} pt={20}>
      <Container maxW="1400px" px={6} py={8}>
        {/* Back Button */}
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          onClick={() => navigate(-1)}
          mb={6}
          _hover={{ bg: useColorModeValue('gray.100', 'gray.900') }}
        >
          Back
        </Button>

        {/* Video Player */}
        <Box mb={8}>
          <CustomVideoPlayer
            videoUrl={movie.videoUrl}
            videoSource={movie.videoSource}
            title={movie.title}
          />
        </Box>

        {/* Movie Info */}
        <Box
          bg={cardBg}
          p={8}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderColor}
        >
          <VStack align="stretch" spacing={6}>
            {/* Title and Genre */}
            <Box>
              <HStack spacing={3} mb={3}>
                <Heading size="2xl" fontFamily="CustomLogo">
                  {movie.title}
                </Heading>
                {movie.year && (
                  <Badge
                    fontSize="lg"
                    px={3}
                    py={1}
                    borderRadius="md"
                    variant="outline"
                  >
                    {movie.year}
                  </Badge>
                )}
              </HStack>

              <HStack spacing={2}>
                <Badge
                  colorScheme="gray"
                  fontSize="md"
                  px={3}
                  py={1}
                  borderRadius="md"
                  textTransform="capitalize"
                >
                  {movie.genre}
                </Badge>
              </HStack>
            </Box>

            {/* Description */}
            {movie.description && (
              <Box>
                <Heading size="md" mb={3}>
                  Synopsis
                </Heading>
                <Text color={textColor} fontSize="lg" lineHeight="tall">
                  {movie.description}
                </Text>
              </Box>
            )}

            {/* Cast and Director */}
            <HStack spacing={8} flexWrap="wrap">
              {movie.director && (
                <Box>
                  <HStack spacing={2} mb={2}>
                    <FiUser />
                    <Text fontWeight="bold" fontSize="sm" textTransform="uppercase">
                      Director
                    </Text>
                  </HStack>
                  <Text color={textColor}>{movie.director}</Text>
                </Box>
              )}

              {movie.cast && (
                <Box flex={1}>
                  <HStack spacing={2} mb={2}>
                    <FiFilm />
                    <Text fontWeight="bold" fontSize="sm" textTransform="uppercase">
                      Cast
                    </Text>
                  </HStack>
                  <Text color={textColor}>{movie.cast}</Text>
                </Box>
              )}
            </HStack>

            {/* Metadata */}
            <HStack
              spacing={6}
              pt={4}
              borderTop="1px solid"
              borderColor={borderColor}
              color={textColor}
              fontSize="sm"
            >
              <HStack spacing={2}>
                <FiCalendar />
                <Text>
                  Added: {new Date(movie.createdAt).toLocaleDateString()}
                </Text>
              </HStack>

              {movie.views !== undefined && (
                <Text>👁 {movie.views} views</Text>
              )}

              {movie.videoSource && (
                <Badge variant="outline" textTransform="capitalize">
                  {movie.videoSource === 'archive' ? '📚 Archive.org' :
                   movie.videoSource === 'googledrive' ? '🔗 Google Drive' :
                   movie.videoSource === 'cloudinary' ? '☁️ Cloudinary' :
                   movie.videoSource}
                </Badge>
              )}
            </HStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};
