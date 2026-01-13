import { Box, Text, VStack, Image, Button, useToast, useColorMode, Progress } from '@chakra-ui/react';
import { useState, useCallback } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';

export const ImageUpload = ({ value, onChange, label = 'Upload Thumbnail' }) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(value || '');

  const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // Replace with your preset
  const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME'; // Replace with your cloud name
  const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      throw error;
    }
  };

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please select an image file', status: 'error', duration: 2500 });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large (max 10MB)', status: 'error', duration: 2500 });
      return;
    }

    setUploading(true);

    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const url = await uploadToCloudinary(file);
      onChange(url);
      setPreview(url);

      toast({ title: 'Image uploaded!', status: 'success', duration: 2000 });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', description: error.message, status: 'error', duration: 3000 });
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
  };

  const surface = colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50';
  const border = colorMode === 'dark' ? 'whiteAlpha.300' : 'blackAlpha.300';

  return (
    <VStack align="stretch" spacing={3}>
      <Text fontWeight="700" fontSize="sm" textTransform="uppercase" opacity={0.7}>
        {label}
      </Text>

      {preview ? (
        <Box position="relative" borderRadius="xl" overflow="hidden">
          <Image src={preview} alt="Preview" w="100%" h="auto" aspectRatio={16 / 9} objectFit="cover" />
          <Button
            position="absolute"
            top={2}
            right={2}
            size="sm"
            leftIcon={<FiX />}
            onClick={handleRemove}
            variant="solid"
            fontWeight="700"
          >
            Remove
          </Button>
        </Box>
      ) : (
        <Box
          position="relative"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            style={{ display: 'none' }}
            id="file-upload"
            disabled={uploading}
          />

          <Box
            as="label"
            htmlFor="file-upload"
            cursor={uploading ? 'not-allowed' : 'pointer'}
            display="block"
            p={10}
            border="2px dashed"
            borderColor={dragActive ? (colorMode === 'dark' ? 'white' : 'black') : border}
            borderRadius="xl"
            bg={dragActive ? surface : 'transparent'}
            transition="all 0.2s"
            _hover={{ bg: surface }}
            textAlign="center"
          >
            <VStack spacing={3}>
              <FiUpload size={32} opacity={0.7} />
              <Text fontWeight="700">
                {uploading ? 'Uploading...' : dragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
              </Text>
              <Text fontSize="sm" opacity={0.6}>
                16:9 aspect ratio recommended • Max 10MB
              </Text>
            </VStack>
          </Box>

          {uploading && <Progress size="xs" isIndeterminate mt={2} />}
        </Box>
      )}
    </VStack>
  );
};
