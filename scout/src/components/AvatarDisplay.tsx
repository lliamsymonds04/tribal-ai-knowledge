'use client';

interface AvatarDisplayProps {
  isSpeaking?: boolean;
}

export default function AvatarDisplay({ isSpeaking = false }: AvatarDisplayProps) {
  return (
    <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
      {/* Placeholder Avatar */}
      <div className="text-center">
        <div className={`w-32 h-32 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center transition-all ${
          isSpeaking ? 'ring-4 ring-blue-500 ring-opacity-50 animate-pulse' : ''
        }`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 text-gray-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </div>
        <p className="text-gray-400 text-sm">
          {isSpeaking ? 'Speaking...' : 'Avatar Placeholder'}
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-4 left-4 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>
    </div>
  );
}
