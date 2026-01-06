import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { MovieCard } from './MovieCard';

export const MovieRow = ({ title, movies }) => {
  return (
    <Box mb={12}>
      <Flex justify="space-between" align="center" mb={4} px={2}>
        <Heading size="lg" fontWeight="700">
          {title}
        </Heading>
        <Text color="red.500" fontSize="sm" fontWeight="600" cursor="pointer" _hover={{ color: 'red.400' }}>
          Explore All →
        </Text>
      </Flex>
      
      <Flex
        gap={2}
        overflowX="auto"
        pb={4}
        css={{
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '3px',
          },
        }}
      >
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </Flex>
    </Box>
  );
};
