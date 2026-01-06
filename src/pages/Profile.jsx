import { Box, Container, Heading, Avatar, Text, Flex, Grid, Spinner, Center } from '@chakra-ui/react';
import { Navbar } from '../components/Navbar';
import { MovieCard } from '../components/MovieCard';
import { useAuth } from '../hooks/useAuth';
import { useMovies } from '../hooks/useMovies';
import { getWatchHistory } from '../config/firebase';
import { useEffect, useState } from 'react';

export const Profile = () => {
  const { user } = useAuth();
  const { movies } = useMovies();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getWatchHistory(user.uid).then((data) => {
        setHistory(data);
        setLoading(false);
      });
    }
  }, [user]);

  const historyMovies = history.map(h => movies.find(m => m.id === h.movieId)).filter(Boolean);

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
      
      <Container maxW="1400px" pt="100px" px={8} pb={12}>
        <Flex align="center" gap={6} mb={12}>
          <Avatar size="2xl" src={user?.photoURL} name={user?.displayName} />
          <Box>
            <Heading size="2xl" mb={2}>{user?.displayName}</Heading>
            <Text color="gray.400">{user?.email}</Text>
          </Box>
        </Flex>

        <Heading size="lg" mb={6}>Watch History</Heading>
        
        {historyMovies.length > 0 ? (
          <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
            {historyMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </Grid>
        ) : (
          <Text color="gray.500">No watch history yet</Text>
        )}
      </Container>
    </Box>
  );
};
