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
  Divider,
  HStack,
} from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          toast({
            title: 'Name required',
            description: 'Please enter your display name',
            status: 'error',
            duration: 3000,
          });
          setLoading(false);
          return;
        }
        await signup(email, password, displayName);
        toast({
          title: 'Account created! 🎉',
          description: 'Welcome to ANOTHER',
          status: 'success',
          duration: 3000,
        });
      } else {
        await login(email, password);
        toast({
          title: 'Welcome back! 👋',
          status: 'success',
          duration: 2000,
        });
      }
      navigate('/');
    } catch (error) {
      console.error('Auth error:', error);
      let errorMessage = 'Something went wrong';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }

      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: 'Signed in with Google! 🎉',
        status: 'success',
        duration: 2000,
      });
      // Small delay to ensure user state is updated
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          title: 'Sign-in failed',
          description: error.message,
          status: 'error',
          duration: 4000,
        });
      }
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
      bg="brand.background"
      px={4}
    >
      <Box
        maxW="450px"
        w="100%"
        bg="brand.cardBg"
        p={8}
        borderRadius="lg"
        border="1px solid"
        borderColor="gray.700"
      >
        <VStack spacing={6} align="stretch">
          <Heading size="xl" textAlign="center" color="brand.primary">
            {isSignUp ? 'Join ANOTHER' : 'Welcome Back'}
          </Heading>

          <Text textAlign="center" color="gray.400">
            {isSignUp ? 'Create your account' : 'Sign in to continue'}
          </Text>

          {/* Google Sign In */}
          <Button
            leftIcon={<FcGoogle size={24} />}
            onClick={handleGoogleSignIn}
            isLoading={loading}
            size="lg"
            variant="outline"
            colorScheme="gray"
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            Continue with Google
          </Button>

          <HStack>
            <Divider />
            <Text fontSize="sm" color="gray.500" px={2}>
              OR
            </Text>
            <Divider />
          </HStack>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              {isSignUp && (
                <FormControl isRequired>
                  <FormLabel>Display Name</FormLabel>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    bg="gray.800"
                    border="1px solid"
                    borderColor="gray.600"
                  />
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  bg="gray.800"
                  border="1px solid"
                  borderColor="gray.600"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  bg="gray.800"
                  border="1px solid"
                  borderColor="gray.600"
                />
              </FormControl>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                width="100%"
                isLoading={loading}
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </VStack>
          </form>

          <Text textAlign="center" fontSize="sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Text
              as="span"
              color="brand.primary"
              cursor="pointer"
              fontWeight="bold"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};
