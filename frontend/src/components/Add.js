const Add = () => {
    return (<form action="http://localhost:5000/api/upload" method="post" enctype="multipart/form-data">
            <input type="text" name="title" placeholder="Title" required/>
            <input type="text" name="artist" placeholder="Artist" required/>
            <input type="text" name="album" placeholder="Album"/>
            <input type="number" name="duration" placeholder="Duration (in seconds)" required/>
            <input type="file" name="audioFile" required/>
            <button type="submit">Upload</button>
        </form>)
}

export default Add;