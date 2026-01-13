import { Box, Image, Text, VStack, Badge, IconButton, useColorMode, HStack, Tooltip, Button } from '@chakra-ui/react';
import { FiPlay, FiPlus, FiCheck, FiInfo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';

const MotionBox = motion(Box);

export const MovieCard = ({ movie, onClick, onAddToList, isInList }) => {
  const { colorMode } = useColorMode();
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Set new timeout for preview
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPreview(true);
    }, 800);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowPreview(false);
    
    // Clear timeout on leave
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) onClick();
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToList) onAddToList(movie);
  };

  return (
    <MotionBox
      position="relative"
      borderRadius="xl"
      overflow="visible"
      cursor="pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05, zIndex: 100 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Card Container */}
      <Box
        position="relative"
        borderRadius="xl"
        overflow="hidden"
        boxShadow={isHovered ? '0 20px 60px rgba(0,0,0,0.5)' : 'none'}
        onClick={handleCardClick}
      >
        {/* Image Container - 16:9 Aspect Ratio */}
        <Box position="relative" paddingBottom="56.25%">
          <Image
            src={movie.thumbnailUrl}
            alt={movie.title}
            position="absolute"
            inset={0}
            w="100%"
            h="100%"
            objectFit="cover"
            transition="transform 0.3s"
            transform={isHovered ? 'scale(1.1)' : 'scale(1)'}
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <Box
            position="absolute"
            inset={0}
            bgGradient="linear(to-t, rgba(0,0,0,0.95), transparent 50%)"
            opacity={isHovered ? 1 : 0.7}
            transition="opacity 0.3s"
          />

          {/* Content */}
          <VStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            p={4}
            spacing={2}
            align="stretch"
            opacity={isHovered ? 1 : 0.9}
            transition="opacity 0.3s"
          >
            {/* Title */}
            <Text color="white" fontWeight="900" fontSize="md" noOfLines={2} textShadow="0 2px 8px rgba(0,0,0,0.8)">
              {movie.title}
            </Text>

            {/* Quick Info */}
            <HStack spacing={2} fontSize="xs" flexWrap="wrap">
              {movie.year && (
                <Badge bg="whiteAlpha.300" color="white" fontSize="10px">
                  {movie.year}
                </Badge>
              )}
              {movie.rating && (
                <Badge bg="whiteAlpha.300" color="white" fontSize="10px">
                  {movie.rating}
                </Badge>
              )}
              {movie.genre && (
                <Badge bg="whiteAlpha.300" color="white" textTransform="capitalize" fontSize="10px">
                  {movie.genre}
                </Badge>
              )}
            </HStack>

            {/* Hover Actions */}
            {isHovered && (
              <MotionBox initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <HStack spacing={2}>
                  <Tooltip label="Play">
                    <IconButton
                      icon={<FiPlay />}
                      aria-label="Play"
                      size="sm"
                      variant="solid"
                      onClick={handleCardClick}
                      flex={1}
                      fontWeight="700"
                    />
                  </Tooltip>
                  <Tooltip label={isInList ? 'Remove from Watchlist' : 'Add to Watchlist'}>
                    <IconButton
                      icon={isInList ? <FiCheck /> : <FiPlus />}
                      aria-label={isInList ? 'Remove' : 'Add'}
                      size="sm"
                      variant="outline"
                      colorScheme="whiteAlpha"
                      onClick={handleAddClick}
                    />
                  </Tooltip>
                </HStack>
              </MotionBox>
            )}
          </VStack>
        </Box>
      </Box>

      {/* Extended Preview - Prime Video Style */}
      <AnimatePresence>
        {showPreview && (
          <MotionBox
            position="absolute"
            top="100%"
            left={0}
            right={0}
            bg={colorMode === 'dark' ? 'rgba(0,0,0,0.98)' : 'rgba(255,255,255,0.98)'}
            backdropFilter="blur(20px)"
            borderBottomRadius="xl"
            p={4}
            mt={1}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            boxShadow="0 10px 40px rgba(0,0,0,0.5)"
            onClick={(e) => e.stopPropagation()}
            zIndex={101}
          >
            <VStack align="stretch" spacing={3}>
              {/* Description */}
              {movie.description && (
                <Text fontSize="xs" opacity={0.85} noOfLines={3} lineHeight="tall">
                  {movie.description}
                </Text>
              )}

              {/* Meta Info */}
              <HStack spacing={4} fontSize="xs" opacity={0.7} flexWrap="wrap">
                {movie.duration && <Text fontWeight="700">{movie.duration}</Text>}
                {movie.views > 0 && <Text>{movie.views.toLocaleString()} views</Text>}
                {movie.likes > 0 && <Text>{movie.likes.toLocaleString()} likes</Text>}
              </HStack>

              {/* Cast/Director */}
              {(movie.director || movie.cast) && (
                <VStack align="stretch" spacing={1}>
                  {movie.director && (
                    <Text fontSize="xs" opacity={0.7}>
                      <Text as="span" fontWeight="700">
                        Director:
                      </Text>{' '}
                      {movie.director}
                    </Text>
                  )}
                  {movie.cast && (
                    <Text fontSize="xs" opacity={0.7} noOfLines={1}>
                      <Text as="span" fontWeight="700">
                        Cast:
                      </Text>{' '}
                      {movie.cast}
                    </Text>
                  )}
                </VStack>
              )}

              {/* More Info Button */}
              <Button size="xs" variant="outline" leftIcon={<FiInfo />} onClick={handleCardClick} fontWeight="700">
                More Info
              </Button>
            </VStack>
          </MotionBox>
        )}
      </AnimatePresence>
    </MotionBox>
  );
};
