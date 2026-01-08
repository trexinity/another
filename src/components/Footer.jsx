import { Box, Container, HStack, VStack, Text, Link, SimpleGrid } from '@chakra-ui/react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

export const Footer = () => {
  return (
    <Box bg="brand.black" py={12} mt={20} borderTop="1px solid" borderColor="gray.800">
      <Container maxW="1400px">
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8} mb={8}>
          <VStack align="start" spacing={3}>
            <Text fontWeight="bold" fontSize="lg" color="brand.primary">
              ANOTHER
            </Text>
            <Text fontSize="sm" color="gray.400">
              Your premium streaming platform
            </Text>
            <HStack spacing={4} mt={4}>
              <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                <FaFacebook size={24} />
              </Link>
              <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                <FaTwitter size={24} />
              </Link>
              <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                <FaInstagram size={24} />
              </Link>
              <Link href="#" color="gray.400" _hover={{ color: 'white' }}>
                <FaYoutube size={24} />
              </Link>
            </HStack>
          </VStack>

          <VStack align="start" spacing={2}>
            <Text fontWeight="bold" mb={2}>Company</Text>
            <Link fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>About Us</Link>
            <Link fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Careers</Link>
            <Link fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Press</Link>
            <Link fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Blog</Link>
          </VStack>

          <VStack align="start" spacing={2}>
            <Text fontWeight="bold" mb={2}>Support</Text>
            <Link fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Help Center</Link>
            <Link fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Contact Us</Link>
            <Link fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>FAQ</Link>
            <Link fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Account</Link>
          </VStack>

          <VStack align="start" spacing={2}>
            <Text fontWeight="bold" mb={2}>Legal</Text>
            <Link fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Privacy Policy</Link>
            <Link fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Terms of Service</Link>
            <Link fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Cookie Policy</Link>
            <Link fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>Legal Notices</Link>
          </VStack>
        </SimpleGrid>

        <Box borderTop="1px solid" borderColor="gray.800" pt={6}>
          <Text textAlign="center" fontSize="sm" color="gray.500">
            © 2026 ANOTHER. All rights reserved.
          </Text>
        </Box>
      </Container>
    </Box>
  );
};
