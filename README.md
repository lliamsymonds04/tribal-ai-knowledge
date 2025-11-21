# Scout - Tribal Knowledge Capture Platform

> Built at the Tanda Hackathon

An AI-powered platform designed to capture and preserve tribal knowledge from business employees through conversational interviews. Scout uses advanced AI and voice technology to make knowledge transfer natural, efficient, and accessible.

## About

Scout helps organizations capture the invaluable institutional knowledge that exists in their employees' minds. Through conversational AI interviews, employees can easily share their expertise, processes, and insights in a natural way - either by speaking or typing. The platform automatically transcribes, organizes, and makes this knowledge searchable and actionable.

### The Problem

Companies lose critical "tribal knowledge" when employees leave or retire. This undocumented expertise about processes, client relationships, and institutional wisdom is often never captured, leading to:
- Loss of efficiency and productivity
- Repeated mistakes
- Poor onboarding experiences
- Difficulty scaling operations

### The Solution

Scout makes knowledge capture effortless through:
- **Conversational AI Interviews**: Natural dialogue instead of tedious documentation
- **Voice & Text Input**: Flexible input methods for any preference
- **Automatic Transcription**: No manual note-taking required
- **Smart AI Questioning**: Claude AI asks relevant follow-up questions
- **Organized Transcripts**: Professional, timestamped records ready for review

## Features

### 🎤 Multi-Modal Input
- **Voice Recording**: Speak naturally to share knowledge
- **Real-time Transcription**: Automatic speech-to-text using OpenAI Whisper
- **Text Input**: Type responses when preferred
- **Seamless Switching**: Use both methods in the same conversation

### 🤖 Intelligent AI Interviewer
- **Powered by Claude**: Advanced conversational AI via LangChain
- **Context-Aware**: Asks relevant follow-up questions
- **Full History**: Remembers entire conversation for coherent dialogue
- **Markdown Support**: Rich text formatting in responses
- **Adaptive**: Adjusts questions based on user's expertise and role

### 🔊 Natural Voice Feedback (Optional)
- **Eleven Labs TTS**: AI speaks responses naturally
- **Auto-playback**: Hear questions and confirmations
- **Playback Controls**: Pause or stop anytime
- **Graceful Degradation**: Works without TTS if not configured

### 📝 Knowledge Management
- **Download Transcripts**: Export conversations as formatted text
- **Timestamped Records**: Complete history with timestamps
- **Professional Format**: Clean, readable documentation
- **Easy Sharing**: Share knowledge across teams

### 🎨 User-Friendly Interface
- **Avatar Display**: Visual presence for engaging conversations
- **Responsive Design**: Works on any device
- **Real-time Feedback**: Visual indicators for all actions
- **Modern Design**: Clean, professional interface with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React 19 + Tailwind CSS v4
- **AI**: Claude Haiku 4.5 (via LangChain + Anthropic)
- **Speech-to-Text**: OpenAI Whisper
- **Text-to-Speech**: Eleven Labs (optional)
- **Markdown Rendering**: react-markdown
- **Deployment**: Vercel-ready with serverless functions

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Required API keys:
  - OpenAI (for transcription)
  - Anthropic (for AI conversation)
- Optional API key:
  - Eleven Labs (for text-to-speech)

## Quick Start

### 1. Install Dependencies

```bash
cd scout
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the `scout` directory:

```bash
cd scout
cp .env.local.example .env.local
```

Add your API keys to `.env.local`:

```bash
# Required
OPENAI_API_KEY=sk-your-openai-api-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# Optional (for text-to-speech)
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
```

### 3. Get API Keys

**OpenAI** (Required):
1. Visit https://platform.openai.com
2. Create account and navigate to API Keys
3. Generate new secret key

**Anthropic** (Required):
1. Visit https://console.anthropic.com
2. Sign up and go to Settings → API Keys
3. Create new key

**Eleven Labs** (Optional):
1. Visit https://elevenlabs.io
2. Sign up and go to Settings → API Keys
3. Copy your API key

### 4. Run the Application

```bash
cd scout
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start capturing knowledge!

## How to Use

### For Employees (Knowledge Sharers)

1. **Start a Session**: The AI greets you and explains the process
2. **Share Your Knowledge**:
   - Click "🎤 Speak" to talk naturally, or
   - Type your responses in the text field
