import { Box, Flex, Heading, Text, Button, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MotionBox = motion(Box);

export const Hero = ({ movie }) => {
  const navigate = useNavigate();

  if (!movie) return null;

  return (
    <Box
      position="relative"
      h="85vh"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgImage={`url(${movie.banner || movie.thumbnail})`}
        bgSize="cover"
        bgPosition="center"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: 'linear-gradient(90deg, rgba(0,0,0,0.95) 0%, transparent 50%, rgba(0,0,0,0.7) 100%)',
        }}
        _after={{
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          h: '180px',
          bg: 'linear-gradient(0deg, #141414 0%, transparent 100%)',
        }}
      />

      <MotionBox
        position="relative"
        zIndex={2}
        maxW="650px"
        pt="20vh"
        px={8}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <Badge colorScheme="red" mb={4} px={3} py={1} fontSize="xs" fontWeight="bold">
          ⚡ FEATURED TODAY
        </Badge>

        <Heading
          fontSize={{ base: '4xl', md: '6xl' }}
          fontWeight="900"
          lineHeight="1.1"
          mb={4}
          textShadow="3px 3px 12px rgba(0,0,0,0.9)"
        >
          {movie.title}
        </Heading>

        <Flex gap={3} mb={4} flexWrap="wrap" fontSize={{ base: 'sm', md: 'md' }}>
          <Text color="green.400" fontWeight="bold">{movie.match || 95}% Match</Text>
          <Text>{movie.year}</Text>
          <Badge variant="outline" colorScheme="gray">{movie.rating || 'PG-13'}</Badge>
          <Text>{movie.duration || '2h'}</Text>
        </Flex>

        <Text
          fontSize={{ base: 'md', md: 'lg' }}
          lineHeight="1.6"
          mb={6}
          noOfLines={3}
          textShadow="2px 2px 6px rgba(0,0,0,0.9)"
        >
          {movie.description || 'Watch now on Another'}
        </Text>

        <Flex gap={3} flexWrap="wrap">
          <Button
            size="lg"
            bg="white"
            color="black"
            leftIcon={<>▶</>}
            _hover={{ bg: 'gray.200', transform: 'scale(1.05)' }}
            onClick={() => navigate(`/watch/${movie.id}`)}
          >
            Play Now
          </Button>
          <Button
            size="lg"
            bg="rgba(109,109,110,0.8)"
            color="white"
            leftIcon={<>ⓘ</>}
            _hover={{ bg: 'rgba(109,109,110,0.5)' }}
            onClick={() => navigate(`/browse`)}
          >
            More Info
          </Button>
        </Flex>
      </MotionBox>
    </Box>
  );
};
