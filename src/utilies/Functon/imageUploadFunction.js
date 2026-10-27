import { useState, useCallback, useRef } from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import { Alert, Platform } from 'react-native';
import requestCameraPermission from '../Functon/CommonFunction';

const UPLOAD_URL = 'https://doctors-adda-back.onrender.com/api/upload/uploadImage';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_IMAGES = 10;

// Utility function to validate image
const validateImage = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  if (file.fileSize && file.fileSize > MAX_FILE_SIZE) {
    return { valid: false, error: 'Image size must be less than 10MB' };
  }

  return { valid: true };
};

// Single Image Upload Hook
export default function useImageUpload(onUploadSuccess = () => {}) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const uploadImage = useCallback(async (result) => {
    if (!result?.assets || result.assets.length === 0) {
      return;
    }

    const file = result.assets[0];
    const validation = validateImage(file);

    if (!validation.valid) {
      setError(validation.error);
      Alert.alert('Invalid File', validation.error);
      return;
    }

    const fileData = {
      uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
      type: file.type,
      name: file.fileName || `image_${Date.now()}.jpg`,
    };

    const formData = new FormData();
    formData.append('file', fileData);

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(UPLOAD_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: abortControllerRef.current.signal,
        timeout: 30000, // 30 second timeout
      });

      const imageUrl = response.data?.url || response.data?.data?.imageUrl;

      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }

      setImageFile(fileData);
      onUploadSuccess(imageUrl);
      return imageUrl;
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Upload cancelled');
        return;
      }

      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload image';
      setError(errorMessage);
      Alert.alert('Upload Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [onUploadSuccess]);

  const pickFromGallery = useCallback(async () => {
    try {
      const result = await launchImageLibrary({ 
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to select image');
        return;
      }

      await uploadImage(result);
    } catch (error) {
      console.error('Gallery pick error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  }, [uploadImage]);

  const pickFromCamera = useCallback(async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos');
        return;
      }

      const result = await launchCamera({ 
        mediaType: 'photo', 
        cameraType: 'back',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Camera Error', result.errorMessage || 'Unable to open camera');
        return;
      }

      await uploadImage(result);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  }, [uploadImage]);

  const removeImage = useCallback(() => {
    setImageFile(null);
    setError(null);
    onUploadSuccess('');
  }, [onUploadSuccess]);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    loading,
    imageFile,
    error,
    pickFromGallery,
    pickFromCamera,
    removeImage,
    cancelUpload,
  };
}

// Multiple Images Upload Hook
export function useMultipleImageUpload(onUploadSuccess = () => {}) {
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const uploadQueueRef = useRef([]);
  const abortControllersRef = useRef(new Map());

  const uploadSingleImage = useCallback(async (file, fileId) => {
    const validation = validateImage(file);
    
    if (!validation.valid) {
      setImageFiles(prev => prev.map(img => 
        img._id === fileId 
          ? { ...img, uploading: false, error: validation.error }
          : img
      ));
      return null;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    });

    const abortController = new AbortController();
    abortControllersRef.current.set(fileId, abortController);

    try {
      const response = await axios.post(UPLOAD_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: abortController.signal,
        timeout: 30000,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setImageFiles(prev => prev.map(img =>
            img._id === fileId ? { ...img, progress } : img
          ));
        },
      });

      const imageUrl = response.data?.url || response.data?.data?.imageUrl;

      if (!imageUrl) {
        throw new Error('No image URL returned from server');
      }

      return imageUrl;
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Upload cancelled for:', fileId);
        return null;
      }
      throw err;
    } finally {
      abortControllersRef.current.delete(fileId);
    }
  }, []);

  const uploadImage = useCallback(async (result) => {
    try {
      if (!result?.assets || result.assets.length === 0) {
        return;
      }

      // Check max images limit
      if (imageFiles.length + result.assets.length > MAX_IMAGES) {
        Alert.alert('Limit Reached', `You can only upload up to ${MAX_IMAGES} images`);
        return;
      }

      const newUploads = result.assets.map(file => ({
        _id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
        type: file.type,
        name: file.fileName || `image_${Date.now()}.jpg`,
        fileSize: file.fileSize,
        progress: 0,
        uploading: true,
        error: null,
        url: null,
      }));

      // Add placeholders immediately for better UX
      setImageFiles(prev => [...prev, ...newUploads]);
      setLoading(true);

      // Upload images sequentially to avoid overwhelming the server
      const uploadResults = [];
      for (const file of newUploads) {
        try {
          const url = await uploadSingleImage(file, file._id);
          
          if (url) {
            setImageFiles(prev => prev.map(img =>
              img._id === file._id
                ? { ...img, url, uploading: false, progress: 100, error: null }
                : img
            ));
            uploadResults.push(url);
          } else {
            // Upload was cancelled
            setImageFiles(prev => prev.filter(img => img._id !== file._id));
          }
        } catch (err) {
          console.error('Upload failed for image:', file._id, err);
          const errorMsg = err.response?.data?.message || 'Upload failed';
          
          setImageFiles(prev => prev.map(img =>
            img._id === file._id
              ? { ...img, uploading: false, error: errorMsg }
              : img
          ));
        }
      }

      // Update callback with all successfully uploaded URLs
      setImageFiles(prev => {
        const allUrls = prev.filter(img => img.url).map(img => img.url);
        onUploadSuccess(allUrls);
        return prev;
      });
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert('Upload Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [imageFiles.length, onUploadSuccess, uploadSingleImage]);

  const pickFromGallery = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: MAX_IMAGES - imageFiles.length,
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });

      if (result.didCancel || result.errorCode) {
        return;
      }

      await uploadImage(result);
    } catch (error) {
      console.error('Gallery pick error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  }, [imageFiles.length, uploadImage]);

  const pickFromCamera = useCallback(async () => {
    try {
      if (imageFiles.length >= MAX_IMAGES) {
        Alert.alert('Limit Reached', `You can only upload up to ${MAX_IMAGES} images`);
        return;
      }

      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required');
        return;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });

      if (result.didCancel || result.errorCode) {
        return;
      }

      await uploadImage(result);
    } catch (error) {
      console.error('Camera pick error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  }, [imageFiles.length, uploadImage]);

  const removeImage = useCallback((idToRemove) => {
    // Cancel upload if still in progress
    const controller = abortControllersRef.current.get(idToRemove);
    if (controller) {
      controller.abort();
    }

    setImageFiles(prev => {
      const updated = prev.filter(item => item._id !== idToRemove);
      const remainingUrls = updated.filter(img => img.url).map(img => img.url);
      onUploadSuccess(remainingUrls);
      return updated;
    });
  }, [onUploadSuccess]);

  const retryUpload = useCallback(async (fileId) => {
    const fileToRetry = imageFiles.find(img => img._id === fileId);
    if (!fileToRetry) return;

    setImageFiles(prev => prev.map(img =>
      img._id === fileId
        ? { ...img, uploading: true, error: null, progress: 0 }
        : img
    ));

    try {
      const url = await uploadSingleImage(fileToRetry, fileId);
      
      if (url) {
        setImageFiles(prev => {
          const updated = prev.map(img =>
            img._id === fileId
              ? { ...img, url, uploading: false, progress: 100, error: null }
              : img
          );
          const allUrls = updated.filter(img => img.url).map(img => img.url);
          onUploadSuccess(allUrls);
          return updated;
        });
      }
    } catch (err) {
      console.error('Retry failed:', err);
      setImageFiles(prev => prev.map(img =>
        img._id === fileId
          ? { ...img, uploading: false, error: 'Retry failed' }
          : img
      ));
    }
  }, [imageFiles, onUploadSuccess, uploadSingleImage]);

  const clearAll = useCallback(() => {
    // Cancel all ongoing uploads
    abortControllersRef.current.forEach(controller => controller.abort());
    abortControllersRef.current.clear();
    
    setImageFiles([]);
    onUploadSuccess([]);
  }, [onUploadSuccess]);

  return {
    loading,
    imageFiles,
    pickFromGallery,
    pickFromCamera,
    removeImage,
    retryUpload,
    clearAll,
    hasErrors: imageFiles.some(img => img.error),
  };
}

// Standalone file upload utility
export const uploadFileToCloudinary = async (file) => {
  try {
    const fileData = {
      uri: file.uri || file.fileCopyUri || file.path,
      type: file.type || 'application/octet-stream',
      name: file.name || file.fileName || `upload_${Date.now()}.${file.type?.split('/')[1] || 'pdf'}`,
    };

    const formData = new FormData();
    formData.append('file', fileData);

    const response = await axios.post(UPLOAD_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60 seconds for larger files
    });

    const uploadedUrl = response.data?.url || response.data?.data?.imageUrl;

    if (!uploadedUrl) {
      throw new Error('No file URL returned from server');
    }

    return uploadedUrl;
  } catch (error) {
    console.error('Upload Error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
    throw new Error(errorMessage);
  }
};