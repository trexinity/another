import { useEffect, useMemo, useState } from 'react';
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
  SimpleGrid,
  IconButton,
  useToast,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { ref, get, runTransaction } from 'firebase/database';
import { db } from '../config/firebase';
import { AdvancedVideoPlayer } from '../components/AdvancedVideoPlayer';
import { ShareModal } from '../components/ShareModal';
import { FiArrowLeft, FiCalendar, FiUser, FiFilm, FiPlay, FiPlus, FiCheck, FiThumbsUp, FiShare2 } from 'react-icons/fi';
import { useWatchlist } from '../hooks/useWatchlist';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { user } = useAuth();

  const shareModal = useDisclosure();

  const [movie, setMovie] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [loading, setLoading] = useState(true);

  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const bg = colorMode === 'dark' ? 'black' : 'white';
  const surface = colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50';
  const surface2 = colorMode === 'dark' ? 'whiteAlpha.150' : 'blackAlpha.100';
  const border = colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200';

  useEffect(() => {
    fetchMovie();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMovie = async () => {
    setLoading(true);
    try {
      const movieRef = ref(db, `movies/${id}`);
      const snapshot = await get(movieRef);

      if (!snapshot.exists()) {
        navigate('/');
        return;
      }

      const data = { id, ...snapshot.val() };
      setMovie(data);

      // Increment views
      await runTransaction(movieRef, (current) => {
        if (!current) return current;
        return { ...current, views: (current.views || 0) + 1 };
      });
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Failed to load', status: 'error', duration: 2500, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const isInWatchlist = useMemo(() => (movie ? watchlist.includes(movie.id) : false), [watchlist, movie]);

  const videoToPlay = useMemo(() => {
    if (!movie) return '';
    return selectedEpisode ? selectedEpisode.videoUrl : movie.videoUrl;
  }, [movie, selectedEpisode]);

  const titleToPlay = useMemo(() => {
    if (!movie) return '';
    return selectedEpisode ? `${movie.title} - ${selectedEpisode.title}` : movie.title;
  }, [movie, selectedEpisode]);

  const handleWatchlistToggle = () => {
    if (!movie) return;
    if (watchlist.includes(movie.id)) removeFromWatchlist(movie.id);
    else addToWatchlist(movie.id);
  };

  const handleLikeToggle = async () => {
    if (!user) {
      toast({ title: 'Sign in to like', status: 'info', duration: 1800, isClosable: true });
      return;
    }

    const movieRef = ref(db, `movies/${id}`);

    try {
      await runTransaction(movieRef, (current) => {
        if (!current) return current;

        const likesBy = current.likesBy || {};
        const alreadyLiked = !!likesBy[user.uid];
        let likes = Number(current.likes || 0);

        if (alreadyLiked) {
          delete likesBy[user.uid];
          likes = Math.max(0, likes - 1);
        } else {
          likesBy[user.uid] = true;
          likes = likes + 1;
        }

        return { ...current, likes, likesBy };
      });

      const snap = await get(movieRef);
      if (snap.exists()) setMovie({ id, ...snap.val() });

      toast({ title: 'Updated', status: 'success', duration: 1200, isClosable: true });
    } catch (error) {
      console.error('Like failed:', error);
      toast({ title: 'Failed', status: 'error', duration: 2000, isClosable: true });
    }
  };

  if (loading) {
    return (
      <Center minH="100vh" bg={bg}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!movie) {
    return (
      <Center minH="100vh" bg={bg}>
        <Text>Content not found</Text>
      </Center>
    );
  }

  const userLiked = user?.uid ? !!movie.likesBy?.[user.uid] : false;

  return (
    <Box minH="100vh" bg={bg} pt={16}>
      <Container maxW="1920px" px={{ base: 4, md: 12 }} pt={4}>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          onClick={() => navigate(-1)}
          mb={4}
          fontWeight="700"
        >
          Back
        </Button>
      </Container>

      {/* Video Player */}
      <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <AdvancedVideoPlayer videoUrl={videoToPlay} videoSource={movie.videoSource} title={titleToPlay} />
      </MotionBox>

      {/* Details */}
      <Container maxW="1920px" px={{ base: 4, md: 12 }} py={12}>
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={10}>
          <GridItem>
            <VStack align="stretch" spacing={8}>
              {/* Header */}
              <Box>
                <HStack spacing={3} mb={4} flexWrap="wrap">
                  {movie.year && <Badge fontSize="sm">{movie.year}</Badge>}
                  {movie.rating && <Badge fontSize="sm">{movie.rating}</Badge>}
                  {movie.duration && <Text opacity={0.7} fontSize="sm">{movie.duration}</Text>}
                  {movie.genre && <Badge fontSize="sm" textTransform="capitalize">{movie.genre}</Badge>}
                </HStack>

                <Heading as="h1" size="2xl" mb={6} letterSpacing="heading">
                  {movie.title}
                </Heading>

                <HStack spacing={3} flexWrap="wrap">
                  <Button leftIcon={<FiPlay />} variant="solid" size="lg" fontWeight="700">
                    Play
                  </Button>

                  <Button
                    leftIcon={isInWatchlist ? <FiCheck /> : <FiPlus />}
                    variant="outline"
                    size="lg"
                    onClick={handleWatchlistToggle}
                    fontWeight="700"
                  >
                    {isInWatchlist ? 'Added' : 'Watchlist'}
                  </Button>

                  <IconButton
                    aria-label="Like"
                    icon={<FiThumbsUp />}
                    onClick={handleLikeToggle}
                    variant={userLiked ? 'solid' : 'outline'}
                    size="lg"
                  />

                  <IconButton
                    aria-label="Share"
                    icon={<FiShare2 />}
                    onClick={shareModal.onOpen}
                    variant="outline"
                    size="lg"
                  />
                </HStack>

                <HStack spacing={5} mt={5} opacity={0.8} fontSize="sm" flexWrap="wrap">
                  <Text>{(movie.views || 0).toLocaleString()} views</Text>
                  <Text>{(movie.likes || 0).toLocaleString()} likes</Text>
                </HStack>
              </Box>

              <Divider borderColor={border} />

              {/* Tabs */}
              <Tabs variant="unstyled">
                <TabList borderBottom="1px solid" borderColor={border}>
                  <Tab
                    opacity={0.7}
                    _selected={{ opacity: 1, borderBottom: '3px solid', fontWeight: '900' }}
                    fontWeight="700"
                  >
                    Overview
                  </Tab>

                  {movie.type === 'series' && movie.episodes && (
                    <Tab
                      opacity={0.7}
                      _selected={{ opacity: 1, borderBottom: '3px solid', fontWeight: '900' }}
                      fontWeight="700"
                    >
                      Episodes
                    </Tab>
                  )}

                  <Tab
                    opacity={0.7}
                    _selected={{ opacity: 1, borderBottom: '3px solid', fontWeight: '900' }}
                    fontWeight="700"
                  >
                    More
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Overview */}
                  <TabPanel px={0} py={8}>
                    <VStack align="stretch" spacing={8}>
                      {movie.description && (
                        <Box>
                          <Heading size="md" mb={4}>
                            Synopsis
                          </Heading>
                          <Text opacity={0.9} fontSize="lg" lineHeight="tall">
                            {movie.description}
                          </Text>
                        </Box>
                      )}

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                        {movie.director && (
                          <Box>
                            <HStack spacing={2} mb={2}>
                              <FiUser opacity={0.7} />
                              <Text fontSize="xs" fontWeight="900" textTransform="uppercase" opacity={0.7}>
                                Director
                              </Text>
                            </HStack>
                            <Text fontSize="lg" fontWeight="600">
                              {movie.director}
                            </Text>
                          </Box>
                        )}

                        {movie.cast && (
                          <Box>
                            <HStack spacing={2} mb={2}>
                              <FiFilm opacity={0.7} />
                              <Text fontSize="xs" fontWeight="900" textTransform="uppercase" opacity={0.7}>
                                Cast
                              </Text>
                            </HStack>
                            <Text fontSize="lg" fontWeight="600">
                              {movie.cast}
                            </Text>
                          </Box>
                        )}
                      </SimpleGrid>

                      <HStack spacing={6} flexWrap="wrap" opacity={0.7} fontSize="sm">
                        <HStack spacing={2}>
                          <FiCalendar />
                          <Text>Added: {movie.createdAt ? new Date(movie.createdAt).toLocaleDateString() : '-'}</Text>
                        </HStack>
                      </HStack>
                    </VStack>
                  </TabPanel>

                  {/* Episodes */}
                  {movie.type === 'series' && movie.episodes && (
                    <TabPanel px={0} py={8}>
                      <VStack align="stretch" spacing={5}>
                        <HStack flexWrap="wrap">
                          <Text opacity={0.7} fontSize="sm" fontWeight="700">
                            Season:
                          </Text>
                          {[...Array(movie.seasons || 1)].map((_, i) => (
                            <Button
                              key={i + 1}
                              size="sm"
                              variant={selectedSeason === i + 1 ? 'solid' : 'outline'}
                              onClick={() => setSelectedSeason(i + 1)}
                              fontWeight="700"
                            >
                              {i + 1}
                            </Button>
                          ))}
                        </HStack>

                        <VStack align="stretch" spacing={3}>
                          {movie.episodes
                            .filter((ep) => ep.season === selectedSeason)
                            .map((episode, index) => (
                              <HStack
                                key={index}
                                p={5}
                                bg={surface}
                                borderRadius="xl"
                                cursor="pointer"
                                _hover={{ bg: surface2, transform: 'translateY(-2px)' }}
                                onClick={() => setSelectedEpisode(episode)}
                                border="2px solid"
                                borderColor={
                                  selectedEpisode?.title === episode.title
                                    ? colorMode === 'dark'
                                      ? 'white'
                                      : 'black'
                                    : border
                                }
                                transition="all 0.2s"
                              >
                                <Text fontWeight="900" minW="50px" fontSize="lg">
                                  {episode.number}
                                </Text>
                                <Box flex={1}>
                                  <Text fontWeight="800" mb={1}>
                                    {episode.title}
                                  </Text>
                                  <Text opacity={0.7} fontSize="sm" noOfLines={2}>
                                    {episode.description}
                                  </Text>
                                </Box>
                                <Text opacity={0.7} fontSize="sm">
                                  {episode.duration}
                                </Text>
                              </HStack>
                            ))}
                        </VStack>
                      </VStack>
                    </TabPanel>
                  )}

                  {/* More */}
                  <TabPanel px={0} py={8}>
                    <Text opacity={0.7}>Similar content coming soon.</Text>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          </GridItem>

          {/* Sidebar */}
          <GridItem>
            <VStack align="stretch" spacing={6}>
              <Box borderRadius="xl" overflow="hidden" border="1px solid" borderColor={border}>
                <Image src={movie.thumbnailUrl} alt={movie.title} w="100%" />
              </Box>

              <Box bg={surface} p={6} borderRadius="xl" border="1px solid" borderColor={border}>
                <VStack align="stretch" spacing={4}>
                  <Heading size="sm">Details</Heading>
                  <Divider borderColor={border} />

                  <HStack justify="space-between">
                    <Text opacity={0.7} fontSize="sm" fontWeight="700">
                      Type
                    </Text>
                    <Badge>{movie.type || 'movie'}</Badge>
                  </HStack>

                  {movie.seasons && (
                    <HStack justify="space-between">
                      <Text opacity={0.7} fontSize="sm" fontWeight="700">
                        Seasons
                      </Text>
                      <Text fontWeight="700">{movie.seasons}</Text>
                    </HStack>
                  )}

                  <HStack justify="space-between">
                    <Text opacity={0.7} fontSize="sm" fontWeight="700">
                      Likes
                    </Text>
                    <Text fontWeight="700">{(movie.likes || 0).toLocaleString()}</Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </Container>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={shareModal.onClose}
        title={movie.title}
        url={window.location.href}
      />
    </Box>
  );
};
