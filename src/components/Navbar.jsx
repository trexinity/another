import { Box, Flex, Input, InputGroup, InputLeftElement, Avatar, Button, Menu, MenuButton, MenuList, MenuItem, useColorModeValue } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signIn, signOutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/browse?q=${searchQuery}`);
    }
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg={scrolled ? 'rgba(20, 20, 20, 0.98)' : 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)'}
      backdropFilter={scrolled ? 'blur(10px)' : 'none'}
      transition="all 0.3s"
    >
      <Flex
        maxW="1920px"
        mx="auto"
        px={8}
        py={4}
        align="center"
        justify="space-between"
      >
        <Flex align="center" gap={8}>
          <Box
            fontSize="2xl"
            fontWeight="900"
            color="red.600"
            cursor="pointer"
            onClick={() => navigate('/')}
            _hover={{ transform: 'scale(1.05)' }}
            transition="transform 0.2s"
          >
            ANOTHER
          </Box>
          
          <Flex gap={6} display={{ base: 'none', md: 'flex' }}>
            <Box cursor="pointer" onClick={() => navigate('/')} _hover={{ color: 'white' }} transition="color 0.2s">Home</Box>
            <Box cursor="pointer" onClick={() => navigate('/browse')} _hover={{ color: 'white' }} transition="color 0.2s">Browse</Box>
            <Box cursor="pointer" _hover={{ color: 'white' }} transition="color 0.2s">Trending</Box>
          </Flex>
        </Flex>

        <Flex align="center" gap={4}>
          <InputGroup maxW="300px" display={{ base: 'none', md: 'block' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              bg="rgba(255,255,255,0.1)"
              border="1px solid rgba(255,255,255,0.2)"
              _focus={{ bg: 'rgba(255,255,255,0.15)', borderColor: 'red.500' }}
            />
          </InputGroup>

          {user ? (
            <Menu>
              <MenuButton>
                <Avatar size="sm" src={user.photoURL} name={user.displayName} />
              </MenuButton>
              <MenuList bg="gray.900" borderColor="gray.700">
                <MenuItem bg="gray.900" _hover={{ bg: 'gray.800' }} onClick={() => navigate('/profile')}>
                  Profile
                </MenuItem>
                <MenuItem bg="gray.900" _hover={{ bg: 'gray.800' }} onClick={signOutUser}>
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button colorScheme="red" size="sm" onClick={signIn}>
              Sign In
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};
