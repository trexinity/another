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

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [cast, setCast] = useState('');
  const [director, setDirector] = useState('');
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  // ========================================
  // ADMIN PROTECTION
  // ========================================
  if (!user) {
    navigate('/login');
    return null;
  }

  if (!isAdmin(user.email)) {
    return (
      <Box minH="100vh" pt={24} display="flex" alignItems="center" justifyContent="center" px={4}>
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
          bg="red.900"
          bgOpacity={0.2}
          border="1px solid"
          borderColor="red.700"
        >
          <AlertIcon boxSize="60px" mr={0} color="red.500" />
          <AlertTitle mt={4} mb={2} fontSize="2xl" color="white">
            🚫 Access Denied
          </AlertTitle>
          <AlertDescription maxWidth="sm" fontSize="md" color="gray.300">
            This page is restricted to administrators only. You need admin privileges to upload content.
          </AlertDescription>
          <VStack spacing={3} mt={6}>
            <Text fontSize="sm" color="gray.400">
              Signed in as: {user.email}
            </Text>
            <Button
              variant="primary"
              onClick={() => navigate('/')}
            >
              Go to Home
            </Button>
          </VStack>
        </Alert>
      </Box>
    );
  }
  // ========================================

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxFiles: 1,
    maxSize: 500000000,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setVideoFile(acceptedFiles[0]);
        toast({
          title: 'Video selected',
          description: acceptedFiles[0].name,
          status: 'success',
          duration: 2000,
        });
      }
    },
    onDropRejected: (fileRejections) => {
      toast({
        title: 'File rejected',
        description: fileRejections[0].errors[0].message,
        status: 'error',
        duration: 3000,
      });
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
          description: acceptedFiles[0].name,
          status: 'success',
          duration: 2000,
        });
      }
    },
  });

  const handleUpload = async () => {
    if (!videoFile || !thumbnailFile || !title || !genre) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields (marked with *)',
        status: 'error',
        duration: 4000,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      setCurrentStep('Uploading thumbnail...');
      const thumbnailResult = await uploadImage(thumbnailFile, (progress) => {
        setUploadProgress(progress * 0.2);
      });

      if (!thumbnailResult.success) {
        throw new Error('Thumbnail upload failed: ' + thumbnailResult.error);
      }

      setCurrentStep('Uploading video... This may take a few minutes');
      const videoResult = await uploadVideo(videoFile, (progress) => {
        setUploadProgress(20 + (progress * 0.7));
      });

      if (!videoResult.success) {
        throw new Error('Video upload failed: ' + videoResult.error);
      }

      setCurrentStep('Saving movie information...');
      setUploadProgress(95);

      const moviesRef = ref(db, 'movies');
      const newMovieRef = push(moviesRef);
      
      await set(newMovieRef, {
        title: title.trim(),
        description: description.trim(),
        genre,
        year: parseInt(year) || new Date().getFullYear(),
        cast: cast.trim(),
        director: director.trim(),
        videoUrl: videoResult.url,
        thumbnailUrl: thumbnailResult.url,
        duration: videoResult.duration || 0,
        views: 0,
        likes: 0,
        createdAt: new Date().toISOString(),
        uploadedBy: user.uid,
        uploadedByEmail: user.email,
      });

      setUploadProgress(100);
      setCurrentStep('Complete!');

      toast({
        title: 'Success! 🎉',
        description: `${title} has been uploaded successfully`,
        status: 'success',
        duration: 5000,
      });

      setTimeout(() => {
        setVideoFile(null);
        setThumbnailFile(null);
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
    <Box minH="100vh" pt={24} pb={12} px={4}>
      <Box maxW="900px" mx="auto">
        <HStack justify="space-between" align="center" mb={2}>
          <Heading color="brand.primary" size="2xl">
            Upload New Content
          </Heading>
          <Text fontSize="sm" color="green.400" fontWeight="bold">
            ✓ Admin Access
          </Text>
        </HStack>
        
        <Text color="brand.textGray" mb={8}>
          Add movies and shows to your streaming platform
        </Text>

        <VStack spacing={6} align="stretch">
          <FormControl isRequired>
            <FormLabel>Title *</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter movie or show title"
              bg="brand.cardBg"
              border="1px solid"
              borderColor="gray.700"
              _focus={{ borderColor: 'brand.primary' }}
              size="lg"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description *</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a brief description..."
              rows={4}
              bg="brand.cardBg"
              border="1px solid"
              borderColor="gray.700"
              _focus={{ borderColor: 'brand.primary' }}
            />
          </FormControl>

          <HStack spacing={4} align="start">
            <FormControl isRequired flex={1}>
              <FormLabel>Genre *</FormLabel>
              <Select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Select genre"
                bg="brand.cardBg"
                border="1px solid"
                borderColor="gray.700"
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
              <FormLabel>Year</FormLabel>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                bg="brand.cardBg"
                border="1px solid"
                borderColor="gray.700"
              />
            </FormControl>
          </HStack>

          <HStack spacing={4}>
            <FormControl flex={1}>
              <FormLabel>Cast</FormLabel>
              <Input
                value={cast}
                onChange={(e) => setCast(e.target.value)}
                placeholder="Actor 1, Actor 2, Actor 3"
                bg="brand.cardBg"
                border="1px solid"
                borderColor="gray.700"
              />
            </FormControl>

            <FormControl flex={1}>
              <FormLabel>Director</FormLabel>
              <Input
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="Director name"
                bg="brand.cardBg"
                border="1px solid"
                borderColor="gray.700"
              />
            </FormControl>
          </HStack>

          <FormControl isRequired>
            <FormLabel>Video File * (MP4, MOV, AVI, MKV - Max 500MB)</FormLabel>
            <Box
              {...getVideoRootProps()}
              p={10}
              border="2px dashed"
              borderColor={videoFile ? 'brand.primary' : 'gray.600'}
              borderRadius="lg"
              textAlign="center"
              cursor="pointer"
              bg="brand.cardBg"
              _hover={{ borderColor: 'brand.primary', bg: 'gray.800' }}
              transition="all 0.2s"
            >
              <input {...getVideoInputProps()} />
              {videoFile ? (
                <VStack spacing={2}>
                  <Text color="brand.primary" fontWeight="bold">
                    ✓ {videoFile.name}
                  </Text>
                  <Text fontSize="sm" color="brand.textGray">
                    {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                  <Text fontSize="xs" color="brand.textGray">
                    Click to change
                  </Text>
                </VStack>
              ) : (
                <VStack spacing={2}>
                  <Text fontSize="3xl">📹</Text>
                  <Text>Drag & drop video file here</Text>
                  <Text fontSize="sm" color="brand.textGray">
                    or click to browse
                  </Text>
                </VStack>
              )}
            </Box>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Thumbnail Image * (JPG, PNG - Max 10MB)</FormLabel>
            <Box
              {...getThumbnailRootProps()}
              p={10}
              border="2px dashed"
              borderColor={thumbnailFile ? 'brand.primary' : 'gray.600'}
              borderRadius="lg"
              textAlign="center"
              cursor="pointer"
              bg="brand.cardBg"
              _hover={{ borderColor: 'brand.primary', bg: 'gray.800' }}
              transition="all 0.2s"
            >
              <input {...getThumbnailInputProps()} />
              {thumbnailFile ? (
                <VStack spacing={2}>
                  <Image
                    src={URL.createObjectURL(thumbnailFile)}
                    alt="Thumbnail preview"
                    maxH="150px"
                    borderRadius="md"
                  />
                  <Text color="brand.primary" fontWeight="bold">
                    ✓ {thumbnailFile.name}
                  </Text>
                  <Text fontSize="xs" color="brand.textGray">
                    Click to change
                  </Text>
                </VStack>
              ) : (
                <VStack spacing={2}>
                  <Text fontSize="3xl">🖼️</Text>
                  <Text>Drag & drop thumbnail here</Text>
                  <Text fontSize="sm" color="brand.textGray">
                    or click to browse
                  </Text>
                </VStack>
              )}
            </Box>
          </FormControl>

          {isUploading && (
            <Box
              p={6}
              bg="brand.cardBg"
              borderRadius="lg"
              border="1px solid"
              borderColor="brand.primary"
            >
              <Text mb={2} fontWeight="bold">
                {currentStep}
              </Text>
              <Progress
                value={uploadProgress}
                colorScheme="red"
                size="lg"
                borderRadius="full"
                hasStripe
                isAnimated
              />
              <Text mt={2} textAlign="center" fontSize="xl" fontWeight="bold">
                {Math.round(uploadProgress)}%
              </Text>
            </Box>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={handleUpload}
            isLoading={isUploading}
            loadingText="Uploading..."
            isDisabled={!videoFile || !thumbnailFile || !title || !genre}
          >
            Upload Content
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};
