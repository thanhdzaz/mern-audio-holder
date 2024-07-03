// App.js
import React from 'react';
import SongList from './components/Songs';
import './main.css';
import Add from "./components/Add";


function App() {
    return (
        <div className="container">
            <h1>Music Play App</h1>
            <SongList />
            <Add />
        </div>
    );
}

export default App;
