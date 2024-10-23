"use client";
import React, { useCallback, useEffect, useState, useRef } from "react";

function Recorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const hasStartedListening = useRef(false);

    const startRecording = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);

        const temporaryRecognition = new webkitSpeechRecognition();

        temporaryRecognition.start();

        mediaRecorder.start();
        setIsRecording(true);
        console.log("Recording started");

        mediaRecorder.ondataavailable = function (event) {
            const blob = new Blob([event.data], { type: "audio/wav" });
            const url = URL.createObjectURL(blob);
            console.log(url);
        };

        temporaryRecognition.onspeechend = function () {
            console.log("Speech ended");
            temporaryRecognition.stop();
            mediaRecorder.stop();
            mediaRecorder.onstop = function () {
                console.log("Recording stopped");
                setIsRecording(false);
                setIsListening(false);
            };
        };
    }, []);

    const startListening = useCallback(() => {
        if (isListening || hasStartedListening.current) {
            console.log("Already listening, skipping startListening");
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.start();
        setIsListening(true);
        hasStartedListening.current = true;
        console.log("Recognition started");

        recognition.onresult = function (event) {
            const transcript = event.results[
                event.results.length - 1
            ][0].transcript
                .trim()
                .toLowerCase();
            console.log(transcript);

            if (transcript.includes("jarvis")) {
                recognition.stop();
                recognition.onend = async function () {
                    hasStartedListening.current = false;
                    await startRecording();
                    console.log("jarvis detected. Listening for command...");
                };
            }
        };

        recognition.onend = function () {
        //     setIsListening(true);
            setIsListening(false);
            hasStartedListening.current = false;
            console.log("Recognition ended abrupty");
        };

    }, [startRecording, isListening]);

    useEffect(() => {
        console.log(isListening, isRecording);
        if (!isListening && !isRecording) {
            startListening();
        }
    }, [isListening, isRecording, startListening]);

    return (
        <div>
            {isRecording ? <div>Recording</div> : <div>Not Recording</div>}
        </div>
    );
}

export default Recorder;
