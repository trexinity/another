import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Avatar,
  Text,
  Button,
  SimpleGrid,
  Image,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';
import { format } from 'date-fns';

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // States
  const [favorites, setFavorites] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(true);

  // Security: Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  // Load user data when page opens
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        // Load favorites
        if (user.favorites && user.favorites.length > 0) {
          const favoritesData = await Promise.all(
            user.favorites.map(async (movieId) => {
              const movieRef = ref(db, `movies/${movieId}`);
              const snapshot = await get(movieRef);
              if (snapshot.exists()) {
                return { id: movieId, ...snapshot.val() };
              }
              return null;
            })
          );
          setFavorites(favoritesData.filter(Boolean)); // Remove nulls
        }

        // Load watch history
        const historyRef = ref(db, `users/${user.uid}/watchHistory`);
        const historySnapshot = await get(historyRef);
        if (historySnapshot.exists()) {
          const historyData = Object.entries(historySnapshot.val()).map(
            ([id, data]) => ({
              id,
              ...data,
            })
          );
          // Sort by most recent
          historyData.sort((a, b) => 
            new Date(b.watchedAt) - new Date(a.watchedAt)
          );
          setWatchHistory(historyData);
        }

        // Load continue watching (movies with saved progress)
        const progressRef = ref(db, `users/${user.uid}/watchProgress`);
        const progressSnapshot = await get(progressRef);
        if (progressSnapshot.exists()) {
          const progressData = Object.entries(progressSnapshot.val()).map(
            ([id, data]) => ({
              id,
              ...data,
            })
          );
          // Sort by most recent
          progressData.sort((a, b) => 
            new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt)
          );
          setContinueWatching(progressData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: 'Error loading profile',
          description: error.message,
          status: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, toast]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'See you next time!',
        status: 'info',
        duration: 2000,
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Format time ago
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return format(date, 'MMM d, yyyy');
  };

  // Movie card component
  const MovieCard = ({ movie, showProgress = false }) => (
    <Box
      cursor="pointer"
      onClick={() => navigate(`/watch/${movie.id}`)}
      position="relative"
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.3s"
      _hover={{
        transform: 'scale(1.05)',
        boxShadow: '0 8px 30px rgba(229, 9, 20, 0.4)',
      }}
    >
      <Image
        src={movie.thumbnailUrl}
        alt={movie.title}
        w="100%"
        h="200px"
        objectFit="cover"
      />
      
      {/* Progress bar for continue watching */}
      {showProgress && movie.progress && movie.duration && (
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
            w={`${(movie.progress / movie.duration) * 100}%`}
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
        {movie.watchedAt && (
          <Text fontSize="xs" color="brand.textGray">
            {timeAgo(movie.watchedAt)}
          </Text>
        )}
        {movie.lastWatchedAt && (
          <Text fontSize="xs" color="brand.textGray">
            {timeAgo(movie.lastWatchedAt)}
          </Text>
        )}
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" pt={24}>
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.primary" thickness="4px" />
          <Text>Loading your profile...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" pt={24} pb={12} bg="brand.background">
      <Container maxW="1400px">
        {/* Profile Header */}
        <HStack
          spacing={6}
          mb={10}
          p={8}
          bg="brand.cardBg"
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.700"
        >
          <Avatar
            size="2xl"
            name={user.displayName || user.email}
            src={user.photoURL}
          />
          
          <VStack align="start" flex={1} spacing={2}>
            <Heading size="xl">{user.displayName || 'User'}</Heading>
            <Text color="brand.textGray">{user.email}</Text>
            
            <HStack spacing={6} mt={2}>
              <VStack spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color="brand.primary">
                  {favorites.length}
                </Text>
                <Text fontSize="sm" color="brand.textGray">
                  Favorites
                </Text>
              </VStack>
              
              <VStack spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color="brand.primary">
                  {watchHistory.length}
                </Text>
                <Text fontSize="sm" color="brand.textGray">
                  Watched
                </Text>
              </VStack>
            </HStack>
          </VStack>

          <VStack spacing={3}>
            <Button
              variant="primary"
              onClick={() => navigate('/settings')}
              width="150px"
            >
              Settings
            </Button>
            <Button
              variant="outline"
              colorScheme="red"
              onClick={handleLogout}
              width="150px"
            >
              Sign Out
            </Button>
          </VStack>
        </HStack>

        {/* Content Tabs */}
        <Tabs colorScheme="red" size="lg">
          <TabList borderColor="gray.700">
            <Tab _selected={{ color: 'brand.primary', borderColor: 'brand.primary' }}>
              Continue Watching
            </Tab>
            <Tab _selected={{ color: 'brand.primary', borderColor: 'brand.primary' }}>
              My List
            </Tab>
            <Tab _selected={{ color: 'brand.primary', borderColor: 'brand.primary' }}>
              Watch History
            </Tab>
          </TabList>

          <TabPanels mt={6}>
            {/* Continue Watching Tab */}
            <TabPanel p={0}>
              {continueWatching.length > 0 ? (
                <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
                  {continueWatching.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} showProgress={true} />
                  ))}
                </SimpleGrid>
              ) : (
                <Box
                  p={12}
                  textAlign="center"
                  bg="brand.cardBg"
                  borderRadius="lg"
                >
                  <Text fontSize="xl" mb={2}>
                    No videos in progress
                  </Text>
                  <Text color="brand.textGray">
                    Start watching something to see it here
                  </Text>
                  <Button
                    variant="primary"
                    mt={4}
                    onClick={() => navigate('/browse')}
                  >
                    Browse Content
                  </Button>
                </Box>
              )}
            </TabPanel>

            {/* My List Tab */}
            <TabPanel p={0}>
              {favorites.length > 0 ? (
                <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
                  {favorites.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </SimpleGrid>
              ) : (
                <Box
                  p={12}
                  textAlign="center"
                  bg="brand.cardBg"
                  borderRadius="lg"
                >
                  <Text fontSize="xl" mb={2}>
                    Your list is empty
                  </Text>
                  <Text color="brand.textGray">
                    Add videos to your favorites to see them here
                  </Text>
                  <Button
                    variant="primary"
                    mt={4}
                    onClick={() => navigate('/browse')}
                  >
                    Browse Content
                  </Button>
                </Box>
              )}
            </TabPanel>

            {/* Watch History Tab */}
            <TabPanel p={0}>
              {watchHistory.length > 0 ? (
                <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
                  {watchHistory.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </SimpleGrid>
              ) : (
                <Box
                  p={12}
                  textAlign="center"
                  bg="brand.cardBg"
                  borderRadius="lg"
                >
                  <Text fontSize="xl" mb={2}>
                    No watch history yet
                  </Text>
                  <Text color="brand.textGray">
                    Videos you watch will appear here
                  </Text>
                  <Button
                    variant="primary"
                    mt={4}
                    onClick={() => navigate('/browse')}
                  >
                    Start Watching
                  </Button>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};
