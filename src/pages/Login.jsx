import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  Input,
  VStack,
  Text,
  Heading,
  Image,
  useToast,
  Divider,
  HStack,
  Link,
} from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: 'Welcome!',
        description: 'Successfully signed in with Google',
        status: 'success',
        duration: 3000,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Weak password',
        description: 'Password must be at least 6 characters',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        if (!displayName) {
          toast({
            title: 'Name required',
            description: 'Please enter your name',
            status: 'error',
            duration: 3000,
          });
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
        toast({
          title: 'Account created!',
          description: 'Welcome to the platform',
          status: 'success',
          duration: 3000,
        });
      } else {
        await signInWithEmail(email, password);
        toast({
          title: 'Welcome back!',
          description: 'Successfully signed in',
          status: 'success',
          duration: 3000,
        });
      }
      navigate('/');
    } catch (error) {
      let errorMessage = 'Authentication failed';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-b, rgba(0,0,0,0.7), rgba(0,0,0,0.9))"
      bgImage="url('https://assets.nflxext.com/ffe/siteui/vlv3/9f46b569-aff7-4975-9b8e-3212e4637f16/453ba2a1-6138-4e3c-9a06-b66f9a2832e4/IN-en-20240415-popsignuptwoweeks-perspective_alpha_website_large.jpg')"
      bgSize="cover"
      bgPosition="center"
      bgBlendMode="overlay"
      position="relative"
    >
      {/* Logo */}
      <Box position="absolute" top={4} left={8}>
        <Text fontSize="3xl" fontWeight="bold" color="red.600">
          STREAMFLIX
        </Text>
      </Box>

      <Container maxW="md" py={24}>
        <Box
          bg="rgba(0, 0, 0, 0.85)"
          backdropFilter="blur(10px)"
          borderRadius="md"
          p={12}
          boxShadow="0 0 40px rgba(0,0,0,0.5)"
        >
          <VStack spacing={6} align="stretch">
            <Heading color="white" size="xl" mb={4}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Heading>

            <form onSubmit={handleEmailAuth}>
              <VStack spacing={4}>
                {isSignUp && (
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      bg="gray.800"
                      border="none"
                      color="white"
                      size="lg"
                      _placeholder={{ color: 'gray.400' }}
                      _focus={{ bg: 'gray.700', borderColor: 'red.500' }}
                    />
                  </FormControl>
                )}

                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="gray.800"
                    border="none"
                    color="white"
                    size="lg"
                    _placeholder={{ color: 'gray.400' }}
                    _focus={{ bg: 'gray.700', borderColor: 'red.500' }}
                  />
                </FormControl>

                <FormControl>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="gray.800"
                    border="none"
                    color="white"
                    size="lg"
                    _placeholder={{ color: 'gray.400' }}
                    _focus={{ bg: 'gray.700', borderColor: 'red.500' }}
                  />
                </FormControl>

                <Button
                  type="submit"
                  bg="red.600"
                  color="white"
                  size="lg"
                  w="full"
                  _hover={{ bg: 'red.700' }}
                  isLoading={loading}
                  loadingText={isSignUp ? 'Creating account...' : 'Signing in...'}
                >
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Button>
              </VStack>
            </form>

            <HStack>
              <Divider />
              <Text color="gray.400" fontSize="sm" whiteSpace="nowrap">
                OR
              </Text>
              <Divider />
            </HStack>

            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              size="lg"
              borderColor="gray.600"
              color="white"
              _hover={{ bg: 'gray.800' }}
              leftIcon={<FcGoogle size={24} />}
              isLoading={loading}
            >
              Continue with Google
            </Button>

            <HStack justifyContent="center" pt={4}>
              <Text color="gray.400">
                {isSignUp ? 'Already have an account?' : 'New to StreamFlix?'}
              </Text>
              <Link
                color="white"
                fontWeight="bold"
                onClick={() => setIsSignUp(!isSignUp)}
                _hover={{ textDecoration: 'underline' }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Link>
            </HStack>
          </VStack>
        </Box>

        <Text color="gray.500" fontSize="sm" mt={8} textAlign="center">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </Container>
    </Box>
  );
};
