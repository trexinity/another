import { Box, Image, Text, Flex, IconButton } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MotionBox = motion(Box);

export const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  return (
    <MotionBox
      minW="300px"
      h="170px"
      borderRadius="md"
      overflow="hidden"
      cursor="pointer"
      position="relative"
      bg="gray.800"
      whileHover={{ scale: 1.5, zIndex: 999 }}
      transition={{ duration: 0.3 }}
      onClick={() => navigate(`/watch/${movie.id}`)}
    >
      <Image
        src={movie.thumbnail}
        alt={movie.title}
        w="100%"
        h="100%"
        objectFit="cover"
      />
      
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        p={3}
        bg="linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%)"
        opacity={0}
        _groupHover={{ opacity: 1 }}
        transition="opacity 0.3s"
      >
        <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
          {movie.title}
        </Text>
        <Flex gap={2} fontSize="xs" color="gray.400" mt={1}>
          <Text color="green.400" fontWeight="bold">{movie.match || 95}%</Text>
          <Text>{movie.duration}</Text>
          <Text>👁️ {movie.views || 0}</Text>
        </Flex>
      </Box>
    </MotionBox>
  );
};
