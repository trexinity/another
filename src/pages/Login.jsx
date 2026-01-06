import { useState } from 'react';
import { 
  Box, 
  Container, 
  VStack, 
  Input, 
  Button, 
  Text, 
  Heading,
  Divider,
  useToast
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password, displayName);
        toast({
          title: 'Account created!',
          status: 'success',
          duration: 3000,
        });
      } else {
        await login(email, password);
        toast({
          title: 'Welcome back!',
          status: 'success',
          duration: 3000,
        });
      }
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
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
        title: 'Signed in with Google!',
        status: 'success',
        duration: 3000,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
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
      bg="black" 
      pt={24}
      bgImage="url('https://assets.nflxext.com/ffe/siteui/vlv3/default/bg.jpg')"
      bgSize="cover"
      bgPosition="center"
      position="relative"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0,0,0,0.7)"
        backdropFilter="blur(3px)"
      />
      
      <Container maxW="md" position="relative" zIndex={1}>
        <Box
          bg="rgba(0,0,0,0.85)"
          p={12}
          borderRadius="lg"
          backdropFilter="blur(10px)"
        >
          <VStack spacing={6} as="form" onSubmit={handleSubmit}>
            <Heading color="white" size="xl">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Heading>

            {isSignUp && (
              <Input
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                bg="gray.800"
                border="none"
                color="white"
                size="lg"
                required={isSignUp}
              />
            )}

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg="gray.800"
              border="none"
              color="white"
              size="lg"
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg="gray.800"
              border="none"
              color="white"
              size="lg"
              required
            />

            <Button
              type="submit"
              colorScheme="red"
              size="lg"
              w="full"
              isLoading={loading}
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>

            <Divider />

            <Button
              leftIcon={<FcGoogle />}
              onClick={handleGoogleSignIn}
              size="lg"
              w="full"
              variant="outline"
              color="white"
              borderColor="gray.600"
              _hover={{ bg: 'gray.800' }}
              isLoading={loading}
            >
              Continue with Google
            </Button>

            <Text color="gray.400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Text
                as="span"
                color="red.500"
                cursor="pointer"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};
