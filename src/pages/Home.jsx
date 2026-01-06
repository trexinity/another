import { Box, Container, Spinner, Center } from '@chakra-ui/react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { MovieRow } from '../components/MovieRow';
import { useMovies } from '../hooks/useMovies';

export const Home = () => {
  const { movies, loading } = useMovies();

  if (loading) {
    return (
      <Center h="100vh" bg="gray.900">
        <Spinner size="xl" color="red.500" />
      </Center>
    );
  }

  const featured = movies[0];
  const trending = [...movies].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 20);
  const newReleases = [...movies].sort((a, b) => b.year - a.year).slice(0, 20);
  const popular = [...movies].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 20);

  return (
    <Box bg="gray.900" minH="100vh" color="white">
      <Navbar />
      <Hero movie={featured} />
      
      <Container maxW="1920px" px={8} mt="-140px" position="relative" zIndex={3}>
        <MovieRow title="Trending Now" movies={trending} />
        <MovieRow title="New Releases" movies={newReleases} />
        <MovieRow title="Popular on Another" movies={popular} />
      </Container>
    </Box>
  );
};
