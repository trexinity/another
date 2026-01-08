import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  Spinner,
  Image,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase';

export const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const moviesRef = ref(db, 'movies');
        const snapshot = await get(moviesRef);

        if (snapshot.exists()) {
          const moviesData = Object.values(snapshot.val());
          
          const genreMap = {};
          moviesData.forEach((movie) => {
            if (!genreMap[movie.genre]) {
              genreMap[movie.genre] = {
                name: movie.genre,
                count: 0,
                thumbnail: movie.thumbnailUrl,
              };
            }
            genreMap[movie.genre].count++;
          });

          setCategories(Object.values(genreMap));
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" pt={24}>
        <Spinner size="xl" color="brand.primary" thickness="4px" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" pt={24} pb={12} bg="brand.background">
      <Container maxW="1400px">
        <Heading mb={8} size="2xl">
          Browse by Category
        </Heading>

        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={6}>
          {categories.map((category) => (
            <Box
              key={category.name}
              cursor="pointer"
              onClick={() => navigate(`/browse?genre=${category.name}`)}
              position="relative"
              h="200px"
              borderRadius="lg"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{
                transform: 'scale(1.05)',
                boxShadow: '0 8px 30px rgba(229, 9, 20, 0.5)',
              }}
            >
              <Image
                src={category.thumbnail}
                alt={category.name}
                w="100%"
                h="100%"
                objectFit="cover"
              />
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="linear-gradient(to top, rgba(0,0,0,0.9), transparent)"
                display="flex"
                alignItems="flex-end"
                p={4}
              >
                <VStack align="start" spacing={1}>
                  <Text fontSize="xl" fontWeight="bold" textTransform="capitalize">
                    {category.name}
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    {category.count} titles
                  </Text>
                </VStack>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};
