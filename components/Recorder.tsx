"use client";
import React, { useEffect, useState, useRef } from "react";

function Recorder() {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then((stream) => {
                mediaRecorder.current = new MediaRecorder(stream);
                mediaRecorder.current.ondataavailable = (e) => {
                    chunks.current.push(e.data);
                };
                mediaRecorder.current.onstop = () => {
                    const blob = new Blob(chunks.current, {
                        type: "audio/ogg; codecs=opus",
                    });
                    const url = URL.createObjectURL(blob);
                    console.log(url);
                    const audio = new Audio(url);
                    audio.play();
                };
            });

        return () => {
            mediaRecorder.current = null;
        };
    }, []);

    return (
        <div>
            {isRecording ? <div>Recording</div> : <div>Not Recording</div>}
        </div>
    );
}

export default Recorder;
