"use client";
import Image from "next/image";

interface AvatarDisplayProps {
    isSpeaking?: boolean;
    audioAmplitude?: number;
}

export default function AvatarDisplay({
    isSpeaking = false,
    audioAmplitude = 0,
}: AvatarDisplayProps) {
    const ringOpacity = audioAmplitude * 0.5; // Opacity from 30% to 80%
    // Apply positive y translation based on amplitude (0-20px range for mouth opening)
    const mouthTranslateY = audioAmplitude * 20;

    return (
        <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Base Avatar (blinking gif) - Lower z-index */}
            <div className="absolute inset-0 max-w">
                <Image
                    src="/trump_blinking_no_mouth.gif"
                    alt="Avatar"
                    width={1524}
                    height={1016}
                    className="object-cover"
                />
            </div>
            {/* Mouth overlay - Higher z-index */}
            <div
                className="absolute z-20 drop-shadow-md drop-shadow-black/40 translate-y-5 duration-0"
                style={{
                    transform: `translateY(${mouthTranslateY}px)`
                }}
            >
                <Image
                    src="/trump_mouth_only.png"
                    alt="Avatar's Mouth"
                    width={56}
                    height={85}
                />
            </div>
            {/* Text Overlay */}
            <p className="text-white bg-black px-2 text-lg absolute bottom-4 z-30">
                {isSpeaking ? "Speaking..." : "Donald Trump"}
            </p>
        </div>
    );
}
