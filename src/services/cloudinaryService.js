import axios from 'axios';

// This file handles uploading videos and images to Cloudinary
// Cloudinary is like Google Drive but for videos - it stores your movies

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'streaming_videos';

/**
 * Upload any file to Cloudinary
 * @param {File} file - The file to upload (video or image)
 * @param {string} resourceType - 'video' or 'image'
 * @param {function} onProgress - Callback function to track upload progress
 * @returns {Object} - Result with URL and details
 */
export const uploadToCloudinary = async (file, resourceType = 'video', onProgress) => {
  // Create form data (like filling out a form on a website)
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

  try {
    // Send file to Cloudinary servers
    const response = await axios.post(CLOUDINARY_URL, formData, {
      params: {
        resource_type: resourceType, // Tell Cloudinary if it's video or image
      },
      onUploadProgress: (progressEvent) => {
        // Calculate percentage (0-100%)
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        // Call the progress callback so we can show a progress bar
        if (onProgress) onProgress(percentCompleted);
      },
    });

    // Success! Return the video URL and details
    return {
      success: true,
      url: response.data.secure_url,       // HTTPS URL of uploaded file
      publicId: response.data.public_id,   // Unique ID (like a file name)
      format: response.data.format,        // mp4, jpg, etc.
      duration: response.data.duration,    // Length of video in seconds
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Something went wrong
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Upload an image (thumbnail) to Cloudinary
 * @param {File} file - Image file
 * @param {function} onProgress - Progress callback
 */
export const uploadImage = async (file, onProgress) => {
  return uploadToCloudinary(file, 'image', onProgress);
};

/**
 * Upload a video to Cloudinary
 * @param {File} file - Video file
 * @param {function} onProgress - Progress callback
 */
export const uploadVideo = async (file, onProgress) => {
  return uploadToCloudinary(file, 'video', onProgress);
};
