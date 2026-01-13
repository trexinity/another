import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  VStack,
  Badge,
  Button,
  Spinner,
  Center,
  Image,
  Grid,
  GridItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Avatar,
  SimpleGrid,
} from '@chakra-ui/react';
import { ref, get, update } from 'firebase/database';
import { db } from '../config/firebase';
import { CustomVideoPlayer } from '../components/CustomVideoPlayer';
import { FiArrowLeft, FiCalendar, FiUser, FiFilm, FiPlay, FiPlus, FiCheck } from 'react-icons/fi';
import { useWatchlist } from '../hooks/useWatchlist';

export const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  useEffect(() => {
    fetchMovie();
  }, [id]);

  const fetchMovie = async () => {
    try {
      const movieRef = ref(db, `movies/${id}`);
      const snapshot = await get(movieRef);
      
      if (snapshot.exists()) {
        const data = { id, ...snapshot.val() };
        setMovie(data);
        
        // Increment views
        await update(movieRef, {
          views: (data.views || 0) + 1
        });
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = () => {
    if (watchlist.includes(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie.id);
    }
  };

  if (loading) {
    return (
      <Center minH="100vh" bg="#0F171E">
        <Spinner size="xl" color="#00A8E1" />
      </Center>
    );
  }

  if (!movie) {
    return (
      <Center minH="100vh" bg="#0F171E">
        <Text color="white">Content not found</Text>
      </Center>
    );
  }

  const isInWatchlist = watchlist.includes(movie.id);
  const videoToPlay = selectedEpisode ? selectedEpisode.videoUrl : movie.videoUrl;

  return (
    <Box minH="100vh" bg="#0F171E" pt={16}>
      {/* Back Button */}
      <Container maxW="1920px" px={{ base: 4, md: 12 }} pt={4}>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          onClick={() => navigate(-1)}
          color="gray.400"
          _hover={{ color: 'white', bg: '#1A242F' }}
          mb={4}
        >
          Back
        </Button>
      </Container>

      {/* Video Player */}
      <Box mb={8}>
        <CustomVideoPlayer
          videoUrl={videoToPlay}
          videoSource={movie.videoSource}
          title={selectedEpisode ? `${movie.title} - ${selectedEpisode.title}` : movie.title}
        />
      </Box>

      {/* Content Details */}
      <Container maxW="1920px" px={{ base: 4, md: 12 }} pb={12}>
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          {/* Main Content */}
          <GridItem>
            <VStack align="stretch" spacing={6}>
              {/* Title and Actions */}
              <Box>
                <HStack spacing={3} mb={3}>
                  {movie.isPrimeOriginal && (
                    <Badge bg="#00A8E1" color="white" px={2} py={1} fontSize="xs">
                      prime original
                    </Badge>
                  )}
                  {movie.year && (
                    <Badge bg="rgba(255,255,255,0.1)" color="white" px={2} py={1}>
                      {movie.year}
                    </Badge>
                  )}
                  {movie.rating && (
                    <Badge bg="rgba(255,255,255,0.1)" color="white" px={2} py={1}>
                      {movie.rating}
                    </Badge>
                  )}
                  {movie.duration && (
                    <Text color="gray.400" fontSize="sm">{movie.duration}</Text>
                  )}
                </HStack>

                <Heading size="2xl" color="white" fontFamily="HeadingFont" mb={4}>
                  {movie.title}
                </Heading>

                <HStack spacing={4}>
                  <Button
                    leftIcon={<FiPlay />}
                    variant="primeGold"
                    size="lg"
                  >
                    Watch Now
                  </Button>
                  <Button
                    leftIcon={isInWatchlist ? <FiCheck /> : <FiPlus />}
                    variant="outline"
                    borderColor="white"
                    color="white"
                    size="lg"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    onClick={handleWatchlistToggle}
                  >
                    {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                  </Button>
                </HStack>
              </Box>

              <Divider borderColor="rgba(255,255,255,0.1)" />

              {/* Tabs */}
              <Tabs variant="unstyled">
                <TabList borderBottom="1px solid" borderColor="rgba(255,255,255,0.1)">
                  <Tab
                    color="gray.400"
                    _selected={{ color: '#00A8E1', borderBottom: '3px solid #00A8E1' }}
                    _hover={{ color: 'white' }}
                    fontWeight="600"
                  >
                    Overview
                  </Tab>
                  {movie.type === 'series' && movie.episodes && (
                    <Tab
                      color="gray.400"
                      _selected={{ color: '#00A8E1', borderBottom: '3px solid #00A8E1' }}
                      _hover={{ color: 'white' }}
                      fontWeight="600"
                    >
                      Episodes
                    </Tab>
                  )}
                  <Tab
                    color="gray.400"
                    _selected={{ color: '#00A8E1', borderBottom: '3px solid #00A8E1' }}
                    _hover={{ color: 'white' }}
                    fontWeight="600"
                  >
                    More Like This
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Overview Tab */}
                  <TabPanel px={0} py={6}>
                    <VStack align="stretch" spacing={6}>
                      {/* Description */}
                      {movie.description && (
                        <Box>
                          <Heading size="md" color="white" mb={3} fontFamily="HeadingFont">
                            Synopsis
                          </Heading>
                          <Text color="gray.300" fontSize="lg" lineHeight="tall">
                            {movie.description}
                          </Text>
                        </Box>
                      )}

                      {/* Cast and Crew */}
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        {movie.director && (
                          <Box>
                            <HStack spacing={2} mb={2}>
                              <FiUser color="#00A8E1" />
                              <Text color="gray.400" fontSize="sm" fontWeight="bold" textTransform="uppercase">
                                Director
                              </Text>
                            </HStack>
                            <Text color="white" fontSize="lg">{movie.director}</Text>
                          </Box>
                        )}

                        {movie.cast && (
                          <Box>
                            <HStack spacing={2} mb={2}>
                              <FiFilm color="#00A8E1" />
                              <Text color="gray.400" fontSize="sm" fontWeight="bold" textTransform="uppercase">
                                Cast
                              </Text>
                            </HStack>
                            <Text color="white" fontSize="lg">{movie.cast}</Text>
                          </Box>
                        )}
                      </SimpleGrid>

                      {/* Metadata */}
                      <HStack spacing={6} pt={4} flexWrap="wrap" color="gray.400" fontSize="sm">
                        <HStack spacing={2}>
                          <FiCalendar />
                          <Text>Added: {new Date(movie.createdAt).toLocaleDateString()}</Text>
                        </HStack>
                        {movie.views !== undefined && (
                          <Text>👁 {movie.views.toLocaleString()} views</Text>
                        )}
                        {movie.genre && (
                          <Badge colorScheme="blue" textTransform="capitalize">
                            {movie.genre}
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                  </TabPanel>

                  {/* Episodes Tab */}
                  {movie.type === 'series' && movie.episodes && (
                    <TabPanel px={0} py={6}>
                      <VStack align="stretch" spacing={4}>
                        {/* Season Selector */}
                        <HStack>
                          <Text color="gray.400" fontSize="sm">Season:</Text>
                          {[...Array(movie.seasons || 1)].map((_, i) => (
                            <Button
                              key={i + 1}
                              size="sm"
                              variant={selectedSeason === i + 1 ? 'prime' : 'outline'}
                              onClick={() => setSelectedSeason(i + 1)}
                            >
                              {i + 1}
                            </Button>
                          ))}
                        </HStack>

                        {/* Episodes List */}
                        <VStack align="stretch" spacing={3}>
                          {movie.episodes
                            .filter(ep => ep.season === selectedSeason)
                            .map((episode, index) => (
                              <HStack
                                key={index}
                                p={4}
                                bg="#1A242F"
                                borderRadius="md"
                                cursor="pointer"
                                _hover={{ bg: '#232F3E' }}
                                onClick={() => setSelectedEpisode(episode)}
                                border="2px solid"
                                borderColor={selectedEpisode?.title === episode.title ? '#00A8E1' : 'transparent'}
                              >
                                <Text color="white" fontWeight="bold" minW="40px">
                                  {episode.number}
                                </Text>
                                <Box flex={1}>
                                  <Text color="white" fontWeight="bold">{episode.title}</Text>
                                  <Text color="gray.400" fontSize="sm" noOfLines={2}>
                                    {episode.description}
                                  </Text>
                                </Box>
                                <Text color="gray.400" fontSize="sm">{episode.duration}</Text>
                              </HStack>
                            ))}
                        </VStack>
                      </VStack>
                    </TabPanel>
                  )}

                  {/* More Like This Tab */}
                  <TabPanel px={0} py={6}>
                    <Text color="gray.400">Similar content will appear here...</Text>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          </GridItem>

          {/* Sidebar */}
          <GridItem>
            <VStack align="stretch" spacing={6}>
              {/* Thumbnail */}
              <Box
                borderRadius="lg"
                overflow="hidden"
                border="1px solid rgba(255,255,255,0.1)"
              >
                <Image
                  src={movie.thumbnailUrl}
                  alt={movie.title}
                  w="100%"
                  h="auto"
                />
              </Box>

              {/* Stats */}
              <Box bg="#1A242F" p={6} borderRadius="lg" border="1px solid rgba(255,255,255,0.1)">
                <VStack align="stretch" spacing={4}>
                  <Heading size="sm" color="white" fontFamily="HeadingFont">
                    Content Details
                  </Heading>
                  <Divider borderColor="rgba(255,255,255,0.1)" />
                  
                  <HStack justify="space-between">
                    <Text color="gray.400" fontSize="sm">Type:</Text>
                    <Badge colorScheme="purple">{movie.type || 'movie'}</Badge>
                  </HStack>

                  {movie.seasons && (
                    <HStack justify="space-between">
                      <Text color="gray.400" fontSize="sm">Seasons:</Text>
                      <Text color="white">{movie.seasons}</Text>
                    </HStack>
                  )}

                  <HStack justify="space-between">
                    <Text color="gray.400" fontSize="sm">Views:</Text>
                    <Text color="white">{(movie.views || 0).toLocaleString()}</Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text color="gray.400" fontSize="sm">Source:</Text>
                    <Badge variant="outline">
                      {movie.videoSource === 'archive' ? 'Archive.org' :
                       movie.videoSource === 'googledrive' ? 'Google Drive' :
                       'Cloudinary'}
                    </Badge>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};
