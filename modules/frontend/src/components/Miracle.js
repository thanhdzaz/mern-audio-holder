import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";



export default forwardRef((props, ref) => {
  const audioEl = useRef(new Audio());
  const canvasRef = useRef(null);
  const analyser = useRef(null);
  const audioSource = useRef(null);
  const ctxCanvas = useRef(null);

  const [state, setState] = useState({
    track: new Audio(),
    title: '',
    thumbnail: '',
    isPlay: false,
  });

  useImperativeHandle(ref, () => ({}));

  const togglePlay = useCallback(() => {
    if (!audioEl.current.paused) {
      audioEl.current.pause();
      setState((prevState) => ({ ...prevState, isPlay: false }));
      return;
    }

    if (audioEl.current.src != `http://localhost:5000/api/songs/${props._id}/audio`) {
      audioEl.current.src = `http://localhost:5000/api/songs/${props._id}/audio`;
      audioEl.current.crossOrigin = "anonymous";
    }

    audioEl.current.play();
    setState((prevState) => ({ ...prevState, isPlay: true }));

    const audioContext = new AudioContext();

    if (!audioSource.current) {
      audioSource.current = audioContext.createMediaElementSource(audioEl.current);
      analyser.current = audioContext.createAnalyser();
      audioSource.current.connect(analyser.current);
      analyser.current.connect(audioContext.destination);
    }

    analyser.current.fftSize = 32768;
    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const animate = () => {
      ctxCanvas.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      analyser.current.getByteTimeDomainData(dataArray);

      ctxCanvas.current.fillStyle = 'transparent';
      ctxCanvas.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      ctxCanvas.current.lineWidth = 3;
      ctxCanvas.current.strokeStyle = 'rgb(0 0 0)';
      ctxCanvas.current.beginPath();

      const sliceWidth = canvasRef.current.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128;
        const y = v * (canvasRef.current.height / 2);

        if (i === 0) {
          ctxCanvas.current.moveTo(x, y);
        } else {
          ctxCanvas.current.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctxCanvas.current.lineTo(canvasRef.current.width, canvasRef.current.height / 2);
      ctxCanvas.current.stroke();
      requestAnimationFrame(animate);
    };

    animate();
  }, [props._id]);


  useEffect(() => {
    if (!props._id || !canvasRef.current) return

    ctxCanvas.current = canvasRef.current.getContext('2d');
    audioEl.current.onended = function () {
      setState((prevState) => ({ ...prevState, isPlay: false }));
    };
    setState((prevState) => ({
      ...prevState,
      ...props
    }));
    togglePlay();
  }, [props._id, canvasRef]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow: '',
        padding: 4,
        borderRadius: 8,
        paddingLeft: 12
      }}
      className="flex fixed bottom-6 right-6 shadow-cus-1"
    >
      <canvas ref={canvasRef} className="h-[25px] w-[100px] sm:w-[120px]" style={{ width: 200, height: 50 }} />
      {!state.isPlay ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" onClick={togglePlay}>
          <path fill="black" d="M10.396 18.433L17 12l-6.604-6.433A2 2 0 0 0 7 7v10a2 2 0 0 0 3.396 1.433" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" onClick={togglePlay}>
          <path fill="black" d="M8 6a2 2 0 0 0-2 2v8a2 2 0 0 0 4 0V8a2 2 0 0 0-2-2m7 0a2 2 0 0 0-2 2v8a2 2 0 0 0 4 0V8a2 2 0 0 0-2-2" />
        </svg>
      )}
    </div>
  );
})