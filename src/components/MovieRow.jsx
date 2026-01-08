import { Box, Heading, HStack, Image, Text, Badge, IconButton } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';

export const MovieRow = ({ title, movies, showProgress = false }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    const container = scrollRef.current;
    const scrollAmount = 400;
    
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  if (!movies || movies.length === 0) return null;

  return (
    <Box mb={8} position="relative" px={{ base: 4, md: 8, lg: 16 }}>
      <Heading size="md" mb={4} fontWeight="bold">
        {title}
      </Heading>

      {showLeftArrow && (
        <IconButton
          icon={<AiOutlineLeft />}
          position="absolute"
          left={0}
          top="50%"
          transform="translateY(-50%)"
          zIndex={2}
          bg="rgba(0,0,0,0.8)"
          color="white"
          _hover={{ bg: 'rgba(0,0,0,0.9)' }}
          onClick={() => scroll('left')}
          borderRadius="full"
          size="lg"
          aria-label="Scroll left"
        />
      )}

      <HStack
        ref={scrollRef}
        spacing={2}
        overflowX="auto"
        overflowY="hidden"
        css={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollBehavior: 'smooth',
        }}
        onScroll={handleScroll}
      >
        {movies.map((movie) => (
          <Box
            key={movie.id}
            minW={{ base: '140px', md: '200px', lg: '240px' }}
            h={{ base: '200px', md: '280px', lg: '320px' }}
            position="relative"
            cursor="pointer"
            borderRadius="md"
            overflow="hidden"
            transition="all 0.3s"
            _hover={{
              transform: 'scale(1.1)',
              zIndex: 10,
              boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
            }}
            onClick={() => navigate(`/watch/${movie.id}`)}
          >
            <Image
              src={movie.thumbnailUrl}
              alt={movie.title}
              w="100%"
              h="100%"
              objectFit="cover"
            />

            {showProgress && movie.progress && (
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                h="4px"
                bg="gray.700"
              >
                <Box
                  h="100%"
                  w={`${(movie.progress / (movie.duration || 100)) * 100}%`}
                  bg="brand.primary"
                />
              </Box>
            )}

            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              p={3}
              bg="linear-gradient(to top, rgba(0,0,0,0.9), transparent)"
            >
              <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                {movie.title}
              </Text>
              <HStack spacing={2} mt={1}>
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
      </HStack>

      {showRightArrow && (
        <IconButton
          icon={<AiOutlineRight />}
          position="absolute"
          right={0}
          top="50%"
          transform="translateY(-50%)"
          zIndex={2}
          bg="rgba(0,0,0,0.8)"
          color="white"
          _hover={{ bg: 'rgba(0,0,0,0.9)' }}
          onClick={() => scroll('right')}
          borderRadius="full"
          size="lg"
          aria-label="Scroll right"
        />
      )}
    </Box>
  );
};
