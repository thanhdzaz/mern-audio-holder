import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../main.css'; // Import CSS file
import { Button, Card } from 'antd';
import Add from './Add';
import Miracle from './Miracle';

function Songs() {
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    // State to keep track of the currently playing song
    const [audio, setAudio] = useState(null);
    const miracle = useRef(null);
    // State to keep track of the audio element



    const fetchSongs = async () => {
        axios.get('http://localhost:5000/api/songs')
            .then(response => {
                setSongs(response.data);
            })
            .catch(error => {
                console.error('Error fetching songs:', error);
            });
    };

    useEffect(() => {
        fetchSongs();
    }, []);

    const playSong = (song) => {
        setCurrentSong(song);
    };

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2 className="text-xl font-bold">Songs</h2>
                <Add onClose={fetchSongs} />
            </div>
            <ul>
                {
                    songs.map(song => (
                        <li key={song._id} className="song-item"
                            onClick={() => playSong(song)}>
                            <span>{song.title} - {song.artist}</span>

                        </li>
                    ))
                }
            </ul>
            {currentSong && (
                <Miracle ref={miracle} {...(currentSong || {})} />
            )}
        </Card>
    );
}

export default Songs;
