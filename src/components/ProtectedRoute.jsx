import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Box, Spinner, Center } from '@chakra-ui/react';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Center h="100vh" bg="black">
        <Spinner size="xl" color="red.600" thickness="4px" />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
