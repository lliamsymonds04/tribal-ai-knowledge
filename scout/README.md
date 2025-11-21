# Scout - AI Interview Platform

An intelligent interview platform powered by Claude AI, featuring voice-to-text transcription, conversational AI, and optional text-to-speech capabilities.

## Features

### 🎤 Voice & Text Input
- **Voice Recording**: Record audio responses using your microphone
- **Real-time Transcription**: Automatic speech-to-text using OpenAI Whisper
- **Text Input**: Type responses for flexibility
- **Dual Input Support**: Switch seamlessly between voice and text

### 🤖 AI Interviewer
- **Powered by Claude**: Advanced conversational AI via LangChain
- **Full Conversation History**: AI remembers entire interview context
- **Markdown Support**: Rich text formatting in AI responses
- **Professional Interview Style**: Empathetic and thoughtful questioning

### 🔊 Text-to-Speech (Optional)
- **Eleven Labs Integration**: Natural-sounding AI voice responses
- **Auto-playback**: AI responses are spoken automatically
- **Playback Controls**: Stop audio anytime
- **Graceful Fallback**: Works without TTS if API key not configured

### 📝 Export & Review
- **Download Transcripts**: Export full interview as formatted text file
- **Timestamped Messages**: Complete conversation history with timestamps
- **Professional Format**: Clean, readable transcript layout

### 🎨 Modern UI
- **Avatar Display**: Placeholder for visual avatar integration
- **Responsive Design**: Works on desktop and mobile
- **Real-time Indicators**: Visual feedback for recording, processing, and audio playback
- **Tailwind CSS**: Modern, clean interface

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React 19 + Tailwind CSS v4
- **AI**: Claude (via LangChain + Anthropic)
- **Speech-to-Text**: OpenAI Whisper
- **Text-to-Speech**: Eleven Labs (optional)
- **Markdown Rendering**: react-markdown

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- API keys (see setup below)

## Setup Instructions

### 1. Clone and Install

```bash
# Navigate to project directory
cd scout

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `scout` directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys:

```bash
# Required: For audio transcription
OPENAI_API_KEY=sk-your-openai-api-key-here

# Required: For AI chat with Claude
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# Optional: For text-to-speech
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
```

### 3. Get API Keys

**OpenAI** (Required):
- Sign up at https://platform.openai.com
- Go to API Keys section
- Create new key

**Anthropic** (Required):
- Sign up at https://console.anthropic.com
- Go to Settings → API Keys
- Create new key

**Eleven Labs** (Optional):
- Sign up at https://elevenlabs.io
- Go to Settings → API Keys
- Copy your key

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

1. **Start Interview**: The AI will greet you and ask you to introduce yourself
2. **Respond**:
   - Click "🎤 Speak" to record audio, or
   - Type your message in the text field
3. **AI Responds**: Claude generates a response (with optional TTS playback)
4. **Continue Conversation**: Keep responding to build your interview
5. **Download Transcript**: Click "Download" to save the full conversation

## Project Structure

```
scout/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/       # Claude chat endpoint
│   │   │   ├── transcribe/ # Whisper transcription endpoint
│   │   │   └── tts/        # Eleven Labs TTS endpoint
│   │   ├── page.tsx        # Main application page
│   │   └── layout.tsx      # Root layout
│   └── components/
│       ├── AIInterviewer.tsx   # Main interview component
│       ├── AudioRecorder.tsx   # Voice recording component
│       └── AvatarDisplay.tsx   # Avatar placeholder component
├── public/             # Static assets
├── .env.local         # Environment variables (create this)
└── package.json       # Dependencies
```

## API Routes

- `POST /api/chat` - Send message to Claude AI
- `POST /api/transcribe` - Transcribe audio to text
- `POST /api/tts` - Generate speech from text (optional)

## Development Commands

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Start production server
npm run lint   # Run ESLint
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel project settings:
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `ELEVENLABS_API_KEY` (optional)
4. Deploy

The app will automatically build and deploy on Vercel with all serverless API routes configured.

## Cost Considerations

**OpenAI Whisper**:
- ~$0.006 per minute of audio

**Claude API** (Haiku 4.5):
- Input: ~$1 per million tokens
- Output: ~$5 per million tokens

**Eleven Labs** (Optional):
- Free tier: 10,000 characters/month
- Paid plans available for higher usage

## Troubleshooting

**Audio recording not working:**
- Ensure browser has microphone permissions
- Check browser console for errors

**AI not responding:**
- Verify ANTHROPIC_API_KEY is set correctly
- Check server logs for API errors

**TTS not playing:**
- TTS is optional and gracefully disabled without API key
- Check ELEVENLABS_API_KEY if you want TTS enabled

## License

MIT

## Support

For issues or questions, please check the GitHub repository or consult the documentation in `CLAUDE.md`.
