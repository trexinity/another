import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
  Divider,
  HStack,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const bg = useColorModeValue('white', 'black');
  const cardBg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.800');
  const inputBg = useColorModeValue('gray.50', 'gray.800');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast({ title: 'Welcome back!', status: 'success', duration: 1800, isClosable: true });
      navigate('/');
    } catch (error) {
      toast({ title: 'Login failed', description: error.message, status: 'error', duration: 4000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast({ title: 'Signed in with Google', status: 'success', duration: 1800, isClosable: true });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Google sign-in failed',
        description: error.message,
        status: 'error',
        duration: 4500,
        isClosable: true,
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={bg}
      bgImage="url('/src/assets/images/background.jpg')"
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: useColorModeValue('whiteAlpha.900', 'blackAlpha.900'),
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box
        maxW="420px"
        w="full"
        p={8}
        bg={cardBg}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        boxShadow="2xl"
        position="relative"
        zIndex={1}
      >
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="2xl" mb={2} fontFamily="logo">
              Sign in
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Continue to another
            </Text>
          </Box>

          <Button
            leftIcon={<FcGoogle />}
            onClick={handleGoogle}
            isLoading={googleLoading}
            loadingText="Connecting..."
            size="lg"
            w="full"
            variant="outline"
            borderColor={borderColor}
          >
            Continue with Google
          </Button>

          <HStack>
            <Divider borderColor={borderColor} />
            <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
              or
            </Text>
            <Divider borderColor={borderColor} />
          </HStack>

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  size="lg"
                  bg={inputBg}
                  border="1px solid"
                  borderColor={borderColor}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    bg={inputBg}
                    border="1px solid"
                    borderColor={borderColor}
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button type="submit" size="lg" w="full" isLoading={loading} loadingText="Signing in...">
                Sign In
              </Button>
            </VStack>
          </form>

          <Box textAlign="center">
            <Text color="gray.500" fontSize="sm">
              Don’t have an account?{' '}
              <Link to="/signup">
                <Text as="span" fontWeight="bold" _hover={{ textDecoration: 'underline' }}>
                  Create one
                </Text>
              </Link>
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};
