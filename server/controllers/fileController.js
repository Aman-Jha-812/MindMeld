import cloudinary from '../config/cloudinary.js';
import { uploadFile as cloudinaryUpload } from '../services/storageService.js';

export const uploadToCloudinary = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await cloudinaryUpload(req.file.buffer, 'mindmeld-uploads', req.file.mimetype);

    res.status(200).json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadFile = async (req, res) => {
  const { url, name } = req.query;
  if (!url) return res.status(400).json({ success: false, message: 'File URL is required' });

  const safeName = name || 'download';

  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (resp.ok) {
      const contentType = resp.headers.get('content-type') || 'application/octet-stream';
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(safeName)}`);
      res.setHeader('Content-Type', contentType);
      const buf = Buffer.from(await resp.arrayBuffer());
      return res.send(buf);
    }
  } catch {}

  const dlUrl = url.replace(/\/upload\//, `/upload/fl_attachment:${encodeURIComponent(safeName)}/`);
  res.redirect(dlUrl);
};