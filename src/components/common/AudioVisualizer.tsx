import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  isRecording: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRecording }) => {
  const bars = Array.from({ length: 15 }, (_, i) => i);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setTrigger((prev) => prev + 1);
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="flex items-center justify-center gap-1.5 h-20 my-6">
      {bars.map((bar) => (
        <motion.div
          key={bar}
          className={`w-2.5 rounded-full ${isRecording ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
          initial={{ height: 12 }}
          animate={{
            height: isRecording
              ? [12, Math.random() * 50 + 20, 12]
              : 12,
          }}
          transition={{
            duration: 0.5,
            repeat: isRecording ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
