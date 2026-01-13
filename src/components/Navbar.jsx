import { 
  Box, 
  Flex, 
  HStack, 
  Button, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  Avatar,
  Text,
  IconButton,
  useColorMode,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  FiSearch, 
  FiMenu, 
  FiHome, 
  FiFilm, 
  FiTv, 
  FiActivity,
  FiRadio,
  FiShoppingBag,
} from 'react-icons/fi';
import { useState, useEffect } from 'react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/movies', icon: FiFilm, label: 'Movies' },
    { path: '/tv-shows', icon: FiTv, label: 'TV Shows' },
    { path: '/sports', icon: FiActivity, label: 'Sports' },
    { path: '/live-tv', icon: FiRadio, label: 'Live TV' },
  ];

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg={scrolled ? 'rgba(15, 23, 30, 0.98)' : 'transparent'}
      backdropFilter={scrolled ? 'blur(20px)' : 'none'}
      transition="all 0.3s ease"
      boxShadow={scrolled ? '0 4px 20px rgba(0,0,0,0.5)' : 'none'}
    >
      <Flex
        maxW="1920px"
        mx="auto"
        px={{ base: 4, md: 6 }}
        py={3}
        align="center"
        justify="space-between"
      >
        {/* Logo */}
        <HStack spacing={8}>
          <Link to="/">
            <HStack spacing={2}>
              <Text
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="black"
                fontFamily="'CustomLogo', sans-serif"
                letterSpacing="tight"
                cursor="pointer"
                _hover={{ opacity: 0.8 }}
                transition="all 0.2s"
              >
                another
              </Text>
              <Badge
                bg="#00A8E1"
                color="white"
                px={2}
                py={1}
                fontSize="10px"
                fontWeight="bold"
                borderRadius="sm"
              >
                prime
              </Badge>
            </HStack>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <HStack spacing={1} display={{ base: 'none', lg: 'flex' }}>
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    color={isActive(item.path) ? 'white' : 'gray.400'}
                    borderBottom={isActive(item.path) ? '2px solid #00A8E1' : 'none'}
                    borderRadius={0}
                    _hover={{ color: 'white', bg: 'transparent' }}
                    fontWeight={isActive(item.path) ? 'bold' : 'normal'}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </HStack>
          )}
        </HStack>

        {/* Right Side */}
        <HStack spacing={3}>
          {/* Search */}
          {user && (
            <>
              <form onSubmit={handleSearch}>
                <InputGroup size="sm" display={{ base: 'none', md: 'flex' }} w="300px">
                  <InputLeftElement>
                    <FiSearch color="gray" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search movies, shows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg="rgba(26, 36, 47, 0.8)"
                    border="1px solid rgba(255,255,255,0.1)"
                    _hover={{ borderColor: '#00A8E1' }}
                    _focus={{ borderColor: '#00A8E1', boxShadow: '0 0 0 1px #00A8E1' }}
                    color="white"
                  />
                </InputGroup>
              </form>

              <IconButton
                icon={<FiSearch />}
                variant="ghost"
                size="sm"
                display={{ base: 'flex', md: 'none' }}
                onClick={() => navigate('/search')}
                aria-label="Search"
                color="gray.400"
                _hover={{ color: 'white' }}
              />
            </>
          )}

          {/* Store Icon */}
          {user && (
            <IconButton
              icon={<FiShoppingBag />}
              variant="ghost"
              size="sm"
              aria-label="Store"
              color="gray.400"
              _hover={{ color: '#FFB800' }}
            />
          )}

          {/* Mobile Menu */}
          {user && (
            <IconButton
              icon={<FiMenu />}
              variant="ghost"
              size="sm"
              display={{ base: 'flex', lg: 'none' }}
              onClick={onOpen}
              aria-label="Menu"
              color="gray.400"
              _hover={{ color: 'white' }}
            />
          )}

          {/* User Menu */}
          {user ? (
            <Menu>
              <MenuButton>
                <HStack>
                  <Avatar
                    size="sm"
                    name={user.email}
                    src={user.photoURL}
                    bg="#00A8E1"
                    cursor="pointer"
                    _hover={{ transform: 'scale(1.1)', boxShadow: '0 0 15px rgba(0,168,225,0.5)' }}
                    transition="all 0.2s"
                  />
                </HStack>
              </MenuButton>
              <MenuList bg="#1A242F" borderColor="rgba(255,255,255,0.1)">
                <MenuItem bg="transparent" _hover={{ bg: '#232F3E' }} isDisabled>
                  <Text fontSize="sm" fontWeight="medium" color="white">
                    {user.email}
                  </Text>
                </MenuItem>
                <MenuItem bg="transparent" _hover={{ bg: '#232F3E' }} as={Link} to="/admin">
                  <Text color="white">Studio</Text>
                </MenuItem>
                <MenuItem bg="transparent" _hover={{ bg: '#232F3E' }} as={Link} to="/my-list">
                  <Text color="white">Watchlist</Text>
                </MenuItem>
                <MenuItem bg="transparent" _hover={{ bg: '#232F3E' }} onClick={handleLogout}>
                  <Text color="white">Sign Out</Text>
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <HStack spacing={2}>
              <Button
                as={Link}
                to="/login"
                variant="ghost"
                size="sm"
                color="white"
              >
                Sign In
              </Button>
              <Button
                as={Link}
                to="/signup"
                variant="primeGold"
                size="sm"
              >
                Join Prime
              </Button>
            </HStack>
          )}
        </HStack>
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent bg="#0F171E">
          <DrawerCloseButton color="white" />
          <DrawerHeader borderBottomWidth="1px" borderColor="rgba(255,255,255,0.1)">
            <Text color="white">Menu</Text>
          </DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={2} mt={4}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  as={Link}
                  to={item.path}
                  leftIcon={<item.icon />}
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={onClose}
                  color={isActive(item.path) ? '#00A8E1' : 'white'}
                  _hover={{ bg: '#232F3E' }}
                >
                  {item.label}
                </Button>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
