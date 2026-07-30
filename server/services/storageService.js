import cloudinary from '../config/cloudinary.js';

async function uploadFile(buffer, folder, mimeType) {
  try {
    const resourceType = mimeType?.startsWith('image/') ? 'image' : 'raw';
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: folder || 'mindmeld', resource_type: resourceType },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error('uploadFile error:', error);
    throw error;
  }
}

async function deleteFile(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('deleteFile error:', error);
    throw error;
  }
}

async function uploadAvatar(buffer, userId) {
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'mindmeld/avatars',
          public_id: `avatar_${userId}`,
          overwrite: true,
          resource_type: 'image',
          transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error('uploadAvatar error:', error);
    throw error;
  }
}

function getFileUrl(publicId) {
  try {
    return cloudinary.url(publicId, { secure: true });
  } catch (error) {
    console.error('getFileUrl error:', error);
    return null;
  }
}

export { uploadFile, deleteFile, uploadAvatar, getFileUrl };
