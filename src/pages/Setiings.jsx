import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Switch,
  Button,
  Divider,
  Select,
  useColorMode,
  useToast,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const { colorMode, setColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [autoplay, setAutoplay] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [quality, setQuality] = useState('auto');
  const [language, setLanguage] = useState('English');
  const [subtitles, setSubtitles] = useState(true);

  const handleSave = () => {
    toast({ title: 'Settings saved!', status: 'success', duration: 2000, isClosable: true });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      toast({ title: 'Account deletion requested', status: 'info', duration: 3000, isClosable: true });
    }
  };

  const bg = colorMode === 'dark' ? 'black' : 'white';
  const surface = colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50';
  const border = colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200';

  return (
    <Box minH="100vh" bg={bg} pt={24} pb={12}>
      <Container maxW="900px" px={{ base: 4, md: 8 }}>
        <VStack align="stretch" spacing={8}>
          <Heading size="2xl" letterSpacing="heading">
            Settings
          </Heading>

          {/* Account */}
          <Box bg={surface} p={6} borderRadius="xl" border="1px solid" borderColor={border}>
            <Heading size="md" mb={6}>
              Account
            </Heading>
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel fontWeight="700">Email</FormLabel>
                <Input value={user?.email || ''} isReadOnly />
              </FormControl>

              <Button variant="outline" size="lg" fontWeight="700" onClick={() => navigate('/change-password')}>
                Change Password
              </Button>
            </VStack>
          </Box>

          {/* Playback */}
          <Box bg={surface} p={6} borderRadius="xl" border="1px solid" borderColor={border}>
            <Heading size="md" mb={6}>
              Playback
            </Heading>
            <VStack align="stretch" spacing={5}>
              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="700" mb={1}>
                    Autoplay Next Episode
                  </Text>
                  <Text fontSize="sm" opacity={0.7}>
                    Automatically play the next episode
                  </Text>
                </Box>
                <Switch size="lg" isChecked={autoplay} onChange={(e) => setAutoplay(e.target.checked)} />
              </HStack>

              <Divider borderColor={border} />

              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="700" mb={1}>
                    Subtitles
                  </Text>
                  <Text fontSize="sm" opacity={0.7}>
                    Show subtitles by default
                  </Text>
                </Box>
                <Switch size="lg" isChecked={subtitles} onChange={(e) => setSubtitles(e.target.checked)} />
              </HStack>

              <Divider borderColor={border} />

              <FormControl>
                <FormLabel fontWeight="700">Video Quality</FormLabel>
                <Select value={quality} onChange={(e) => setQuality(e.target.value)} size="lg">
                  <option value="auto">Auto</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                </Select>
              </FormControl>
            </VStack>
          </Box>

          {/* Preferences */}
          <Box bg={surface} p={6} borderRadius="xl" border="1px solid" borderColor={border}>
            <Heading size="md" mb={6}>
              Preferences
            </Heading>
            <VStack align="stretch" spacing={5}>
              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="700" mb={1}>
                    Notifications
                  </Text>
                  <Text fontSize="sm" opacity={0.7}>
                    Get updates about new content
                  </Text>
                </Box>
                <Switch size="lg" isChecked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
              </HStack>

              <Divider borderColor={border} />

              <FormControl>
                <FormLabel fontWeight="700">Theme</FormLabel>
                <Select value={colorMode} onChange={(e) => setColorMode(e.target.value)} size="lg">
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </Select>
              </FormControl>

              <Divider borderColor={border} />

              <FormControl>
                <FormLabel fontWeight="700">Language</FormLabel>
                <Select value={language} onChange={(e) => setLanguage(e.target.value)} size="lg">
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </Select>
              </FormControl>
            </VStack>
          </Box>

          {/* Actions */}
          <Box bg={surface} p={6} borderRadius="xl" border="1px solid" borderColor={border}>
            <Heading size="md" mb={6}>
              Actions
            </Heading>
            <VStack align="stretch" spacing={4}>
              <Button variant="solid" size="lg" fontWeight="700" onClick={handleSave}>
                Save All Settings
              </Button>

              <Button variant="outline" size="lg" fontWeight="700" onClick={logout}>
                Sign Out
              </Button>

              <Button variant="outline" colorScheme="red" size="lg" fontWeight="700" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};