3. **Answer Follow-ups**: AI asks relevant questions to dive deeper
4. **Review & Export**: Download the complete transcript when done

### For Organizations

1. **Set Up Sessions**: Configure AI prompts for specific knowledge areas
2. **Assign Interviews**: Direct employees to share expertise in their domain
3. **Collect Transcripts**: Gather exported conversations
4. **Organize Knowledge**: Build your knowledge base from transcripts
5. **Onboard & Train**: Use captured knowledge for new employee training

## Use Cases

- **Succession Planning**: Capture retiring employees' expertise
- **Onboarding**: Document processes for new hire training
- **Process Documentation**: Record "how we do things here"
- **Best Practices**: Collect proven approaches from top performers
- **Client Knowledge**: Preserve relationship history and preferences
- **Troubleshooting Guides**: Document problem-solving approaches
- **Company History**: Record institutional memory and stories

## Project Structure

```
tribal-ai-knowledge/
├── scout/                  # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── chat/       # Claude conversation endpoint
│   │   │   │   ├── transcribe/ # Whisper transcription endpoint
│   │   │   │   └── tts/        # Eleven Labs TTS endpoint
│   │   │   ├── page.tsx        # Main application
│   │   │   └── layout.tsx      # Root layout
│   │   └── components/
│   │       ├── AIInterviewer.tsx   # Main interview component
│   │       ├── AudioRecorder.tsx   # Voice recording
│   │       └── AvatarDisplay.tsx   # Avatar placeholder
│   ├── .env.local         # Your environment variables (create this)
│   └── package.json       # Dependencies
├── CLAUDE.md              # Developer documentation
└── README.md              # This file
```

## Development Commands

```bash
# From scout/ directory:
npm run dev    # Start development server (localhost:3000)
npm run build  # Build for production
npm start      # Run production build
npm run lint   # Lint code
```

## Deployment to Vercel

1. **Push to GitHub**: Commit and push your code
2. **Import to Vercel**:
   - Go to https://vercel.com
   - Import your GitHub repository
3. **Configure Environment Variables**:
   - Add `OPENAI_API_KEY`
   - Add `ANTHROPIC_API_KEY`
   - Add `ELEVENLABS_API_KEY` (optional)
4. **Deploy**: Vercel automatically builds and deploys

All API routes are automatically configured as serverless functions.

## Cost Considerations

### Per Interview (estimated)

**OpenAI Whisper** (voice transcription):
- ~$0.006 per minute of speech
- Example: 30-minute interview = $0.18

**Claude Haiku 4.5** (conversation):
- Input: ~$1 per million tokens (~$0.01 per interview)
- Output: ~$5 per million tokens (~$0.05 per interview)
- Example: Typical interview = $0.06

**Eleven Labs** (optional TTS):
- Free tier: 10,000 characters/month
- Paid plans available for higher usage

**Total per 30-min interview**: ~$0.24 (without TTS)

### Scaling

- 100 interviews/month: ~$24/month
- 500 interviews/month: ~$120/month
- Enterprise pricing available for high-volume usage

## Troubleshooting

### Audio Not Recording
- Check browser microphone permissions
- Ensure HTTPS (required for microphone access)
- Try a different browser (Chrome/Edge recommended)

### AI Not Responding
- Verify `ANTHROPIC_API_KEY` is correct in `.env.local`
- Check API key has sufficient credits
- Review server console logs for errors

### Text-to-Speech Not Working
- TTS is optional and will gracefully disable without key
- Verify `ELEVENLABS_API_KEY` if you want voice responses
- Check Eleven Labs account has available characters

### Deployment Issues
- Ensure all environment variables are set in Vercel
- Check build logs for errors
- Verify Node.js version compatibility (18+)

## Built at Tanda Hackathon

This project was created during the Tanda Hackathon to solve the real problem of preserving institutional knowledge in organizations. Special thanks to the Tanda team for hosting and supporting innovation in workplace solutions.

## Contributing

We welcome contributions! This project is designed to help businesses preserve their most valuable asset - their people's knowledge. If you have ideas for improvements, please open an issue or submit a pull request.

## License

MIT

## Support

For technical details, see `CLAUDE.md` in the root directory.

---

**Made with ❤️ at the Tanda Hackathon**
