import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'text/plain',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type ${file.mimetype} is not supported. Allowed: images, PDF, DOC, DOCX, ZIP, TXT`
      ),
      false
    );
  }
};

const limits = {
  fileSize: 50 * 1024 * 1024,
};

const upload = multer({ storage, fileFilter, limits });

export const uploadFile = upload.single('file');
export const uploadMultiple = upload.array('files', 5);
