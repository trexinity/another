import { Box, Heading, HStack, IconButton, useColorModeValue } from '@chakra-ui/react';
import { MovieCard } from './MovieCard';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useRef } from 'react';

export const MovieRow = ({ title, movies, onAddToList, myList = [] }) => {
  const scrollRef = useRef(null);
  const textColor = useColorModeValue('gray.800', 'white');

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <Box mb={8} position="relative">
      {/* Title */}
      <Heading size="lg" mb={4} pl={6} color={textColor} fontWeight="bold">
        {title}
      </Heading>

      {/* Scroll Buttons */}
      <IconButton
        icon={<FiChevronLeft />}
        position="absolute"
        left={0}
        top="50%"
        transform="translateY(-50%)"
        zIndex={2}
        onClick={() => scroll('left')}
        variant="ghost"
        size="lg"
        display={{ base: 'none', md: 'flex' }}
        _hover={{ bg: 'blackAlpha.600' }}
        aria-label="Scroll left"
      />

      <IconButton
        icon={<FiChevronRight />}
        position="absolute"
        right={0}
        top="50%"
        transform="translateY(-50%)"
        zIndex={2}
        onClick={() => scroll('right')}
        variant="ghost"
        size="lg"
        display={{ base: 'none', md: 'flex' }}
        _hover={{ bg: 'blackAlpha.600' }}
        aria-label="Scroll right"
      />

      {/* Movies Container */}
      <HStack
        ref={scrollRef}
        spacing={4}
        overflowX="auto"
        overflowY="hidden"
        px={6}
        py={2}
        css={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
        }}
      >
        {movies.map((movie) => (
          <Box key={movie.id} minW="250px" maxW="250px">
            <MovieCard
              movie={movie}
              onAddToList={onAddToList}
              isInList={myList.includes(movie.id)}
            />
          </Box>
        ))}
      </HStack>
    </Box>
  );
};
