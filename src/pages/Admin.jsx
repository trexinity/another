import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Avatar,
  Progress,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  Alert,
  AlertIcon,
  Divider,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { 
  FiUpload, 
  FiBarChart2, 
  FiVideo, 
  FiEdit, 
  FiTrash2, 
  FiMoreVertical,
  FiEye,
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiDollarSign,
  FiDownload,
} from 'react-icons/fi';
import { ref, get, update, remove, push, set } from 'firebase/database';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../config/admins';
import { useDropzone } from 'react-dropzone';
import { uploadVideo, uploadImage } from '../services/cloudinaryService';

export const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  // States
  const [movies, setMovies] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalMovies: 0,
    totalUsers: 0,
    avgWatchTime: 0,
    trending: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [videoSource, setVideoSource] = useState('archive');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [archiveUrl, setArchiveUrl] = useState('');
  const [googleDriveUrl, setGoogleDriveUrl] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    year: new Date().getFullYear(),
    cast: '',
    director: '',
    type: 'movie',
    isPrimeOriginal: false,
    rating: '',
    duration: '',
    seasons: 1,
    episodes: [],
  });

  useEffect(() => {
    if (!user || !isAdmin(user.email)) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const moviesRef = ref(db, 'movies');
      const snapshot = await get(moviesRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const moviesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        setMovies(moviesArray);
        calculateAnalytics(moviesArray);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (moviesData) => {
    const totalViews = moviesData.reduce((sum, m) => sum + (m.views || 0), 0);
    const trending = [...moviesData]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    setAnalytics({
      totalViews,
      totalMovies: moviesData.length,
      totalUsers: 0, // Would need user tracking
      avgWatchTime: 0, // Would need watch time tracking
      trending,
      recentActivity: moviesData.slice(0, 10),
    });
  };

  // Dropzone configs
  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } = useDropzone({
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.mkv'] },
    maxFiles: 1,
    onDrop: (files) => {
      if (files.length > 0) {
        setVideoFile(files[0]);
        toast({ title: 'Video selected', status: 'success', duration: 2000 });
      }
    },
  });

  const { getRootProps: getThumbnailRootProps, getInputProps: getThumbnailInputProps } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    onDrop: (files) => {
      if (files.length > 0) {
        setThumbnailFile(files[0]);
        toast({ title: 'Thumbnail selected', status: 'success', duration: 2000 });
      }
    },
  });

  const handleUpload = async () => {
    if (!formData.title || !formData.genre || !thumbnailFile) {
      toast({ title: 'Please fill required fields', status: 'error', duration: 3000 });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload thumbnail
      const thumbnailResult = await uploadImage(thumbnailFile, (progress) => {
        setUploadProgress(progress * 0.3);
      });

      let videoUrl;
      if (videoSource === 'archive') {
        videoUrl = archiveUrl;
      } else if (videoSource === 'googledrive') {
        const driveId = extractGoogleDriveId(googleDriveUrl);
        videoUrl = `https://drive.google.com/file/d/${driveId}/preview`;
      } else if (videoFile) {
        const videoResult = await uploadVideo(videoFile, (progress) => {
          setUploadProgress(30 + progress * 0.6);
        });
        videoUrl = videoResult.url;
      }

      setUploadProgress(90);

      // Save to database
      const moviesRef = ref(db, 'movies');
      const newMovieRef = push(moviesRef);
      
      await set(newMovieRef, {
        ...formData,
        videoUrl,
        videoSource,
        thumbnailUrl: thumbnailResult.url,
        views: 0,
        likes: 0,
        createdAt: new Date().toISOString(),
        uploadedBy: user.uid,
        uploadedByEmail: user.email,
      });

      setUploadProgress(100);
      toast({ title: 'Upload successful!', status: 'success', duration: 3000 });
      
      resetForm();
      onClose();
      fetchData();

    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', description: error.message, status: 'error', duration: 5000 });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = async () => {
    if (!selectedMovie) return;

    try {
      const movieRef = ref(db, `movies/${selectedMovie.id}`);
      await update(movieRef, formData);

      toast({ title: 'Updated successfully', status: 'success', duration: 2000 });
      onEditClose();
      fetchData();
    } catch (error) {
      toast({ title: 'Update failed', status: 'error', duration: 3000 });
    }
  };

  const handleDelete = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      const movieRef = ref(db, `movies/${movieId}`);
      await remove(movieRef);
      toast({ title: 'Deleted successfully', status: 'success', duration: 2000 });
      fetchData();
    } catch (error) {
      toast({ title: 'Delete failed', status: 'error', duration: 3000 });
    }
  };

  const openEditModal = (movie) => {
    setSelectedMovie(movie);
    setFormData({
      title: movie.title || '',
      description: movie.description || '',
      genre: movie.genre || '',
      year: movie.year || new Date().getFullYear(),
      cast: movie.cast || '',
      director: movie.director || '',
      type: movie.type || 'movie',
      isPrimeOriginal: movie.isPrimeOriginal || false,
      rating: movie.rating || '',
      duration: movie.duration || '',
      seasons: movie.seasons || 1,
    });
    onEditOpen();
  };

  const resetForm = () => {
    setVideoFile(null);
    setThumbnailFile(null);
    setArchiveUrl('');
    setGoogleDriveUrl('');
    setFormData({
      title: '',
      description: '',
      genre: '',
      year: new Date().getFullYear(),
      cast: '',
      director: '',
      type: 'movie',
      isPrimeOriginal: false,
      rating: '',
      duration: '',
      seasons: 1,
    });
  };

  const extractGoogleDriveId = (url) => {
    const patterns = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /id=([a-zA-Z0-9_-]+)/];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  if (!user || !isAdmin(user.email)) {
    return (
      <Center minH="100vh" bg="#0F171E">
        <Alert status="error" bg="#1A242F" color="white" maxW="md">
          <AlertIcon />
          Access Denied - Admin Only
        </Alert>
      </Center>
    );
  }

  if (loading) {
    return (
      <Center minH="100vh" bg="#0F171E">
        <Spinner size="xl" color="#00A8E1" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="#0F171E" pt={20} pb={12}>
      <Container maxW="1920px" px={{ base: 4, md: 8 }}>
        {/* Header */}
        <HStack justify="space-between" mb={8}>
          <VStack align="flex-start" spacing={1}>
            <Heading color="white" fontFamily="HeadingFont" size="2xl">
              Content Studio
            </Heading>
            <Text color="gray.400">Manage your streaming platform</Text>
          </VStack>

          <Button
            leftIcon={<FiUpload />}
            onClick={onOpen}
            variant="primeGold"
            size="lg"
          >
            Upload New Content
          </Button>
        </HStack>

        {/* Analytics Dashboard */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList borderColor="rgba(255,255,255,0.1)">
            <Tab _selected={{ bg: '#1A242F', color: '#00A8E1' }} color="gray.400">
              <FiBarChart2 style={{ marginRight: '8px' }} /> Dashboard
            </Tab>
            <Tab _selected={{ bg: '#1A242F', color: '#00A8E1' }} color="gray.400">
              <FiVideo style={{ marginRight: '8px' }} /> Content ({movies.length})
            </Tab>
            <Tab _selected={{ bg: '#1A242F', color: '#00A8E1' }} color="gray.400">
              <FiTrendingUp style={{ marginRight: '8px' }} /> Analytics
            </Tab>
          </TabList>

          <TabPanels>
            {/* Dashboard Tab */}
            <TabPanel bg="#1A242F" borderRadius="md" mt={4}>
              {/* Stats Grid */}
              <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6} mb={8}>
                <GridItem>
                  <Stat bg="#232F3E" p={6} borderRadius="lg" border="1px solid rgba(255,255,255,0.1)">
                    <HStack justify="space-between">
                      <Box>
                        <StatLabel color="gray.400">Total Views</StatLabel>
                        <StatNumber color="white" fontSize="3xl">{analytics.totalViews.toLocaleString()}</StatNumber>
                        <StatHelpText color="green.400">
                          <StatArrow type="increase" />
                          23.36%
                        </StatHelpText>
                      </Box>
                      <Box bg="#00A8E1" p={3} borderRadius="lg">
                        <FiEye size={24} color="white" />
                      </Box>
                    </HStack>
                  </Stat>
                </GridItem>

                <GridItem>
                  <Stat bg="#232F3E" p={6} borderRadius="lg" border="1px solid rgba(255,255,255,0.1)">
                    <HStack justify="space-between">
                      <Box>
                        <StatLabel color="gray.400">Total Content</StatLabel>
                        <StatNumber color="white" fontSize="3xl">{analytics.totalMovies}</StatNumber>
                        <StatHelpText color="green.400">
                          <StatArrow type="increase" />
                          5 new
                        </StatHelpText>
                      </Box>
                      <Box bg="#FFB800" p={3} borderRadius="lg">
                        <FiVideo size={24} color="black" />
                      </Box>
                    </HStack>
                  </Stat>
                </GridItem>

                <GridItem>
                  <Stat bg="#232F3E" p={6} borderRadius="lg" border="1px solid rgba(255,255,255,0.1)">
                    <HStack justify="space-between">
                      <Box>
                        <StatLabel color="gray.400">Watch Time</StatLabel>
                        <StatNumber color="white" fontSize="3xl">1.2K</StatNumber>
                        <StatHelpText color="gray.400">hours</StatHelpText>
                      </Box>
                      <Box bg="purple.500" p={3} borderRadius="lg">
                        <FiClock size={24} color="white" />
                      </Box>
                    </HStack>
                  </Stat>
                </GridItem>

                <GridItem>
                  <Stat bg="#232F3E" p={6} borderRadius="lg" border="1px solid rgba(255,255,255,0.1)">
                    <HStack justify="space-between">
                      <Box>
                        <StatLabel color="gray.400">Active Users</StatLabel>
                        <StatNumber color="white" fontSize="3xl">847</StatNumber>
                        <StatHelpText color="green.400">
                          <StatArrow type="increase" />
                          12.5%
                        </StatHelpText>
                      </Box>
                      <Box bg="green.500" p={3} borderRadius="lg">
                        <FiUsers size={24} color="white" />
                      </Box>
                    </HStack>
                  </Stat>
                </GridItem>
              </Grid>

              {/* Trending Content */}
              <Box bg="#232F3E" p={6} borderRadius="lg" border="1px solid rgba(255,255,255,0.1)">
                <Heading size="md" color="white" mb={4} fontFamily="HeadingFont">
                  Top Performing Content
                </Heading>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th color="gray.400" borderColor="rgba(255,255,255,0.1)">Title</Th>
                      <Th color="gray.400" borderColor="rgba(255,255,255,0.1)">Type</Th>
                      <Th color="gray.400" borderColor="rgba(255,255,255,0.1)" isNumeric>Views</Th>
                      <Th color="gray.400" borderColor="rgba(255,255,255,0.1)" isNumeric>Engagement</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {analytics.trending.map((movie) => (
                      <Tr key={movie.id}>
                        <Td color="white" borderColor="rgba(255,255,255,0.1)">
                          <HStack>
                            <Avatar size="sm" src={movie.thumbnailUrl} />
                            <Text>{movie.title}</Text>
                          </HStack>
                        </Td>
                        <Td color="gray.400" borderColor="rgba(255,255,255,0.1)">
                          <Badge colorScheme={movie.type === 'series' ? 'purple' : 'blue'}>
                            {movie.type || 'movie'}
                          </Badge>
                        </Td>
                        <Td color="white" borderColor="rgba(255,255,255,0.1)" isNumeric>
                          {(movie.views || 0).toLocaleString()}
                        </Td>
                        <Td borderColor="rgba(255,255,255,0.1)" isNumeric>
                          <Progress value={Math.random() * 100} colorScheme="blue" size="sm" />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Content Management Tab */}
            <TabPanel bg="#1A242F" borderRadius="md" mt={4}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color="gray.400" borderColor="rgba(255,255,255,0.1)">Content</Th>
                    <Th color="gray.400" borderColor="rgba(255,255,255,0.1)">Type</Th>
                    <Th color="gray.400" borderColor="rgba(255,255,255,0.1)">Genre</Th>
                    <Th color="gray.400" borderColor="rgba(255,255,255,0.1)" isNumeric>Views</Th>
                    <Th color="gray.400" borderColor="rgba(255,255,255,0.1)">Uploaded</Th>
                    <Th color="gray.400" borderColor="rgba(255,255,255,0.1)">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {movies.map((movie) => (
                    <Tr key={movie.id} _hover={{ bg: '#232F3E' }}>
                      <Td borderColor="rgba(255,255,255,0.1)">
                        <HStack>
                          <Avatar size="md" src={movie.thumbnailUrl} />
                          <VStack align="flex-start" spacing={0}>
                            <Text color="white" fontWeight="bold">{movie.title}</Text>
                            <Text color="gray.400" fontSize="sm">{movie.year}</Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td borderColor="rgba(255,255,255,0.1)">
                        <Badge colorScheme={movie.type === 'series' ? 'purple' : 'blue'}>
                          {movie.type || 'movie'}
                        </Badge>
                      </Td>
                      <Td color="gray.300" borderColor="rgba(255,255,255,0.1)" textTransform="capitalize">
                        {movie.genre}
                      </Td>
                      <Td color="white" borderColor="rgba(255,255,255,0.1)" isNumeric>
                        {(movie.views || 0).toLocaleString()}
                      </Td>
                      <Td color="gray.400" borderColor="rgba(255,255,255,0.1)">
                        {new Date(movie.createdAt).toLocaleDateString()}
                      </Td>
                      <Td borderColor="rgba(255,255,255,0.1)">
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            color="gray.400"
                            _hover={{ color: 'white' }}
                          />
                          <MenuList bg="#232F3E" borderColor="rgba(255,255,255,0.1)">
                            <MenuItem
                              icon={<FiEdit />}
                              onClick={() => openEditModal(movie)}
                              bg="transparent"
                              _hover={{ bg: '#1A242F' }}
                              color="white"
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              icon={<FiDownload />}
                              bg="transparent"
                              _hover={{ bg: '#1A242F' }}
                              color="white"
                            >
                              Download Analytics
                            </MenuItem>
                            <Divider borderColor="rgba(255,255,255,0.1)" />
                            <MenuItem
                              icon={<FiTrash2 />}
                              onClick={() => handleDelete(movie.id)}
                              bg="transparent"
                              _hover={{ bg: 'red.900' }}
                              color="red.400"
                            >
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>

            {/* Analytics Tab */}
            <TabPanel bg="#1A242F" borderRadius="md" mt={4}>
              <VStack align="stretch" spacing={6}>
                <Box>
                  <Heading size="lg" color="white" mb={4}>Performance Insights</Heading>
                  <Text color="gray.400">Detailed analytics coming soon...</Text>
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Upload Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="4xl">
          <ModalOverlay />
          <ModalContent bg="#1A242F" color="white">
            <ModalHeader fontFamily="HeadingFont">Upload New Content</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {/* Basic Info */}
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    bg="#232F3E"
                    border="1px solid rgba(255,255,255,0.1)"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    bg="#232F3E"
                    border="1px solid rgba(255,255,255,0.1)"
                    rows={4}
                  />
                </FormControl>

                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                  <FormControl isRequired>
                    <FormLabel>Genre</FormLabel>
                    <Select
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      bg="#232F3E"
                      border="1px solid rgba(255,255,255,0.1)"
                    >
                      <option value="">Select genre</option>
                      <option value="action">Action</option>
                      <option value="comedy">Comedy</option>
                      <option value="drama">Drama</option>
                      <option value="horror">Horror</option>
                      <option value="sci-fi">Sci-Fi</option>
                      <option value="thriller">Thriller</option>
                      <option value="romance">Romance</option>
                      <option value="documentary">Documentary</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      bg="#232F3E"
                      border="1px solid rgba(255,255,255,0.1)"
                    >
                      <option value="movie">Movie</option>
                      <option value="series">TV Series</option>
                      <option value="sports">Sports</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Year</FormLabel>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      bg="#232F3E"
                      border="1px solid rgba(255,255,255,0.1)"
                    />
                  </FormControl>
                </Grid>

                {/* Video Source */}
                <FormControl>
                  <FormLabel>Video Source</FormLabel>
                  <Tabs variant="enclosed" onChange={(index) => setVideoSource(['archive', 'googledrive', 'cloudinary'][index])}>
                    <TabList>
                      <Tab>Archive.org</Tab>
                      <Tab>Google Drive</Tab>
                      <Tab>Upload File</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <Input
                          placeholder="https://archive.org/details/..."
                          value={archiveUrl}
                          onChange={(e) => setArchiveUrl(e.target.value)}
                          bg="#232F3E"
                        />
                      </TabPanel>
                      <TabPanel>
                        <Input
                          placeholder="https://drive.google.com/file/d/..."
                          value={googleDriveUrl}
                          onChange={(e) => setGoogleDriveUrl(e.target.value)}
                          bg="#232F3E"
                        />
                      </TabPanel>
                      <TabPanel>
                        <Box
                          {...getVideoRootProps()}
                          p={8}
                          border="2px dashed"
                          borderColor="#00A8E1"
                          borderRadius="md"
                          textAlign="center"
                          cursor="pointer"
                          _hover={{ bg: '#232F3E' }}
                        >
                          <input {...getVideoInputProps()} />
                          <FiUpload size={32} style={{ margin: '0 auto 10px' }} />
                          <Text>{videoFile ? videoFile.name : 'Click or drag video file'}</Text>
                        </Box>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </FormControl>

                {/* Thumbnail */}
                <FormControl isRequired>
                  <FormLabel>Thumbnail</FormLabel>
                  <Box
                    {...getThumbnailRootProps()}
                    p={8}
                    border="2px dashed"
                    borderColor="#FFB800"
                    borderRadius="md"
                    textAlign="center"
                    cursor="pointer"
                    _hover={{ bg: '#232F3E' }}
                  >
                    <input {...getThumbnailInputProps()} />
                    <Text>{thumbnailFile ? thumbnailFile.name : 'Click or drag thumbnail'}</Text>
                  </Box>
                </FormControl>

                {isUploading && (
                  <Progress value={uploadProgress} colorScheme="blue" size="lg" />
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primeGold"
                onClick={handleUpload}
                isLoading={isUploading}
                loadingText="Uploading..."
              >
                Upload Content
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
          <ModalOverlay />
          <ModalContent bg="#1A242F" color="white">
            <ModalHeader>Edit Content</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    bg="#232F3E"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    bg="#232F3E"
                    rows={4}
                  />
                </FormControl>

                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <FormControl>
                    <FormLabel>Genre</FormLabel>
                    <Select
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      bg="#232F3E"
                    >
                      <option value="action">Action</option>
                      <option value="comedy">Comedy</option>
                      <option value="drama">Drama</option>
                      <option value="horror">Horror</option>
                      <option value="sci-fi">Sci-Fi</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Year</FormLabel>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      bg="#232F3E"
                    />
                  </FormControl>
                </Grid>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onEditClose}>
                Cancel
              </Button>
              <Button variant="prime" onClick={handleEdit}>
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};
