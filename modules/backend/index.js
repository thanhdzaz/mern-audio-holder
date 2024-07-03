const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const { GridFSBucket, ObjectId } = require('mongodb');
const shortid = require('shortid');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// Initialize GridFS
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
    console.log('GridFS initialized');
    gfs = new GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
});

// Create storage engine using GridFS
const storage = new GridFsStorage({
    url: mongoURI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        const fileInfo = {
            filename: `${shortid.generate()}-${file.originalname}`,
            bucketName: 'uploads'
        };
        console.log('File info:', fileInfo); // Debugging statement
        return fileInfo;
    }
});

const upload = multer({ storage });

// Song Model
const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    songcode: { type: String, required: true, unique: true },
    album: String,
    duration: { type: Number, required: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads.files' }
});

const Song = mongoose.model('Song', songSchema);

// Route to handle file uploads
app.post('/api/upload', upload.single('audioFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('Uploaded file:', req.file);

    // Check if req.file.id exists
    if (!req.file.id) {
        return res.status(500).json({ error: 'File ID is missing in the upload response' });
    }

    const { title, artist, album, duration } = req.body;

    const newSong = new Song({
        title,
        artist,
        songcode: shortid.generate(),
        album,
        duration,
        fileId: req.file.id
    });

    try {
        await newSong.save();
        console.log('New song saved:', newSong);
        res.json({ fileId: req.file.id });
    } catch (error) {
        console.error('Error saving song:', error);
        res.status(500).json({ error: 'Failed to save song' });
    }
});

// Route to stream audio file
app.get('/api/songs/:songId/audio', async (req, res) => {
    try {
        const songId = req.params.songId;

        if (!ObjectId.isValid(songId)) {
            return res.status(404).json({ error: 'Invalid song ID' });
        }

        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }

        res.set('Content-Type', 'audio/wav');

        const downloadStream = gfs.openDownloadStream(song.fileId);
        downloadStream.pipe(res);
    } catch (err) {
        console.error('Error streaming audio file:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route to get all songs
app.get('/api/songs', async (req, res) => {
    try {
        const { title, artist, album } = req.query;
        const filter = {};
        if (title) filter.title = new RegExp(title, 'i');
        if (artist) filter.artist = new RegExp(artist, 'i');
        if (album) filter.album = new RegExp(album, 'i');

        const songs = await Song.find(filter);
        res.json(songs);
    } catch (err) {
        console.error('Error fetching songs:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route to create a new song
app.post('/api/songs', async (req, res) => {
    try {
        const { title, artist, album, duration } = req.body;
        const song = new Song({ title, artist, album, duration, songcode: shortid.generate() });
        await song.save();
        res.json(song);
    } catch (err) {
        console.error('Error creating song:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
