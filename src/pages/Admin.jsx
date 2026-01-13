import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Progress,
  Text,
  useToast,
  Heading,
  Select,
  HStack,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { uploadVideo, uploadImage } from '../services/cloudinaryService';
import { ref, push, set } from 'firebase/database';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../config/admins';

export const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Color mode values
  const bg = useColorModeValue('white', 'black');
  const cardBg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.800');
  const inputBg = useColorModeValue('gray.50', 'gray.800');
  const buttonBg = useColorModeValue('black', 'white');
  const buttonColor = useColorModeValue('white', 'black');
  const buttonHoverBg = useColorModeValue('gray.800', 'gray.200');

  // Video source state
  const [videoSource, setVideoSource] = useState('archive');
  
  // File states
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  
  // URL states
  const [archiveUrl, setArchiveUrl] = useState('');
  const [googleDriveUrl, setGoogleDriveUrl] = useState('');
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [cast, setCast] = useState('');
  const [director, setDirector] = useState('');
  
  // Upload states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  // Admin protection
  if (!user) {
    navigate('/login');
    return null;
  }

  if (!isAdmin(user.email)) {
    return (
      <Box minH="100vh" pt={24} display="flex" alignItems="center" justifyContent="center" px={4} bg={bg}>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          maxW="500px"
          p={8}
          borderRadius="lg"
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
        >
          <AlertIcon boxSize="60px" mr={0} />
          <AlertTitle mt={4} mb={2} fontSize="2xl">
            🚫 Access Denied
          </AlertTitle>
          <AlertDescription maxWidth="sm" fontSize="md" color="gray.500">
            This page is restricted to administrators only.
          </AlertDescription>
          <VStack spacing={3} mt={6}>
            <Text fontSize="sm" color="gray.400">
              Signed in as: {user.email}
            </Text>
            <Button
              onClick={() => navigate('/')}
            >
              Go to Home
            </Button>
          </VStack>
        </Alert>
      </Box>
    );
  }

  // Helper functions
  const extractGoogleDriveId = (url) => {
    if (!url) return null;
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/open\?id=([a-zA-Z0-9_-]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const isValidGoogleDriveUrl = (url) => {
    return extractGoogleDriveId(url) !== null;
  };

  const isValidArchiveUrl = (url) => {
    return url && url.includes('archive.org');
  };

  // Dropzone configurations
  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    },
    maxFiles: 1,
    maxSize: 100000000,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setVideoFile(acceptedFiles[0]);
        toast({
          title: 'Video selected',
          description: `${acceptedFiles[0].name}`,
          status: 'success',
          duration: 2000,
        });
      }
    },
  });

  const { getRootProps: getThumbnailRootProps, getInputProps: getThumbnailInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 10000000,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setThumbnailFile(acceptedFiles[0]);
        toast({
          title: 'Thumbnail selected',
          status: 'success',
          duration: 2000,
        });
      }
    },
  });

  // Upload handler
  const handleUpload = async () => {
    if (!title || !genre || !thumbnailFile) {
      toast({
        title: 'Missing information',
        description: 'Please fill in title, genre, and thumbnail',
        status: 'error',
        duration: 4000,
      });
      return;
    }

    if (videoSource === 'archive') {
      if (!archiveUrl || !isValidArchiveUrl(archiveUrl)) {
        toast({
          title: 'Invalid Archive.org link',
          status: 'error',
          duration: 4000,
        });
        return;
      }
    } else if (videoSource === 'googledrive') {
      if (!googleDriveUrl || !isValidGoogleDriveUrl(googleDriveUrl)) {
        toast({
          title: 'Invalid Google Drive link',
          status: 'error',
          duration: 4000,
        });
        return;
      }
    } else if (videoSource === 'cloudinary') {
      if (!videoFile) {
        toast({
          title: 'No video selected',
          status: 'error',
          duration: 4000,
        });
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      setCurrentStep('Uploading thumbnail...');
      const thumbnailResult = await uploadImage(thumbnailFile, (progress) => {
        setUploadProgress(progress * 0.3);
      });

      if (!thumbnailResult.success) {
        throw new Error('Thumbnail upload failed');
      }

      setUploadProgress(40);

      let videoUrl;
      let duration = 0;
      let finalVideoSource;

      if (videoSource === 'archive') {
        setCurrentStep('Processing Archive.org link...');
        videoUrl = archiveUrl;
        finalVideoSource = 'archive';
        setUploadProgress(90);
      } else if (videoSource === 'googledrive') {
        setCurrentStep('Processing Google Drive link...');
        const driveId = extractGoogleDriveId(googleDriveUrl);
        videoUrl = `https://drive.google.com/file/d/${driveId}/preview`;
        finalVideoSource = 'googledrive';
        setUploadProgress(90);
      } else {
        setCurrentStep('Uploading video...');
        const videoResult = await uploadVideo(videoFile, (progress) => {
          setUploadProgress(40 + (progress * 0.5));
        });

        if (!videoResult.success) {
          throw new Error('Video upload failed');
        }

        videoUrl = videoResult.url;
        duration = videoResult.duration || 0;
        finalVideoSource = 'cloudinary';
        setUploadProgress(90);
      }

      setCurrentStep('Saving to database...');
      
      const moviesRef = ref(db, 'movies');
      const newMovieRef = push(moviesRef);
      
      await set(newMovieRef, {
        title: title.trim(),
        description: description.trim(),
        genre,
        year: parseInt(year) || new Date().getFullYear(),
        cast: cast.trim(),
        director: director.trim(),
        videoUrl,
        videoSource: finalVideoSource,
        thumbnailUrl: thumbnailResult.url,
        duration,
        views: 0,
        likes: 0,
        createdAt: new Date().toISOString(),
        uploadedBy: user.uid,
        uploadedByEmail: user.email,
      });

      setUploadProgress(100);
      setCurrentStep('✅ Complete!');

      toast({
        title: 'Success!',
        description: `${title} uploaded successfully`,
        status: 'success',
        duration: 5000,
      });

      setTimeout(() => {
        setVideoFile(null);
        setThumbnailFile(null);
        setArchiveUrl('');
        setGoogleDriveUrl('');
        setTitle('');
        setDescription('');
        setGenre('');
        setYear('');
        setCast('');
        setDirector('');
        setUploadProgress(0);
        setCurrentStep('');
        setIsUploading(false);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentStep('');
    }
  };

  return (
    <Box minH="100vh" pt={24} pb={12} px={4} bg={bg}>
      <Box maxW="900px" mx="auto">
        <HStack justify="space-between" align="center" mb={2}>
          <Heading size="2xl" fontFamily="CustomLogo">
            Upload Content
          </Heading>
          <Badge colorScheme="green" fontSize="md" px={3} py={1}>
            ✓ Admin
          </Badge>
        </HStack>
        
        <Text color="gray.500" mb={8}>
          100% Free hosting options - choose your preferred method
        </Text>

        <VStack spacing={6} align="stretch">
          {/* Title */}
          <FormControl isRequired>
            <FormLabel fontSize="lg">Title *</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              bg={inputBg}
              border="1px solid"
              borderColor={borderColor}
              size="lg"
            />
          </FormControl>

          {/* Description */}
          <FormControl isRequired>
            <FormLabel fontSize="lg">Description *</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write description..."
              rows={4}
              bg={inputBg}
              border="1px solid"
              borderColor={borderColor}
            />
          </FormControl>

          {/* Genre and Year */}
          <HStack spacing={4}>
            <FormControl isRequired flex={1}>
              <FormLabel fontSize="lg">Genre *</FormLabel>
              <Select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Select genre"
                bg={inputBg}
                border="1px solid"
                borderColor={borderColor}
                size="lg"
              >
                <option value="action">Action</option>
                <option value="comedy">Comedy</option>
                <option value="drama">Drama</option>
                <option value="horror">Horror</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="thriller">Thriller</option>
                <option value="romance">Romance</option>
                <option value="documentary">Documentary</option>
                <option value="animation">Animation</option>
              </Select>
            </FormControl>

            <FormControl flex={1}>
              <FormLabel fontSize="lg">Year</FormLabel>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                bg={inputBg}
                border="1px solid"
                borderColor={borderColor}
                size="lg"
              />
            </FormControl>
          </HStack>

          {/* Cast and Director */}
          <HStack spacing={4}>
            <FormControl flex={1}>
              <FormLabel fontSize="lg">Cast</FormLabel>
              <Input
                value={cast}
                onChange={(e) => setCast(e.target.value)}
                placeholder="Actor 1, Actor 2"
                bg={inputBg}
                border="1px solid"
                borderColor={borderColor}
                size="lg"
              />
            </FormControl>

            <FormControl flex={1}>
              <FormLabel fontSize="lg">Director</FormLabel>
              <Input
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="Director name"
                bg={inputBg}
                border="1px solid"
                borderColor={borderColor}
                size="lg"
              />
            </FormControl>
          </HStack>

          {/* Video Source Tabs */}
          <FormControl isRequired>
            <FormLabel fontSize="lg" mb={3}>
              Video Source * (All 100% Free)
            </FormLabel>
            <Tabs
              variant="enclosed"
              index={
                videoSource === 'archive' ? 0 : 
                videoSource === 'googledrive' ? 1 : 2
              }
              onChange={(index) => 
                setVideoSource(
                  index === 0 ? 'archive' : 
                  index === 1 ? 'googledrive' : 'cloudinary'
                )
              }
            >
              <TabList borderColor={borderColor}>
                <Tab _selected={{ bg: cardBg, borderColor: borderColor }}>
                  📚 Archive.org ⭐
                </Tab>
                <Tab _selected={{ bg: cardBg, borderColor: borderColor }}>
                  🔗 Google Drive
                </Tab>
                <Tab _selected={{ bg: cardBg, borderColor: borderColor }}>
                  ☁️ Cloudinary
                </Tab>
              </TabList>

              <TabPanels>
                {/* Archive.org Tab */}
                <TabPanel px={0} pt={4}>
                  <VStack align="stretch" spacing={3}>
                    <Alert status="success" borderRadius="md" border="1px solid" borderColor={borderColor}>
                      <AlertIcon />
                      <Box fontSize="sm">
                        <Text fontWeight="bold" mb={2}>🎉 BEST - 100% FREE FOREVER:</Text>
                        <Text>✅ Unlimited storage & bandwidth</Text>
                        <Text>✅ No file size limits</Text>
                        <Text>✅ No branding - full control</Text>
                      </Box>
                    </Alert>

                    <Input
                      value={archiveUrl}
                      onChange={(e) => setArchiveUrl(e.target.value)}
                      placeholder="Paste any archive.org link"
                      bg={inputBg}
                      border="1px solid"
                      borderColor={borderColor}
                      size="lg"
                    />

                    {archiveUrl && (
                      <Alert 
                        status={isValidArchiveUrl(archiveUrl) ? "success" : "error"} 
                        borderRadius="md"
                      >
                        <AlertIcon />
                        <Text fontSize="sm">
                          {isValidArchiveUrl(archiveUrl) 
                            ? "✓ Valid Archive.org URL" 
                            : "✗ Invalid link"}
                        </Text>
                      </Alert>
                    )}
                  </VStack>
                </TabPanel>

                {/* Google Drive Tab */}
                <TabPanel px={0} pt={4}>
                  <VStack align="stretch" spacing={3}>
                    <Input
                      value={googleDriveUrl}
                      onChange={(e) => setGoogleDriveUrl(e.target.value)}
                      placeholder="Paste Google Drive link"
                      bg={inputBg}
                      border="1px solid"
                      borderColor={borderColor}
                      size="lg"
                    />

                    {googleDriveUrl && (
                      <Alert 
                        status={isValidGoogleDriveUrl(googleDriveUrl) ? "success" : "error"} 
                        borderRadius="md"
                      >
                        <AlertIcon />
                        <Text fontSize="sm">
                          {isValidGoogleDriveUrl(googleDriveUrl) 
                            ? `✓ Valid (ID: ${extractGoogleDriveId(googleDriveUrl)})` 
                            : "✗ Invalid link"}
                        </Text>
                      </Alert>
                    )}
                  </VStack>
                </TabPanel>

                {/* Cloudinary Tab */}
                <TabPanel px={0} pt={4}>
                  <Box
                    {...getVideoRootProps()}
                    p={10}
                    border="2px dashed"
                    borderColor={videoFile ? borderColor : 'gray.600'}
                    borderRadius="lg"
                    textAlign="center"
                    cursor="pointer"
                    bg={inputBg}
                    _hover={{ borderColor: borderColor }}
                  >
                    <input {...getVideoInputProps()} />
                    {videoFile ? (
                      <VStack spacing={2}>
                        <Text fontSize="4xl">✅</Text>
                        <Text fontWeight="bold">
                          {videoFile.name}
                        </Text>
                      </VStack>
                    ) : (
                      <VStack spacing={2}>
                        <Text fontSize="4xl">📹</Text>
                        <Text>Drag & drop video (max 100MB)</Text>
                      </VStack>
                    )}
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </FormControl>

          {/* Thumbnail */}
          <FormControl isRequired>
            <FormLabel fontSize="lg">Thumbnail *</FormLabel>
            <Box
              {...getThumbnailRootProps()}
              p={8}
              border="2px dashed"
              borderColor={thumbnailFile ? borderColor : 'gray.600'}
              borderRadius="lg"
              textAlign="center"
              cursor="pointer"
              bg={inputBg}
              _hover={{ borderColor: borderColor }}
            >
              <input {...getThumbnailInputProps()} />
              {thumbnailFile ? (
                <VStack spacing={2}>
                  <Image
                    src={URL.createObjectURL(thumbnailFile)}
                    alt="Preview"
                    maxH="150px"
                    borderRadius="md"
                  />
                  <Text fontWeight="bold">
                    {thumbnailFile.name}
                  </Text>
                </VStack>
              ) : (
                <VStack spacing={2}>
                  <Text fontSize="4xl">🖼️</Text>
                  <Text>Drag & drop thumbnail</Text>
                </VStack>
              )}
            </Box>
          </FormControl>

          {/* Progress */}
          {isUploading && (
            <Box p={6} bg={cardBg} borderRadius="lg" border="2px solid" borderColor={borderColor}>
              <VStack spacing={3}>
                <Text fontSize="lg" fontWeight="bold">
                  {currentStep}
                </Text>
                <Progress
                  value={uploadProgress}
                  colorScheme="gray"
                  size="lg"
                  w="100%"
                  hasStripe
                  isAnimated
                />
                <Text fontSize="xl" fontWeight="bold">
                  {Math.round(uploadProgress)}%
                </Text>
              </VStack>
            </Box>
          )}

          {/* Upload Button */}
          <Button
            bg={buttonBg}
            color={buttonColor}
            size="lg"
            h="60px"
            fontSize="lg"
            onClick={handleUpload}
            isLoading={isUploading}
            _hover={{ bg: buttonHoverBg, transform: 'translateY(-2px)' }}
            _active={{ transform: 'translateY(0)' }}
            isDisabled={
              !title || !genre || !thumbnailFile ||
              (videoSource === 'archive' && !isValidArchiveUrl(archiveUrl)) ||
              (videoSource === 'googledrive' && !isValidGoogleDriveUrl(googleDriveUrl)) ||
              (videoSource === 'cloudinary' && !videoFile)
            }
          >
            🚀 Upload Content
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};
