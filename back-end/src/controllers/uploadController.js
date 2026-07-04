const { uploadAudioToS3 } = require('../services/s3Service');

const uploadAudio = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { buffer, originalname, mimetype } = req.file;

    if (!['audio/webm', 'video/webm', 'audio/mp4', 'video/mp4'].includes(mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Only WebM and MP4 are allowed.' });
    }

    const fileUrl = await uploadAudioToS3(buffer, originalname, mimetype);

    res.status(200).json({
      message: 'Audio uploaded successfully',
      url: fileUrl,
    });
  } catch (error) {
    console.error('Error uploading audio:', error);
    res.status(500).json({ error: 'Failed to upload audio' });
  }
};

module.exports = {
  uploadAudio,
};
