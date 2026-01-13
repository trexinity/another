import { Box, Heading, HStack, IconButton, useColorMode } from '@chakra-ui/react';
import { MovieCard } from './MovieCard';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export const MovieRow = ({ title, items, onItemClick }) => {
  const { colorMode } = useColorMode();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  return (
    <Box py={6} position="relative" onMouseEnter={checkScroll}>
      <Heading size="lg" mb={4} px={{ base: 0, md: 4 }} letterSpacing="heading">
        {title}
      </Heading>

      <Box position="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <IconButton
            icon={<FiChevronLeft />}
            position="absolute"
            left={0}
            top="50%"
            transform="translateY(-50%)"
            zIndex={2}
            onClick={() => scroll('left')}
            variant="solid"
            size="lg"
            borderRadius="full"
            opacity={0.9}
            _hover={{ opacity: 1 }}
            aria-label="Scroll left"
          />
        )}

        {/* Content */}
        <Box
          ref={scrollRef}
          display="flex"
          gap={4}
          overflowX="auto"
          overflowY="hidden"
          css={{
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
          px={{ base: 0, md: 4 }}
        >
          {items.map((item) => (
            <Box key={item.id} minW={{ base: '180px', md: '220px', lg: '260px' }}>
              <MovieCard movie={item} onClick={() => onItemClick(item)} />
            </Box>
          ))}
        </Box>

        {/* Right Arrow */}
        {canScrollRight && (
          <IconButton
            icon={<FiChevronRight />}
            position="absolute"
            right={0}
            top="50%"
            transform="translateY(-50%)"
            zIndex={2}
            onClick={() => scroll('right')}
            variant="solid"
            size="lg"
            borderRadius="full"
            opacity={0.9}
            _hover={{ opacity: 1 }}
            aria-label="Scroll right"
          />
        )}
      </Box>
    </Box>
  );
};
