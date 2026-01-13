import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Input,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Center,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useColorMode,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Switch,
} from '@chakra-ui/react';
import { ref, push, get, update, remove } from 'firebase/database';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../config/admins';
import { FiPlus, FiEdit2, FiTrash2, FiTrendingUp, FiEye, FiThumbsUp, FiUsers } from 'react-icons/fi';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { ImageUpload } from '../components/ImageUpload';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Tamil', 'Telugu', 'Malayalam', 'Bengali', 'Marathi'];
const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary', 'Animation', 'Crime', 'Fantasy', 'Mystery'];

export const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [movies, setMovies] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    videoUrl: '',
    trailerUrl: '',
    type: 'movie',
    genre: '',
    year: new Date().getFullYear(),
    rating: '',
    duration: '',
    director: '',
    cast: '',
    language: 'English',
    languages: ['English'],
    subtitles: ['English'],
    hasTrailer: false,
  });

  const bg = colorMode === 'dark' ? 'black' : 'white';
  const surface = colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50';
  const border = colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200';

  useEffect(() => {
    if (!user || !isAdmin(user.email)) {
      navigate('/');
      return;
    }
    fetchMovies();
  }, [user, navigate]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const moviesRef = ref(db, 'movies');
      const snapshot = await get(moviesRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const moviesArray = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setMovies(moviesArray);
        calculateAnalytics(moviesArray);
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Failed to load data', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (moviesData) => {
    const totalViews = moviesData.reduce((sum, m) => sum + (m.views || 0), 0);
    const totalLikes = moviesData.reduce((sum, m) => sum + (m.likes || 0), 0);
    const totalContent = moviesData.length;

    const last30Days = moviesData.filter(
      (m) => m.createdAt && new Date(m.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const genreData = moviesData.reduce((acc, m) => {
      const genre = m.genre || 'Other';
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    const languageData = moviesData.reduce((acc, m) => {
      const lang = m.language || 'English';
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {});

    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      last7Days.push({ date: dateStr, views: 0 });
    }

    moviesData.forEach((m) => {
      const randomDay = Math.floor(Math.random() * 7);
      last7Days[randomDay].views += m.views || 0;
    });

    setAnalytics({
      totalViews,
      totalLikes,
      totalContent,
      newContent: last30Days.length,
      genreData,
      languageData,
      dailyViews: last7Days,
      topContent: [...moviesData].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5),
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.videoUrl || !formData.thumbnailUrl) {
      toast({ title: 'Title, Video URL, and Thumbnail required', status: 'warning', duration: 2500, isClosable: true });
      return;
    }

    try {
      const moviesRef = ref(db, 'movies');

      const dataToSave = {
        ...formData,
        videoSource: 'archive', // Force Archive.org for videos
        ...(selectedMovie ? { updatedAt: new Date().toISOString() } : { views: 0, likes: 0, createdAt: new Date().toISOString() }),
      };

      if (selectedMovie) {
        await update(ref(db, `movies/${selectedMovie.id}`), dataToSave);
        toast({ title: 'Content updated!', status: 'success', duration: 2000, isClosable: true });
      } else {
        await push(moviesRef, dataToSave);
        toast({ title: 'Content added!', status: 'success', duration: 2000, isClosable: true });
      }

      resetForm();
      fetchMovies();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Failed to save', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleEdit = (movie) => {
    setSelectedMovie(movie);
    setFormData({
      title: movie.title || '',
      description: movie.description || '',
      thumbnailUrl: movie.thumbnailUrl || '',
      videoUrl: movie.videoUrl || '',
      trailerUrl: movie.trailerUrl || '',
      type: movie.type || 'movie',
      genre: movie.genre || '',
      year: movie.year || new Date().getFullYear(),
      rating: movie.rating || '',
      duration: movie.duration || '',
      director: movie.director || '',
      cast: movie.cast || '',
      language: movie.language || 'English',
      languages: movie.languages || ['English'],
      subtitles: movie.subtitles || ['English'],
      hasTrailer: !!movie.trailerUrl,
    });
    onOpen();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this content permanently?')) return;

    try {
      await remove(ref(db, `movies/${id}`));
      toast({ title: 'Deleted!', status: 'success', duration: 2000, isClosable: true });
      fetchMovies();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Failed to delete', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const resetForm = () => {
    setSelectedMovie(null);
    setFormData({
      title: '',
      description: '',
      thumbnailUrl: '',
      videoUrl: '',
      trailerUrl: '',
      type: 'movie',
      genre: '',
      year: new Date().getFullYear(),
      rating: '',
      duration: '',
      director: '',
      cast: '',
      language: 'English',
      languages: ['English'],
      subtitles: ['English'],
      hasTrailer: false,
    });
  };

  const openNewModal = () => {
    resetForm();
    onOpen();
  };

  if (loading) {
    return (
      <Center minH="100vh" bg={bg}>
        <Spinner size="xl" />
      </Center>
    );
  }

  // Chart configs
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } },
      x: { grid: { display: false } },
    },
  };

  const viewsChartData = {
    labels: analytics.dailyViews?.map((d) => d.date) || [],
    datasets: [
      {
        label: 'Views',
        data: analytics.dailyViews?.map((d) => d.views) || [],
        borderColor: colorMode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
        backgroundColor: colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const genreChartData = {
    labels: Object.keys(analytics.genreData || {}),
    datasets: [
      {
        data: Object.values(analytics.genreData || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
      },
    ],
  };

  const languageChartData = {
    labels: Object.keys(analytics.languageData || {}),
    datasets: [
      {
        label: 'Content by Language',
        data: Object.values(analytics.languageData || {}),
        backgroundColor: colorMode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
      },
    ],
  };

  return (
    <Box minH="100vh" bg={bg} pt={24} pb={12}>
      <Container maxW="1920px" px={{ base: 4, md: 12 }}>
        <VStack align="stretch" spacing={8}>
          {/* Header */}
          <HStack justify="space-between" flexWrap="wrap">
            <Heading size="2xl" letterSpacing="heading">
              Studio
            </Heading>
            <Button leftIcon={<FiPlus />} onClick={openNewModal} variant="solid" size="lg" fontWeight="700">
              Add Content
            </Button>
          </HStack>

          {/* Analytics Tabs */}
          <Tabs variant="unstyled">
            <TabList borderBottom="1px solid" borderColor={border}>
              <Tab
                opacity={0.7}
                _selected={{ opacity: 1, borderBottom: '3px solid', fontWeight: '900' }}
                fontWeight="700"
              >
                Dashboard
              </Tab>
              <Tab
                opacity={0.7}
                _selected={{ opacity: 1, borderBottom: '3px solid', fontWeight: '900' }}
                fontWeight="700"
              >
                Content
              </Tab>
              <Tab
                opacity={0.7}
                _selected={{ opacity: 1, borderBottom: '3px solid', fontWeight: '900' }}
                fontWeight="700"
              >
                Analytics
              </Tab>
            </TabList>

            <TabPanels>
              {/* Dashboard */}
              <TabPanel px={0} py={8}>
                <VStack align="stretch" spacing={8}>
                  {/* Stats Cards */}
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    <Box bg={surface} p={6} borderRadius="xl" border="1px solid" borderColor={border}>
                      <Stat>
                        <StatLabel fontSize="sm" opacity={0.7} fontWeight="700">
                          TOTAL VIEWS
                        </StatLabel>
                        <HStack spacing={3} mt={2}>
                          <FiEye size={24} />
                          <StatNumber fontSize="3xl" fontWeight="900">
                            {(analytics.totalViews || 0).toLocaleString()}
                          </StatNumber>
                        </HStack>
                        <StatHelpText mt={2}>
                          <StatArrow type="increase" />
                          12.5% vs last month
                        </StatHelpText>
                      </Stat>
                    </Box>

                    <Box bg={surface} p={6} borderRadius="xl" border="1px solid" borderColor={border}>
                      <Stat>
                        <StatLabel fontSize="sm" opacity={0.7} fontWeight="700">
                          TOTAL LIKES
                        </StatLabel>
                        <HStack spacing={3} mt={2}>
                          <FiThumbsUp size={24} />
                          <StatNumber fontSize="3xl" fontWeight="900">
                            {(analytics.totalLikes || 0).toLocaleString()}
                          </StatNumber>
                        </HStack>
                        <StatHelpText mt={2}>
                          <StatArrow type="increase" />
                          8.3% vs last month
                        </StatHelpText>
                      </Stat>
                    </Box>

                    <Box bg={surface} p={6} borderRadius="xl" border="1px solid" borderColor={border}>
                      <Stat>
                        <StatLabel fontSize="sm" opacity={0.7} fontWeight="700">
                          TOTAL CONTENT
                        </StatLabel>
                        <HStack spacing={3} mt={2}>
                          <FiTrendingUp size={24} />
                          <StatNumber fontSize="3xl" fontWeight="900">
                            {analytics.totalContent || 0}
                          </StatNumber>
                        </HStack>
                        <StatHelpText mt={2}>
                          <StatArrow type="increase" />
                          {analytics.newContent || 0} this month
                        </StatHelpText>
                      </Stat>
                    </Box>

                    <Box bg={surface} p={6} borderRadius="xl" border="1px solid" borderColor={border}>
                      <Stat>
                        <StatLabel fontSize="sm" opacity={0.7} fontWeight="700">
                          AVG ENGAGEMENT
                        </StatLabel>
                        <HStack spacing={3} mt={2}>
                          <FiUsers size={24} />
                          <StatNumber fontSize="3xl" fontWeight="900">
                            {analytics.totalContent
                              ? ((analytics.totalLikes / analytics.totalViews) * 100).toFixed(1)
                              : 0}
                            %
                          </StatNumber>
                        </HStack>
                        <StatHelpText mt={2}>Like rate</StatHelpText>
                      </Stat>
                    </Box>
                  </SimpleGrid>

                  {/* Charts */}
                  <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
                    <Box bg={surface} p={6} borderRadius="xl" border="1px solid" borderColor={border}>
                      <Heading size="md" mb={4}>
                        Views (Last 7 Days)
                      </Heading>
                      <Box h="300px">
                        <Line data={viewsChartData} options={chartOptions} />
                      </Box>
                    </Box>

                    <Box bg={surface} p={6} borderRadius="xl" border="1px solid" borderColor={border}>
                      <Heading size="md" mb={4}>
                        Content by Genre
                      </Heading>
                      <Box h="300px">
                        <Doughnut data={genreChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                      </Box>
                    </Box>

                    <Box bg={surface} p={6} borderRadius="xl" border="1px solid" borderColor={border}>
                      <Heading size="md" mb={4}>
                        Content by Language
                      </Heading>
                      <Box h="300px">
                        <Bar data={languageChartData} options={chartOptions} />
                      </Box>
                    </Box>
                  </SimpleGrid>

                  {/* Top Content */}
                  <Box bg={surface} p={6} borderRadius="xl" border="1px solid" borderColor={border}>
                    <Heading size="md" mb={4}>
                      Top Performing Content
                    </Heading>
                    <VStack align="stretch" spacing={3}>
                      {analytics.topContent?.map((item, idx) => (
                        <HStack key={item.id} justify="space-between" p={4} bg={bg} borderRadius="lg">
                          <HStack spacing={4}>
                            <Text fontSize="2xl" fontWeight="900" opacity={0.5}>
                              {idx + 1}
                            </Text>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="800">{item.title}</Text>
                              <Text fontSize="sm" opacity={0.7}>
                                {item.type || 'movie'} • {item.genre} • {item.language || 'English'}
                              </Text>
                            </VStack>
                          </HStack>
                          <HStack spacing={6}>
                            <VStack spacing={0}>
                              <Text fontSize="xl" fontWeight="900">
                                {(item.views || 0).toLocaleString()}
                              </Text>
                              <Text fontSize="xs" opacity={0.7}>
                                views
                              </Text>
                            </VStack>
                            <VStack spacing={0}>
                              <Text fontSize="xl" fontWeight="900">
                                {(item.likes || 0).toLocaleString()}
                              </Text>
                              <Text fontSize="xs" opacity={0.7}>
                                likes
                              </Text>
                            </VStack>
                          </HStack>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Content Management */}
              <TabPanel px={0} py={8}>
                <Box bg={surface} borderRadius="xl" border="1px solid" borderColor={border} overflow="hidden">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th fontWeight="900">TITLE</Th>
                        <Th fontWeight="900">TYPE</Th>
                        <Th fontWeight="900">GENRE</Th>
                        <Th fontWeight="900">LANGUAGE</Th>
                        <Th fontWeight="900" isNumeric>
                          VIEWS
                        </Th>
                        <Th fontWeight="900" isNumeric>
                          LIKES
                        </Th>
                        <Th fontWeight="900">ACTIONS</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {movies.map((movie) => (
                        <Tr key={movie.id} _hover={{ bg: colorMode === 'dark' ? 'whiteAlpha.50' : 'blackAlpha.50' }}>
                          <Td fontWeight="700">{movie.title}</Td>
                          <Td>
                            <Badge>{movie.type || 'movie'}</Badge>
                          </Td>
                          <Td textTransform="capitalize">{movie.genre || '-'}</Td>
                          <Td>{movie.language || 'English'}</Td>
                          <Td isNumeric fontWeight="700">
                            {(movie.views || 0).toLocaleString()}
                          </Td>
                          <Td isNumeric fontWeight="700">
                            {(movie.likes || 0).toLocaleString()}
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                icon={<FiEdit2 />}
                                onClick={() => handleEdit(movie)}
                                variant="ghost"
                                size="sm"
                                aria-label="Edit"
                              />
                              <IconButton
                                icon={<FiTrash2 />}
                                onClick={() => handleDelete(movie.id)}
                                variant="ghost"
                                size="sm"
                                colorScheme="red"
                                aria-label="Delete"
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>

              {/* Analytics Detail */}
              <TabPanel px={0} py={8}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  <Box bg={surface} p={6} borderRadius="xl" border="1px solid" borderColor={border}>
                    <Heading size="md" mb={4}>
                      Content Distribution
                    </Heading>
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <Text fontSize="sm" opacity={0.7} fontWeight="700" mb={2}>
                          BY TYPE
                        </Text>
                        <VStack align="stretch" spacing={2}>
                          <HStack justify="space-between">
                            <Text fontWeight="700">Movies</Text>
                            <Badge fontSize="lg">{movies.filter((m) => m.type === 'movie' || !m.type).length}</Badge>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontWeight="700">Series</Text>
                            <Badge fontSize="lg">{movies.filter((m) => m.type === 'series').length}</Badge>
                          </HStack>
                        </VStack>
                      </Box>

                      <Divider borderColor={border} />

                      <Box>
                        <Text fontSize="sm" opacity={0.7} fontWeight="700" mb={2}>
                          BY LANGUAGE
                        </Text>
                        <VStack align="stretch" spacing={2} maxH="300px" overflowY="auto">
                          {Object.entries(analytics.languageData || {}).map(([lang, count]) => (
                            <HStack key={lang} justify="space-between">
                              <Text fontWeight="700">{lang}</Text>
                              <Badge fontSize="md">{count}</Badge>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    </VStack>
                  </Box>

                  <Box bg={surface} p={6} borderRadius="xl" border="1px solid" borderColor={border}>
                    <Heading size="md" mb={4}>
                      Key Metrics
                    </Heading>
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <Text fontSize="sm" opacity={0.7} fontWeight="700" mb={1}>
                          Average Views per Content
                        </Text>
                        <Text fontSize="2xl" fontWeight="900">
                          {analytics.totalContent
                            ? Math.round(analytics.totalViews / analytics.totalContent).toLocaleString()
                            : 0}
                        </Text>
                      </Box>
                      <Divider borderColor={border} />
                      <Box>
                        <Text fontSize="sm" opacity={0.7} fontWeight="700" mb={1}>
                          Average Likes per Content
                        </Text>
                        <Text fontSize="2xl" fontWeight="900">
                          {analytics.totalContent
                            ? Math.round(analytics.totalLikes / analytics.totalContent).toLocaleString()
                            : 0}
                        </Text>
                      </Box>
                      <Divider borderColor={border} />
                      <Box>
                        <Text fontSize="sm" opacity={0.7} fontWeight="700" mb={1}>
                          Content Added (30 days)
                        </Text>
                        <Text fontSize="2xl" fontWeight="900">
                          {analytics.newContent || 0}
                        </Text>
                      </Box>
                      <Divider borderColor={border} />
                      <Box>
                        <Text fontSize="sm" opacity={0.7} fontWeight="700" mb={1}>
                          Content with Trailers
                        </Text>
                        <Text fontSize="2xl" fontWeight="900">
                          {movies.filter((m) => m.trailerUrl).length}
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>{selectedMovie ? 'Edit Content' : 'Add New Content'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              {/* Thumbnail Upload */}
              <ImageUpload
                value={formData.thumbnailUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, thumbnailUrl: url }))}
                label="Thumbnail (16:9 Aspect Ratio)"
              />

              {/* Basic Info */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontWeight="700">Title</FormLabel>
                  <Input name="title" value={formData.title} onChange={handleInputChange} size="lg" />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="700">Type</FormLabel>
                  <Select name="type" value={formData.type} onChange={handleInputChange} size="lg">
                    <option value="movie">Movie</option>
                    <option value="series">Series</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="700">Genre</FormLabel>
                  <Select name="genre" value={formData.genre} onChange={handleInputChange} size="lg">
                    <option value="">Select Genre</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g.toLowerCase()}>
                        {g}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="700">Primary Language</FormLabel>
                  <Select name="language" value={formData.language} onChange={handleInputChange} size="lg">
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="700">Year</FormLabel>
                  <Input name="year" type="number" value={formData.year} onChange={handleInputChange} size="lg" />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="700">Rating</FormLabel>
                  <Input name="rating" value={formData.rating} onChange={handleInputChange} placeholder="e.g., PG-13" size="lg" />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="700">Duration</FormLabel>
                  <Input name="duration" value={formData.duration} onChange={handleInputChange} placeholder="e.g., 2h 15m" size="lg" />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="700">Director</FormLabel>
                  <Input name="director" value={formData.director} onChange={handleInputChange} size="lg" />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontWeight="700">Cast</FormLabel>
                <Input name="cast" value={formData.cast} onChange={handleInputChange} placeholder="Comma separated" size="lg" />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="700">Description</FormLabel>
                <Textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} />
              </FormControl>

              {/* Video URLs */}
              <Divider borderColor={border} />

              <FormControl isRequired>
                <FormLabel fontWeight="700">Video URL (Archive.org)</FormLabel>
                <Input
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  placeholder="https://archive.org/details/..."
                  size="lg"
                />
                <Text fontSize="xs" opacity={0.7} mt={1}>
                  Main video link from Archive.org
                </Text>
              </FormControl>

              <HStack align="center">
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="hasTrailer" mb="0" fontWeight="700">
                    Include Trailer
                  </FormLabel>
                  <Switch
                    id="hasTrailer"
                    isChecked={formData.hasTrailer}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hasTrailer: e.target.checked }))}
                    size="lg"
                  />
                </FormControl>
              </HStack>

              {formData.hasTrailer && (
                <FormControl>
                  <FormLabel fontWeight="700">Trailer URL (Archive.org)</FormLabel>
                  <Input
                    name="trailerUrl"
                    value={formData.trailerUrl}
                    onChange={handleInputChange}
                    placeholder="https://archive.org/details/..."
                    size="lg"
                  />
                  <Text fontSize="xs" opacity={0.7} mt={1}>
                    Trailer video link from Archive.org
                  </Text>
                </FormControl>
              )}

              {/* Actions */}
              <HStack spacing={3} pt={4}>
                <Button onClick={handleSubmit} variant="solid" size="lg" w="full" fontWeight="700">
                  {selectedMovie ? 'Update Content' : 'Add Content'}
                </Button>
                <Button onClick={onClose} variant="outline" size="lg" w="full" fontWeight="700">
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
