import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Link,
  HStack,
  Divider,
  useColorMode,
  IconButton,
} from '@chakra-ui/react';
import { FiGithub, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';

export const Footer = () => {
  const { colorMode } = useColorMode();

  const currentYear = new Date().getFullYear();

  return (
    <Box
      as="footer"
      borderTop="1px solid"
      borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200'}
      mt={20}
    >
      <Container maxW="1920px" py={12} px={{ base: 4, md: 12 }}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          {/* Brand */}
          <Stack spacing={4}>
            <Text fontSize="2xl" fontWeight="black" fontFamily="logo" letterSpacing="logo">
              another
            </Text>
            <Text fontSize="sm" opacity={0.7}>
              Your premium streaming destination for movies and series.
            </Text>
            <HStack spacing={2}>
              <IconButton icon={<FiGithub />} variant="ghost" size="sm" aria-label="GitHub" />
              <IconButton icon={<FiTwitter />} variant="ghost" size="sm" aria-label="Twitter" />
              <IconButton icon={<FiInstagram />} variant="ghost" size="sm" aria-label="Instagram" />
              <IconButton icon={<FiMail />} variant="ghost" size="sm" aria-label="Email" />
            </HStack>
          </Stack>

          {/* Quick Links */}
          <Stack spacing={3}>
            <Text fontWeight="900" fontSize="sm" textTransform="uppercase" opacity={0.7}>
              Quick Links
            </Text>
            <Link fontSize="sm" _hover={{ opacity: 0.7 }}>
              Home
            </Link>
            <Link fontSize="sm" _hover={{ opacity: 0.7 }}>
              Movies
            </Link>
            <Link fontSize="sm" _hover={{ opacity: 0.7 }}>
              Series
            </Link>
            <Link fontSize="sm" _hover={{ opacity: 0.7 }}>
              My Watchlist
            </Link>
          </Stack>

          {/* Legal */}
          <Stack spacing={3}>
            <Text fontWeight="900" fontSize="sm" textTransform="uppercase" opacity={0.7}>
              Legal
            </Text>
            <Link fontSize="sm" _hover={{ opacity: 0.7 }}>
              Privacy Policy
            </Link>
            <Link fontSize="sm" _hover={{ opacity: 0.7 }}>
              Terms of Service
            </Link>
            <Link fontSize="sm" _hover={{ opacity: 0.7 }}>
              Cookie Policy
            </Link>
            <Link fontSize="sm" _hover={{ opacity: 0.7 }}>
              DMCA
            </Link>
          </Stack>

          {/* Support */}
          <Stack spacing={3}>
            <Text fontWeight="900" fontSize="sm" textTransform="uppercase" opacity={0.7}>
              Support
            </Text>
            <Link fontSize="sm" _hover={{ opacity: 0.7 }}>
              Help Center
            </Link>
            <Link fontSize="sm" _hover={{ opacity: 0.7 }}>
              Contact Us
            </Link>
            <Link fontSize="sm" _hover={{ opacity: 0.7 }}>
              FAQ
            </Link>
            <Link fontSize="sm" _hover={{ opacity: 0.7 }}>
              Feedback
            </Link>
          </Stack>
        </SimpleGrid>

        <Divider my={8} borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200'} />

        <HStack justify="space-between" flexWrap="wrap">
          <Text fontSize="sm" opacity={0.7}>
            © {currentYear} another. All rights reserved.
          </Text>
          <Text fontSize="sm" opacity={0.7}>
            Made with ❤️ for streaming enthusiasts
          </Text>
        </HStack>
      </Container>
    </Box>
  );
};
