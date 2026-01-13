import { Box, Image, Text, Badge, HStack, VStack, IconButton, Tooltip } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FiPlay, FiPlus, FiCheck, FiInfo } from 'react-icons/fi';
import { useState } from 'react';

export const MovieCard = ({ movie, onAddToList, isInList }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      position="relative"
      borderRadius="md"
      overflow="hidden"
      cursor="pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      transform={isHovered ? 'scale(1.08) translateY(-8px)' : 'scale(1)'}
      boxShadow={isHovered ? '0 20px 40px rgba(0,168,225,0.3), 0 0 40px rgba(0,168,225,0.2)' : 'none'}
      zIndex={isHovered ? 10 : 1}
      h="200px"
      minW="320px"
      bg="#1A242F"
    >
      {/* Thumbnail with Blur Effect */}
      <Link to={`/movie/${movie.id}`}>
        <Box position="relative" h="100%" w="100%">
          <Image
            src={movie.thumbnailUrl || 'https://via.placeholder.com/320x200?text=No+Image'}
            alt={movie.title}
            w="100%"
            h="100%"
            objectFit="cover"
            transition="all 0.3s"
            filter={isHovered ? 'brightness(0.5) blur(2px)' : 'brightness(0.7)'}
          />
          
          {/* Prime Badge */}
          {movie.isPrime !== false && (
            <Badge
              position="absolute"
              top={2}
              left={2}
              bg="#00A8E1"
              color="white"
              px={2}
              py={1}
              fontSize="10px"
              fontWeight="bold"
            >
              prime
            </Badge>
          )}

          {/* Glow Effect on Hover */}
          {isHovered && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgGradient="linear(to-t, rgba(0,168,225,0.4), transparent)"
              pointerEvents="none"
            />
          )}
        </Box>
      </Link>

      {/* Overlay Content */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        bgGradient="linear(to-t, rgba(15,23,30,0.95), transparent)"
        p={4}
        opacity={isHovered ? 1 : 0.9}
        transition="all 0.3s"
      >
        <VStack align="stretch" spacing={2}>
          {/* Title */}
          <Text
            fontSize="md"
            fontWeight="bold"
            noOfLines={1}
            color="white"
            fontFamily="HeadingFont"
          >
            {movie.title}
          </Text>

          {/* Info */}
          <HStack spacing={2} fontSize="xs">
            {movie.year && (
              <Text color="gray.400">{movie.year}</Text>
            )}
            {movie.genre && (
              <Badge bg="rgba(255,255,255,0.1)" color="white" textTransform="capitalize">
                {movie.genre}
              </Badge>
            )}
            {movie.seasons && (
              <Badge bg="rgba(255,184,0,0.2)" color="#FFB800">
                {movie.seasons} {movie.seasons === 1 ? 'Season' : 'Seasons'}
              </Badge>
            )}
          </HStack>

          {/* Actions */}
          {isHovered && (
            <HStack spacing={2} mt={2}>
              <Tooltip label="Play Now" placement="top">
                <IconButton
                  as={Link}
                  to={`/movie/${movie.id}`}
                  icon={<FiPlay />}
                  size="sm"
                  bg="white"
                  color="black"
                  _hover={{ bg: 'gray.200', transform: 'scale(1.1)' }}
                  aria-label="Play"
                  borderRadius="full"
                />
              </Tooltip>
              
              <Tooltip label={isInList ? "Remove from Watchlist" : "Add to Watchlist"} placement="top">
                <IconButton
                  icon={isInList ? <FiCheck /> : <FiPlus />}
                  size="sm"
                  variant="outline"
                  borderColor="white"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200', transform: 'scale(1.1)' }}
                  aria-label="Watchlist"
                  borderRadius="full"
                  onClick={(e) => {
                    e.preventDefault();
                    onAddToList(movie);
                  }}
                />
              </Tooltip>

              <Tooltip label="More Info" placement="top">
                <IconButton
                  as={Link}
                  to={`/movie/${movie.id}`}
                  icon={<FiInfo />}
                  size="sm"
                  variant="outline"
                  borderColor="white"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200', transform: 'scale(1.1)' }}
                  aria-label="Info"
                  borderRadius="full"
                />
              </Tooltip>
            </HStack>
          )}
        </VStack>
      </Box>

      {/* Progress Bar */}
      {movie.progress > 0 && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="3px"
          bg="rgba(255,255,255,0.2)"
        >
          <Box
            h="100%"
            w={`${movie.progress}%`}
            bg="#00A8E1"
            boxShadow="0 0 10px rgba(0,168,225,0.8)"
          />
        </Box>
      )}
    </Box>
  );
};
