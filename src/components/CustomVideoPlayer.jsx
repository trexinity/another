import { Box, Spinner, Center, Text, Button, VStack } from '@chakra-ui/react';
import { useState } from 'react';

export const CustomVideoPlayer = ({ videoUrl, videoSource, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Extract Google Drive ID
  const extractGoogleDriveId = (url) => {
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setRetryCount(retryCount + 1);
  };

  // Google Drive - Use iframe
  if (videoSource === 'googledrive') {
    const driveId = extractGoogleDriveId(videoUrl);
    
    return (
      <Box
        w="100%"
        position="relative"
        bg="black"
        borderRadius="lg"
        overflow="hidden"
        minH="500px"
      >
        {loading && (
          <Center
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="black"
            zIndex={2}
          >
            <Spinner size="xl" color="red.600" thickness="4px" />
          </Center>
        )}

        <Box
          as="iframe"
          src={driveId ? `https://drive.google.com/file/d/${driveId}/preview` : videoUrl}
          w="100%"
          h="500px"
          border="none"
          allow="autoplay; fullscreen"
          allowFullScreen
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />

        {error && (
          <Center
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="black"
            flexDirection="column"
            zIndex={3}
          >
            <Text color="red.400" fontSize="lg" mb={2}>
              Failed to load from Google Drive
            </Text>
            <Text color="gray.400" fontSize="sm">
              Make sure video is shared as "Anyone with the link"
            </Text>
          </Center>
        )}
      </Box>
    );
  }

  // Archive.org and Cloudinary - Use HTML5 video with better error handling
  return (
    <Box
      w="100%"
      position="relative"
      bg="black"
      borderRadius="lg"
      overflow="hidden"
      minH="500px"
    >
      {loading && !error && (
        <Center
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="black"
          zIndex={2}
        >
          <VStack spacing={3}>
            <Spinner size="xl" color="red.600" thickness="4px" />
            <Text color="gray.400" fontSize="sm">
              Loading video...
            </Text>
          </VStack>
        </Center>
      )}

      {error && (
        <Center
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="black"
          flexDirection="column"
          zIndex={3}
          p={6}
        >
          <Text color="red.400" fontSize="xl" mb={2} fontWeight="bold">
            ⚠️ Failed to Load Video
          </Text>
          <Text color="gray.300" fontSize="md" mb={4} textAlign="center">
            Could not load the video from this URL
          </Text>
          
          <VStack spacing={2} mb={4} align="start" bg="gray.900" p={4} borderRadius="md" w="100%" maxW="500px">
            <Text color="gray.400" fontSize="sm" fontWeight="bold">
              Common Issues:
            </Text>
            <Text color="gray.400" fontSize="xs">
              • Archive.org: Make sure it's a direct .mp4 download link
            </Text>
            <Text color="gray.400" fontSize="xs">
              • Check if video is publicly accessible
            </Text>
            <Text color="gray.400" fontSize="xs">
              • Try opening the link in a new tab first
            </Text>
          </VStack>

          <Text color="gray.500" fontSize="xs" mb={3} fontFamily="monospace" wordBreak="break-all" maxW="90%">
            URL: {videoUrl}
          </Text>

          <HStack spacing={3}>
            <Button
              size="sm"
              colorScheme="red"
              onClick={handleRetry}
            >
              🔄 Retry
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() => window.open(videoUrl, '_blank')}
            >
              🔗 Open URL Directly
            </Button>
          </HStack>
        </Center>
      )}

      {/* HTML5 Video Player */}
      <Box
        as="video"
        key={retryCount} // Force re-render on retry
        w="100%"
        h="auto"
        minH="500px"
        controls
        preload="metadata"
        bg="black"
        onCanPlay={() => {
          setLoading(false);
          setError(false);
        }}
        onLoadedData={() => {
          setLoading(false);
          setError(false);
        }}
        onError={(e) => {
          console.error('Video error:', e);
          setLoading(false);
          setError(true);
        }}
        controlsList="nodownload"
        playsInline
        style={{
          display: error ? 'none' : 'block',
        }}
      >
        {/* Try multiple sources */}
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        <source src={videoUrl} type="video/ogg" />
        
        {/* Fallback message */}
        <Text color="white" p={4}>
          Your browser does not support HTML5 video.
        </Text>
      </Box>
    </Box>
  );
};
