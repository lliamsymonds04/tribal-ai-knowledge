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
    // Apply positive y translation based on amplitude - scale with container size
    // Convert 20px at fullscreen to percentage (20px relative to typical fullscreen height ~1000px ≈ 2%)
    const mouthTranslateYPercent = audioAmplitude * 20;

    return (
        <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Combined image container - maintains aspect ratio of base image */}
            <div className="relative w-full h-full max-w-full max-h-full" style={{ aspectRatio: '1524/1016' }}>
                {/* Base Avatar (blinking gif) - Lower z-index */}
                <Image
                    src="/trump_blinking_no_mouth.gif"
                    alt="Avatar"
                    fill={true}
                    className="object-contain"
                />
                {/* Mouth overlay - Higher z-index, positioned relative to base image */}
                {/* Sized at 6.8% of parent width (proportional to base image) */}
                <div
                    className="absolute z-20 drop-shadow-md drop-shadow-black/40 duration-0"
                    style={{
                        width: '6.8%',
                        aspectRatio: '56/85',
                        left: '50%',
                        top: '33%',
                        transform: `translate(-50%, ${mouthTranslateYPercent}%)`
                    }}
                >
                    <Image
                        src="/trump_mouth_only.png"
                        alt="Avatar's Mouth"
                        fill={true}
                        className="object-contain"
                    />
                </div>
            </div>
            {/* Text Overlay */}
            <p className="text-white bg-black px-2 text-lg absolute bottom-4 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap">
                {isSpeaking ? "Speaking..." : "Donald Trump"}
            </p>
        </div>
    );
}
