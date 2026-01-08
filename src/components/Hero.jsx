import { Box, Button, HStack, Text, VStack, Badge } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { AiFillPlayCircle, AiFillInfoCircle, AiOutlinePlus } from 'react-icons/ai';
import { useAuth } from '../hooks/useAuth';

export const Hero = ({ movie }) => {
  const navigate = useNavigate();
  const { user, addToFavorites } = useAuth();

  if (!movie) return null;

  const handleAddToList = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    await addToFavorites(movie.id);
  };

  return (
    <Box
      position="relative"
      h="80vh"
      bgImage={`url(${movie.thumbnailUrl})`}
      bgSize="cover"
      bgPosition="center"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%), linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)',
      }}
    >
      <Box
        position="absolute"
        bottom="100px"
        left="0"
        right="0"
        px={{ base: 4, md: 8, lg: 16 }}
        maxW="1400px"
        mx="auto"
      >
        <VStack align="start" spacing={4} maxW="600px">
          <Text
            fontSize={{ base: '3xl', md: '5xl', lg: '6xl' }}
            fontWeight="900"
            lineHeight="1.1"
            textShadow="2px 2px 4px rgba(0,0,0,0.8)"
          >
            {movie.title}
          </Text>

          <HStack spacing={3}>
            <Badge colorScheme="green" fontSize="sm" px={2} py={1}>
              {movie.year}
            </Badge>
            <Text fontSize="sm" fontWeight="bold" textTransform="uppercase">
              {movie.genre}
            </Text>
            <Text fontSize="sm">
              {movie.views || 0} views
            </Text>
          </HStack>

          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            lineHeight="1.6"
            noOfLines={3}
            textShadow="1px 1px 2px rgba(0,0,0,0.8)"
          >
            {movie.description}
          </Text>

          <HStack spacing={4} mt={4}>
            <Button
              leftIcon={<AiFillPlayCircle size={24} />}
              size="lg"
              bg="white"
              color="black"
              _hover={{ bg: 'gray.200' }}
              fontWeight="bold"
              px={8}
              onClick={() => navigate(`/watch/${movie.id}`)}
            >
              Play
            </Button>
            
            <Button
              leftIcon={<AiFillInfoCircle size={24} />}
              size="lg"
              bg="rgba(109,109,110,0.7)"
              color="white"
              _hover={{ bg: 'rgba(109,109,110,0.4)' }}
              fontWeight="bold"
              px={8}
              onClick={() => navigate(`/watch/${movie.id}`)}
            >
              More Info
            </Button>

            <Button
              leftIcon={<AiOutlinePlus size={24} />}
              size="lg"
              bg="transparent"
              border="2px solid white"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              onClick={handleAddToList}
            >
              My List
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};
