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
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const bg = useColorModeValue('white', 'black');
  const cardBg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.800');
  const inputBg = useColorModeValue('gray.50', 'gray.800');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      await signup(email, password);
      toast({
        title: 'Account created!',
        description: 'Welcome to StreamHub',
        status: 'success',
        duration: 2000,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Signup failed',
        description: error.message,
        status: 'error',
        duration: 4000,
      });
    } finally {
      setLoading(false);
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
        maxW="400px"
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
            <Heading
              size="2xl"
              mb={2}
              fontFamily="CustomLogo"
            >
              Join StreamHub
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Create your account to start streaming
            </Text>
          </Box>

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
                    placeholder="At least 6 characters"
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
                      aria-label="Toggle password"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  size="lg"
                  bg={inputBg}
                  border="1px solid"
                  borderColor={borderColor}
                />
              </FormControl>

              <Button
                type="submit"
                size="lg"
                w="full"
                isLoading={loading}
                loadingText="Creating account..."
              >
                Sign Up
              </Button>
            </VStack>
          </form>

          <Box textAlign="center">
            <Text color="gray.500" fontSize="sm">
              Already have an account?{' '}
              <Link to="/login">
                <Text
                  as="span"
                  fontWeight="bold"
                  _hover={{ textDecoration: 'underline' }}
                >
                  Sign In
                </Text>
              </Link>
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};
