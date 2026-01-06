import { Box, Container, Grid, Spinner, Center, Heading } from '@chakra-ui/react';
import { Navbar } from '../components/Navbar';
import { MovieCard } from '../components/MovieCard';
import { useMovies } from '../hooks/useMovies';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const Browse = () => {
  const { movies, loading, searchMovies } = useMovies();
  const [searchParams] = useSearchParams();
  const [displayMovies, setDisplayMovies] = useState([]);
  
  const query = searchParams.get('q');

  useEffect(() => {
    if (query) {
      searchMovies(query).then(setDisplayMovies);
    } else {
      setDisplayMovies(movies);
    }
  }, [query, movies]);

  if (loading) {
    return (
      <Center h="100vh" bg="gray.900">
        <Spinner size="xl" color="red.500" />
      </Center>
    );
  }

  return (
    <Box bg="gray.900" minH="100vh" color="white">
      <Navbar />
      
      <Container maxW="1920px" pt="100px" px={8} pb={12}>
        <Heading size="xl" mb={8}>
          {query ? `Search Results for "${query}"` : 'Browse All Movies'}
        </Heading>
        
        <Grid
          templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
          gap={4}
        >
          {displayMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
