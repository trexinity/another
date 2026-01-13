import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Divider,
  Text,
  HStack,
  Avatar,
  Switch,
} from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { updatePassword, updateProfile } from 'firebase/auth';
import { ref, update } from 'firebase/database';
import { auth, db } from '../config/firebase';

export const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Form states
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Settings states
  const [autoplay, setAutoplay] = useState(true);
  const [notifications, setNotifications] = useState(true);

  // Security check
  if (!user) {
    navigate('/login');
    return null;
  }

  // Update display name
  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your display name',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
      });

      // Update Firebase Database
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, {
        displayName: displayName.trim(),
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'All fields required',
        description: 'Please fill in all password fields',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'New password and confirm password must match',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updatePassword(auth.currentUser, newPassword);

      toast({
        title: 'Password changed',
        description: 'Your password has been updated successfully',
        status: 'success',
        duration: 3000,
      });

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      
      let errorMessage = 'Failed to change password';
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please sign out and sign in again to change your password';
      }

      toast({
        title: 'Password change failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete account (dangerous!)
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone!'
    );

    if (!confirmed) return;

    try {
      // Delete user data from database
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, {
        deleted: true,
        deletedAt: new Date().toISOString(),
      });

      // Delete Firebase Auth account
      await auth.currentUser.delete();

      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted',
        status: 'info',
        duration: 3000,
      });

      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Delete failed',
        description: 'Please sign out and sign in again to delete your account',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Box minH="100vh" pt={24} pb={12} bg="brand.background">
      <Container maxW="900px">
        <Heading mb={8} color="brand.primary" size="2xl">
          Settings
        </Heading>

        <VStack spacing={8} align="stretch">
          {/* Profile Section */}
          <Box
            p={6}
            bg="brand.cardBg"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.700"
          >
            <Heading size="md" mb={6}>
              Profile
            </Heading>

            <HStack mb={6}>
              <Avatar
                size="xl"
                name={user.displayName || user.email}
                src={user.photoURL}
              />
              <VStack align="start" spacing={1}>
                <Text fontSize="xl" fontWeight="bold">
                  {user.displayName || 'User'}
                </Text>
                <Text color="brand.textGray">{user.email}</Text>
              </VStack>
            </HStack>

            <FormControl>
              <FormLabel>Display Name</FormLabel>
              <HStack>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  bg="gray.800"
                />
                <Button
                  variant="primary"
                  onClick={handleUpdateProfile}
                  isLoading={isUpdating}
                >
                  Update
                </Button>
              </HStack>
            </FormControl>
          </Box>

          {/* Password Section */}
          <Box
            p={6}
            bg="brand.cardBg"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.700"
          >
            <Heading size="md" mb={6}>
              Change Password
            </Heading>

            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Current Password</FormLabel>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  bg="gray.800"
                />
              </FormControl>

              <FormControl>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  bg="gray.800"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  bg="gray.800"
                />
              </FormControl>

              <Button
                variant="primary"
                width="full"
                onClick={handleChangePassword}
                isLoading={isUpdating}
              >
                Change Password
              </Button>
            </VStack>
          </Box>

          {/* Preferences Section */}
          <Box
            p={6}
            bg="brand.cardBg"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.700"
          >
            <Heading size="md" mb={6}>
              Preferences
            </Heading>

            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">Autoplay next episode</Text>
                  <Text fontSize="sm" color="brand.textGray">
                    Automatically play the next episode
                  </Text>
                </VStack>
                <Switch
                  isChecked={autoplay}
                  onChange={(e) => setAutoplay(e.target.checked)}
                  colorScheme="red"
                  size="lg"
                />
              </HStack>

              <Divider />

              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">Notifications</Text>
                  <Text fontSize="sm" color="brand.textGray">
                    Get notifications about new content
                  </Text>
                </VStack>
                <Switch
                  isChecked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  colorScheme="red"
                  size="lg"
                />
              </HStack>
            </VStack>
          </Box>

          {/* Danger Zone */}
          <Box
            p={6}
            bg="red.900"
            bgOpacity={0.2}
            borderRadius="lg"
            border="1px solid"
            borderColor="red.700"
          >
            <Heading size="md" mb={4} color="red.500">
              Danger Zone
            </Heading>

            <Text mb={4} color="brand.textGray">
              Once you delete your account, there is no going back. Please be certain.
            </Text>

            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleDeleteAccount}
            >
              Delete My Account
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};
