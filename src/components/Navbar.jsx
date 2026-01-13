import {
  Box,
  Flex,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Text,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useDisclosure,
  useColorMode,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isAdmin } from '../config/admins';
import { FiSearch, FiMenu, FiHome, FiFilm, FiTv, FiMoon, FiSun, FiMonitor, FiSettings, FiGrid } from 'react-icons/fi';
import { useEffect, useMemo, useState } from 'react';

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary', 'Animation', 'Crime', 'Fantasy', 'Mystery'];
const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Tamil', 'Telugu', 'Malayalam'];

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { colorMode, setColorMode } = useColorMode();

  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const genreModal = useDisclosure();
  const languageModal = useDisclosure();

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const userIsAdmin = user?.email && isAdmin(user.email);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = useMemo(
    () => [
      { path: '/', icon: FiHome, label: 'Home' },
      { path: '/movies', icon: FiFilm, label: 'Movies' },
      { path: '/series', icon: FiTv, label: 'Series' },
    ],
    []
  );

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setSearchQuery('');
  };

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const toggleLanguage = (lang) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  return (
    <>
      <Box
        as="nav"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
        bg={
          scrolled
            ? colorMode === 'dark'
              ? 'rgba(0,0,0,0.95)'
              : 'rgba(255,255,255,0.95)'
            : 'transparent'
        }
        backdropFilter={scrolled ? 'blur(20px)' : 'none'}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        boxShadow={scrolled ? '0 10px 40px rgba(0,0,0,0.3)' : 'none'}
        borderBottom="1px solid"
        borderColor={
          scrolled
            ? colorMode === 'dark'
              ? 'whiteAlpha.200'
              : 'blackAlpha.200'
            : 'transparent'
        }
      >
        <Flex
          position="relative"
          maxW="1920px"
          mx="auto"
          px={{ base: 4, md: 8 }}
          py={4}
          align="center"
          justify="space-between"
        >
          {/* Logo - Further Enlarged */}
          <Link to="/">
            <Text
              fontSize={{ base: '3xl', md: '4xl' }}
              fontWeight="black"
              fontFamily="logo"
              letterSpacing="logo"
              cursor="pointer"
              _hover={{ opacity: 0.8 }}
              transition="opacity 0.2s"
            >
              another
            </Text>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <HStack spacing={1} display={{ base: 'none', lg: 'flex' }}>
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="md"
                    fontWeight={isActive(item.path) ? '800' : '600'}
                    opacity={isActive(item.path) ? 1 : 0.7}
                    _hover={{ opacity: 1 }}
                    borderBottom={isActive(item.path) ? '2px solid' : 'none'}
                    borderRadius={0}
                    px={4}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </HStack>
          )}

          {/* Right Side */}
          <HStack spacing={3}>
            {/* Genre Filter */}
            {user && (
              <Button
                leftIcon={<FiGrid />}
                variant="ghost"
                size="md"
                fontWeight="700"
                onClick={genreModal.onOpen}
                display={{ base: 'none', md: 'flex' }}
              >
                Genres
              </Button>
            )}

            {/* Language Filter */}
            {user && (
              <Button
                variant="ghost"
                size="md"
                fontWeight="700"
                onClick={languageModal.onOpen}
                display={{ base: 'none', md: 'flex' }}
              >
                Languages
              </Button>
            )}

            {/* Search */}
            {user && (
              <form onSubmit={handleSearch}>
                <InputGroup size="md" display={{ base: 'none', md: 'flex' }} w="300px">
                  <InputLeftElement pointerEvents="none">
                    <FiSearch opacity={0.6} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    borderRadius="full"
                  />
                </InputGroup>
              </form>
            )}

            {/* Theme Toggle */}
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Theme"
                icon={colorMode === 'dark' ? <FiMoon /> : <FiSun />}
                variant="ghost"
              />
              <MenuList>
                <MenuItem icon={<FiMoon />} onClick={() => setColorMode('dark')}>
                  Dark
                </MenuItem>
                <MenuItem icon={<FiSun />} onClick={() => setColorMode('light')}>
                  Light
                </MenuItem>
                <MenuItem icon={<FiMonitor />} onClick={() => setColorMode('system')}>
                  System
                </MenuItem>
              </MenuList>
            </Menu>

            {/* Mobile Menu */}
            {user && (
              <IconButton
                icon={<FiMenu />}
                variant="ghost"
                display={{ base: 'flex', lg: 'none' }}
                onClick={onOpen}
                aria-label="Menu"
              />
            )}

            {/* User Menu */}
            {user ? (
              <Menu>
                <MenuButton>
                  <Avatar
                    size="sm"
                    name={user.email}
                    src={user.photoURL || undefined}
                    cursor="pointer"
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="transform 0.2s"
                  />
                </MenuButton>

                <MenuList>
                  <MenuItem isDisabled>
                    <Text fontSize="sm" fontWeight="700">
                      {user.email}
                    </Text>
                  </MenuItem>
                  <MenuDivider />

                  {userIsAdmin && (
                    <>
                      <MenuItem as={Link} to="/admin">
                        Studio
                      </MenuItem>
                      <MenuDivider />
                    </>
                  )}

                  <MenuItem as={Link} to="/my-list">
                    Watchlist
                  </MenuItem>
                  <MenuItem as={Link} to="/settings" icon={<FiSettings />}>
                    Settings
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <HStack spacing={2}>
                <Button as={Link} to="/login" variant="ghost" size="sm">
                  Sign In
                </Button>
                <Button as={Link} to="/signup" variant="solid" size="sm">
                  Join
                </Button>
              </HStack>
            )}
          </HStack>
        </Flex>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={2}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  as={Link}
                  to={item.path}
                  leftIcon={<item.icon />}
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={onClose}
                  fontWeight={isActive(item.path) ? '800' : '600'}
                >
                  {item.label}
                </Button>
              ))}
              <Button leftIcon={<FiGrid />} variant="ghost" justifyContent="flex-start" onClick={genreModal.onOpen}>
                Genres
              </Button>
              <Button variant="ghost" justifyContent="flex-start" onClick={languageModal.onOpen}>
                Languages
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Genre Modal - Prime Video Style */}
      <Modal isOpen={genreModal.isOpen} onClose={genreModal.onClose} size="2xl" isCentered>
        <ModalOverlay backdropFilter="blur(12px)" bg="blackAlpha.800" />
        <ModalContent>
          <ModalHeader>Select Genres</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={8}>
            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
              {GENRES.map((genre) => (
                <Button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  variant={selectedGenres.includes(genre) ? 'solid' : 'outline'}
                  size="lg"
                  fontWeight="700"
                  justifyContent="space-between"
                  rightIcon={
                    selectedGenres.includes(genre) ? (
                      <Badge colorScheme="green">✓</Badge>
                    ) : undefined
                  }
                >
                  {genre}
                </Button>
              ))}
            </SimpleGrid>
            {selectedGenres.length > 0 && (
              <Button
                mt={6}
                w="full"
                variant="outline"
                onClick={() => setSelectedGenres([])}
                fontWeight="700"
              >
                Clear All
              </Button>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Language Modal */}
      <Modal isOpen={languageModal.isOpen} onClose={languageModal.onClose} size="2xl" isCentered>
        <ModalOverlay backdropFilter="blur(12px)" bg="blackAlpha.800" />
        <ModalContent>
          <ModalHeader>Select Languages</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={8}>
            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
              {LANGUAGES.map((lang) => (
                <Button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  variant={selectedLanguages.includes(lang) ? 'solid' : 'outline'}
                  size="lg"
                  fontWeight="700"
                  justifyContent="space-between"
                  rightIcon={
                    selectedLanguages.includes(lang) ? (
                      <Badge colorScheme="green">✓</Badge>
                    ) : undefined
                  }
                >
                  {lang}
                </Button>
              ))}
            </SimpleGrid>
            {selectedLanguages.length > 0 && (
              <Button
                mt={6}
                w="full"
                variant="outline"
                onClick={() => setSelectedLanguages([])}
                fontWeight="700"
              >
                Clear All
              </Button>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
