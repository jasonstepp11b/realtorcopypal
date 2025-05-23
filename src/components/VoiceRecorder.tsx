"use client";

import { useState, useEffect } from "react";
import { useDeepgram } from "../lib/contexts/DeepgramContext";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const {
    connectToDeepgram,
    disconnectFromDeepgram,
    connectionState,
    realtimeTranscript,
  } = useDeepgram();

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  const handleStartRecording = async () => {
    await connectToDeepgram();
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    disconnectFromDeepgram();
    setIsRecording(false);

    // Save the note to Supabase
    if (realtimeTranscript) {
      try {
        const { data, error } = await supabase.from("notes").insert([
          {
            text: realtimeTranscript,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) {
          console.error("Error saving note:", error);
        }
      } catch (error) {
        console.error("Error saving note:", error);
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      <button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        className={`w-full py-2 px-4 rounded-full ${
          isRecording
            ? "bg-red-500 hover:bg-red-600"
            : "bg-blue-500 hover:bg-blue-600"
        } text-white font-bold`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      {isRecording && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-4"
          />
          <p className="text-sm text-gray-600">{realtimeTranscript}</p>
        </div>
      )}
    </div>
  );
}
