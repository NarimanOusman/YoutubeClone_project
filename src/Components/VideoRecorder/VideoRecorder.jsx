import React, { useState, useRef, useEffect } from 'react';
import { Camera, StopCircle, Play, RotateCcw, Upload, X } from 'lucide-react';
import './VideoRecorder.css';

export default function VideoRecorder({ onRecordingComplete, onClose }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permission, setPermission] = useState(null);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Request camera permissions and set up stream
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setPermission('granted');
      } catch (err) {
        setPermission('denied');
        setError(`Camera access denied: ${err.message}`);
      }
    };

    setupCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp8,opus',
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    // Timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    setError(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleUpload = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (permission === 'denied') {
    return (
      <div className="video-recorder-modal">
        <div className="recorder-container">
          <div className="recorder-close">
            <h2>Camera Access Denied</h2>
            <button onClick={onClose} className="close-btn">
              <X size={24} />
            </button>
          </div>
          <div className="recorder-error">
            <Camera size={64} />
            <p>We need camera permission to record videos.</p>
            <p>Please enable camera access in your browser settings.</p>
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (recordedBlob) {
    return (
      <div className="video-recorder-modal">
        <div className="recorder-container">
          <div className="recorder-close">
            <h2>Review Recording</h2>
            <button onClick={onClose} className="close-btn">
              <X size={24} />
            </button>
          </div>
          <div className="recorder-preview">
            <video
              src={URL.createObjectURL(recordedBlob)}
              controls
              autoPlay
              className="preview-video"
            />
            <div className="preview-info">
              <p>
                <strong>Size:</strong> {(recordedBlob.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p>
                <strong>Duration:</strong> {formatTime(recordingTime)}
              </p>
            </div>
          </div>
          <div className="recorder-actions">
            <button onClick={resetRecording} className="btn-secondary">
              <RotateCcw size={20} />
              Record Again
            </button>
            <button onClick={handleUpload} className="btn-primary">
              <Upload size={20} />
              Use Recording
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-recorder-modal">
      <div className="recorder-container">
        <div className="recorder-close">
          <h2>Record Video</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        {error && <div className="recorder-error-msg">{error}</div>}

        <div className="recorder-preview-area">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="recorder-video"
          />
          {isRecording && (
            <div className="recording-indicator">
              <span className="recording-dot" />
              <span>{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>

        <div className="recorder-actions">
          {!isRecording && !recordedBlob && (
            <button onClick={startRecording} className="btn-primary">
              <Camera size={20} />
              Start Recording
            </button>
          )}

          {isRecording && (
            <>
              {!isPaused ? (
                <button onClick={pauseRecording} className="btn-secondary">
                  <StopCircle size={20} />
                  Pause
                </button>
              ) : (
                <button onClick={resumeRecording} className="btn-secondary">
                  <Play size={20} />
                  Resume
                </button>
              )}
              <button onClick={stopRecording} className="btn-danger">
                <StopCircle size={20} />
                Stop Recording
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
