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
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { colorMode, setColorMode } = useColorMode();
  const [themeMode, setThemeMode] = useState('system');

  const bg = useColorModeValue('white', 'black');
  const borderColor = useColorModeValue('gray.200', 'gray.800');
  const hoverBg = useColorModeValue('gray.100', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') || 'system';
    setThemeMode(savedMode);
    applyTheme(savedMode);
  }, []);

  const applyTheme = (mode) => {
    if (mode === 'system') {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setColorMode(systemPreference);
    } else {
      setColorMode(mode);
    }
  };

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('theme-mode', mode);
    applyTheme(mode);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg={bg}
      borderBottom="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(10px)"
      bgOpacity={0.9}
    >
      <Flex
        maxW="1400px"
        mx="auto"
        px={6}
        py={4}
        align="center"
        justify="space-between"
      >
        {/* Logo */}
        <Link to="/">
          <Text
            fontSize="3xl"
            fontWeight="bold"
            fontFamily="CustomLogo"
            letterSpacing="tight"
            cursor="pointer"
            _hover={{ transform: 'scale(1.05)' }}
            transition="all 0.2s"
          >
            STREAMHUB
          </Text>
        </Link>

        {/* Nav Items */}
        <HStack spacing={8}>
          {user && (
            <>
              <Link to="/">
                <Text
                  fontSize="md"
                  fontWeight="medium"
                  cursor="pointer"
                  color={textColor}
                  _hover={{ color: useColorModeValue('black', 'white') }}
                  transition="color 0.2s"
                >
                  Home
                </Text>
              </Link>
              <Link to="/browse">
                <Text
                  fontSize="md"
                  fontWeight="medium"
                  cursor="pointer"
                  color={textColor}
                  _hover={{ color: useColorModeValue('black', 'white') }}
                  transition="color 0.2s"
                >
                  Browse
                </Text>
              </Link>
            </>
          )}

          {/* Theme Toggle */}
          <Menu>
            <MenuButton
              as={IconButton}
              icon={
                themeMode === 'light' ? <FiSun /> :
                themeMode === 'dark' ? <FiMoon /> :
                <FiMonitor />
              }
              variant="ghost"
              aria-label="Toggle theme"
              _hover={{ bg: hoverBg }}
            />
            <MenuList bg={bg} borderColor={borderColor}>
              <MenuItem
                icon={<FiSun />}
                onClick={() => handleThemeChange('light')}
                bg={themeMode === 'light' ? hoverBg : 'transparent'}
                _hover={{ bg: hoverBg }}
              >
                Light
              </MenuItem>
              <MenuItem
                icon={<FiMoon />}
                onClick={() => handleThemeChange('dark')}
                bg={themeMode === 'dark' ? hoverBg : 'transparent'}
                _hover={{ bg: hoverBg }}
              >
                Dark
              </MenuItem>
              <MenuItem
                icon={<FiMonitor />}
                onClick={() => handleThemeChange('system')}
                bg={themeMode === 'system' ? hoverBg : 'transparent'}
                _hover={{ bg: hoverBg }}
              >
                System
              </MenuItem>
            </MenuList>
          </Menu>

          {/* User Menu */}
          {user ? (
            <Menu>
              <MenuButton>
                <Avatar
                  size="sm"
                  name={user.email}
                  src={user.photoURL}
                  cursor="pointer"
                  border="2px solid"
                  borderColor={useColorModeValue('black', 'white')}
                  _hover={{ transform: 'scale(1.1)' }}
                  transition="all 0.2s"
                />
              </MenuButton>
              <MenuList bg={bg} borderColor={borderColor}>
                <MenuItem isDisabled>
                  <Text fontSize="sm" fontWeight="medium">
                    {user.email}
                  </Text>
                </MenuItem>
                <MenuItem
                  as={Link}
                  to="/admin"
                  _hover={{ bg: hoverBg }}
                >
                  Admin Panel
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  _hover={{ bg: hoverBg }}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <HStack spacing={3}>
              <Button
                as={Link}
                to="/login"
                variant="outline"
                size="sm"
              >
                Sign In
              </Button>
              <Button
                as={Link}
                to="/signup"
                variant="solid"
                size="sm"
              >
                Sign Up
              </Button>
            </HStack>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};
