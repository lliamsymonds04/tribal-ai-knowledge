# Scout Hackathon Presentation Plan
## "Tremendous Tribal Knowledge" - 3-5 Minute Demo

**Last Updated**: November 22, 2025
**Presentation Time**: 3-5 minutes
**Demo Style**: Live interactive with crowd participation

---

## Executive Summary

Scout is a tribal knowledge capture platform featuring a Trump AI persona that interviews employees and creates a searchable knowledge base using RAG (Retrieval-Augmented Generation). Our demo balances entertainment (Trump personality) with technical impressiveness (RAG pipeline, voice processing, vector search).

**Demo Goal**: Show the audience how institutional knowledge can be captured in 60 seconds of conversation and instantly retrieved using AI-powered semantic search.

---

## Detailed Demo Flow (5 Minutes)

### **Phase 1: The Hook (0:00 - 0:45)**
*Goal: Grab attention, establish the problem*

**What You Say:**
> "Quick question: Who here has had a coworker leave and thought, 'Oh no, they're the only one who knew how to do X'?"
>
> *[Hands go up]*
>
> "Yeah. Tribal knowledge. It walks out the door. Traditional solution? Documentation. Reality? Nobody does it. It's tedious, it's ignored, and it's always out of date.
>
> So we built Scout. It's an AI interviewer that captures tribal knowledge through conversation. And to make it fun... we made it Trump."

**What You Do:**
- Open Scout on projector (start screen showing)
- Show confidence, smile at "Trump" reveal

**Time Check**: ✅ 45 seconds

---

### **Phase 2: Live Crowd Interview (0:45 - 2:30)**
*Goal: Show personality + voice capture + entertainment value*

**What You Say:**
> "I need a volunteer. Who wants Trump to interview them about their hackathon project? Don't worry, he's very friendly... in his own way."

**What You Do:**
1. **Get volunteer** (30 seconds)
   - Pick someone enthusiastic
   - Have them come to mic/speak loud
   - Click "Start Interview" button

2. **Trump greets them** (10 seconds)
   - Let Trump's initial greeting play (with TTS if available)
   - Point out audio visualization
   - Smile at the personality

3. **First question from Trump** (20 seconds)
   - Trump asks about their project
   - Show it's conversational, not robotic

4. **Volunteer answers via voice** (30-45 seconds)
   - Have them click "🎤 Speak"
   - Let them speak naturally about their project
   - **Watch transcription appear in real-time** ← KEY MOMENT
   - Point at screen: "See? Real-time transcription. No typing."

5. **Trump responds** (15 seconds)
   - Let Trump's response play
   - He'll brag about how tremendous he is at understanding
   - Audience laughs = you're winning

**Backup Plan if No Volunteers:**
- You be the volunteer
- Talk about your own hackathon experience or a fake scenario
- Keep it brief but show the features

**What You Say (Transition):**
> "Okay, that was 60 seconds. No forms. No templates. Just conversation. And it's already saved to our knowledge base with semantic embeddings. Now watch this..."

**Time Check**: ✅ 2:30 total

---

### **Phase 3: Knowledge Extraction (2:30 - 4:00)**
*Goal: Show RAG in action + technical capability*

**What You Do:**
1. **Switch to Extractor page** (5 seconds)
   - Click the purple "Extractor" button
   - Show the Knowledge Search interface

2. **Ask a question about what was just discussed** (10 seconds)
   - Type or use example: "What's the main feature of [volunteer's] project?"
   - Or: "How does [thing they mentioned] work?"
   - Click "Search"

3. **Show RAG retrieval** (15 seconds)
   - Point out "Searching knowledge base..." indicator
   - **Trump responds with information from the interview**
   - Point at "✅ Context Found" indicator
   - Emphasize: "He's pulling this from what we just recorded 30 seconds ago"

4. **Ask a follow-up question** (20 seconds)
   - Show it remembers context
   - Trump responds again, still in character
   - Point out similarity scoring if visible

5. **Show RAG Settings (OPTIONAL)** (10 seconds)
   - Point at Similarity Threshold slider
   - "We can tune how strict the search is"
   - Don't explain deeply, just show it exists

**What You Say:**
> "Notice: Trump is searching our vector database, finding relevant chunks using semantic similarity, and explaining it in his... unique style. This is full RAG - Retrieval-Augmented Generation. Real data, real retrieval, real AI."

**Time Check**: ✅ 4:00 total

---

### **Phase 4: Technical Architecture (4:00 - 4:45)**
*Goal: Impress judges with technical depth*

**What You Say (QUICKLY):**
> "Under the hood: Next.js frontend, Claude Haiku for the AI, OpenAI Whisper for transcription, Supabase with pgvector for semantic search, LangChain for orchestration. Full RAG pipeline: embeddings, vector similarity, context retrieval. All in a Next.js app. The Trump personality? That's just the system prompt."

**What You Do:**
- Speak confidently, don't pause
- If time allows, show one code snippet or architecture diagram
- If time is tight, skip this entirely

**Time Check**: ✅ 4:45 total

---

### **Phase 5: The Vision (4:45 - 5:00)**
*Goal: Land the value proposition*

**What You Say:**
> "This is Scout. Organizations can capture 10 years of expertise in 10 hours of interviews. Onboarding goes from months to weeks. When people leave, their knowledge doesn't. And it's actually fun to use.
>
> That's tribal knowledge, preserved. Questions?"

**What You Do:**
- Make eye contact with judges
- Smile, show confidence
- Open for Q&A if time permits

**Time Check**: ✅ 5:00 total (DONE!)

---

## Crowd Interaction Strategy

### How to Get Volunteers

**Primary Approach:**
- Ask directly: "Who wants to be interviewed by Trump about their hackathon project?"
- Look for enthusiastic people (smiling, nodding)
- Make eye contact with someone who seems interested

**Sweetening the Deal:**
- "Don't worry, he's nice... mostly."
- "You'll get to hear Trump compliment your project - that's worth it, right?"
- "Quick 30 seconds, I promise"

**Pre-Seeding (Recommended):**
- Before demo starts, identify 2-3 people who might volunteer
- Brief chat: "Hey, if I need a volunteer later, would you help?"
- Have a backup person ready

### Handling Different Volunteer Scenarios

**Scenario 1: Shy/Quiet Volunteer**
- Give them easier questions
- "Just tell me one cool thing about your project"
- Keep it short, 20 seconds max

**Scenario 2: Over-Talker**
- Politely interrupt after 30 seconds
- "Awesome, that's perfect! Let's see what Trump thinks..."
- Click to next phase

**Scenario 3: No Volunteers**
- Don't panic!
- **YOU** be the volunteer
- Pre-script: "I'll interview myself about our team's process for building this demo"
- Keep it natural

**Scenario 4: Multiple Volunteers**
- Pick the most enthusiastic one
- "I'll take you! But stick around after if you want to try it too"

### Making It Entertaining

**Trump Personality Moments to Highlight:**
- When he says "tremendous" or "believe me" - smile/laugh
- When he brags - acknowledge it: "There he goes again"
- When he reacts dramatically - play into it
- Don't be afraid to laugh at your own demo

**Audience Engagement:**
- "Has anyone here lost knowledge when someone left? [pause for nods]"
- "Who here actually enjoys writing documentation? [crickets]"
- React to Trump's responses: "See what I mean?"

---

## Technical Talking Points (If Asked)

### RAG Pipeline
- **Embedding Generation**: OpenAI text-embedding-ada-002 (1536 dimensions)
- **Vector Storage**: Supabase PostgreSQL with pgvector extension
- **Similarity Search**: Cosine similarity with IVFFlat indexing
- **Context Retrieval**: Top-k matching with configurable threshold
- **Response Generation**: Claude Haiku 4.5 via LangChain

### Voice Processing
- **STT**: OpenAI Whisper API (real-time transcription)
- **TTS**: Hume AI Octave with custom voice cloning
- **Audio Visualization**: Web Audio API amplitude analysis

### System Architecture
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript 5
- **Backend**: Next.js API Routes (serverless functions)
- **AI Orchestration**: LangChain
- **Database**: Supabase (PostgreSQL + vector extensions)
- **Styling**: Tailwind CSS v4

### Key Features
- Multi-modal input (voice + text)
- Real-time transcription with visualization
- Auto-save to vector database
- Semantic search with source attribution
- Configurable RAG parameters
- Markdown rendering in responses
- Graceful degradation (works without TTS)

---

## Demo Script (Word-for-Word)

### Opening (0:00)
**[Stand confidently, make eye contact]**

"Quick question: Who here has had a coworker leave and thought, 'Oh no, they're the only one who knew how to do X'?"

**[Pause for hands, nod in acknowledgment]**

"Yeah. Tribal knowledge. When people leave, it walks out the door.

The traditional solution? Documentation. The reality? Nobody does it. It's tedious, it gets ignored, and it's always out of date.

So we built Scout - an AI interviewer that captures tribal knowledge through natural conversation. And to make it fun... we made it Trump."

**[Reveal screen with Scout start page]**

### Volunteer Request (0:45)
"I need a volunteer! Who wants Trump to interview them about their hackathon project? Don't worry, he's very friendly... in his own way."

**[Pick volunteer, have them step forward]**

"Awesome! Just talk naturally. Click 'Start Interview'."

**[Click button, let Trump greet]**

### Live Interview (1:00)
"Alright, Trump's going to ask you about your project. Just be yourself!"

**[Let conversation happen naturally]**

**[Point at screen during transcription]**
"Look - real-time transcription. No typing, no forms. Just talking."

**[After Trump responds]**
"See that? He's already processing what you said. This is all being saved with semantic embeddings to our knowledge base."

### Transition to Extraction (2:30)
"Okay, that was 60 seconds. Now here's the magic. Let me switch to our knowledge extractor..."

**[Click Extractor button]**

"...and I'm going to ask Trump a question about what we just captured."

**[Type question related to volunteer's answer]**

"Watch this."

### RAG Demo (2:45)
**[Click Search, show loading]**

"He's searching our vector database... using semantic similarity..."

**[Trump's response appears]**

"And boom. He found the relevant information from 30 seconds ago and explained it. This is RAG - Retrieval-Augmented Generation. Real data, pulled from our database, explained by AI."

**[Optional: Ask follow-up]**
"Let me ask a follow-up to show he remembers context..."

### Technical Summary (4:00)
"So technically: Next.js frontend, Claude Haiku for the AI, OpenAI Whisper for transcription, Supabase with pgvector for semantic search, LangChain tying it together. Full RAG pipeline with configurable parameters. The Trump personality? Just a well-crafted system prompt."

### Closing (4:45)
"This is Scout. Organizations can capture 10 years of expertise in 10 hours of interviews. Onboarding goes from months to weeks. When employees leave, their knowledge doesn't.

And it's actually fun to use.

That's tribal knowledge, preserved. Thank you! Questions?"

**[Smile, open stance, ready for Q&A]**

---

## Backup Plans & Contingencies

### Backup Plan A: Pre-Recorded Demo Video
**When to Use**: Total technical failure, no internet, laptop crashes

**What You Do**:
- Have a 2-minute screen recording of the full demo
- Show video while narrating live
- Still get volunteer to "describe their project" (but don't actually capture it)
- Apologize briefly, pivot to vision

**Preparation**: Record this before the event!

### Backup Plan B: Pre-Loaded Interview
**When to Use**: No volunteers, or volunteer freezes up

**What You Do**:
- Skip live interview phase
- Go directly to Extractor
- "We've already captured several interviews about hackathon processes..."
- Query the pre-loaded data
- Still impressive, loses some wow factor

**Preparation**: Do 2-3 test interviews beforehand and leave them in the database

### Backup Plan C: Your Own Mock Interview
**When to Use**: No volunteers

**What You Do**:
- "I'll interview myself about our team's process for building this"
- Conduct interview with yourself (seems less awkward than it sounds)
- Keep it brief and relevant
- Continue with demo normally

### Backup Plan D: Audio Doesn't Work
**When to Use**: Microphone fails, audio permissions denied

**What You Do**:
- Switch to text input immediately
- "Let me type a response instead - the AI works with both"
- Type a brief answer about the project
- Continue demo, emphasize multi-modal input
- Less impressive but still works

### Backup Plan E: TTS Doesn't Work
**When to Use**: Hume API fails, no audio output

**What You Do**:
- Trump's responses still appear as text
- "The voice isn't working, but you can see his personality in the text"
- Point out the Trump-style language
- Less entertaining but still functional

### Backup Plan F: RAG Returns No Results
**When to Use**: Search threshold too high, no matches found

**What You Do**:
- Trump will say "Nobody's talked about this yet - total disaster!"
- Adjust threshold slider: "Let me lower the strictness..."
- Search again
- If still nothing: "This shows how semantic search works - we need relevant content"
- Pivot to pre-loaded interviews

---

## Pre-Demo Checklist

### 24 Hours Before

- [ ] **Test full demo end-to-end** (at least 3 times)
- [ ] **Record backup video** (screen capture of perfect demo)
- [ ] **Load 2-3 test interviews** into database
- [ ] **Verify all API keys** are working (OpenAI, Anthropic, Hume)
- [ ] **Check internet connectivity** at venue
- [ ] **Test audio setup** (microphone input, speaker output)
- [ ] **Charge laptop** (bring charger too)
- [ ] **Print presentation script** (paper backup)
- [ ] **Identify potential volunteers** (talk to people beforehand)

### 1 Hour Before

- [ ] **Open Scout in browser**
- [ ] **Open backup tabs**:
  - Main page (interviewer)
  - Extractor page
  - Backup video (if using)
- [ ] **Test microphone permissions**
- [ ] **Close unnecessary apps** (free up RAM)
- [ ] **Disable notifications** (no pop-ups during demo)
- [ ] **Check projector connection**
- [ ] **Do one final test run**
- [ ] **Breathe, relax, smile!**

### 5 Minutes Before

- [ ] **Browser tabs ready** (Scout start page open)
- [ ] **Volume at good level** (not too loud, not too quiet)
- [ ] **Stand where judges can see you and screen**
- [ ] **Have water nearby**
- [ ] **Put phone on silent**
- [ ] **Quick bathroom break** (seriously)
- [ ] **Positive mindset**: "This is going to be awesome"

---

## Q&A Preparation

### Expected Questions & Answers

**Q: "How accurate is the RAG retrieval?"**
A: "We use semantic similarity scoring - the threshold is configurable. In testing, relevant chunks score 0.8+ similarity. We can tune strictness based on use case. The vector embeddings from OpenAI are state-of-the-art."

**Q: "Why Trump?"**
A: "Entertainment value! Knowledge capture is typically boring - forms, documentation, templates. Making it entertaining with a recognizable persona increases adoption. It's clearly fictional parody, not affiliated with anyone real. Plus, hackathons should be fun."

**Q: "How does this scale?"**
A: "Supabase with pgvector handles millions of vectors. IVFFlat indexing makes search fast even with large datasets. Claude's context window handles long conversations. We're using serverless functions on Vercel, so it auto-scales. Cost is ~$0.24 per 30-minute interview."

**Q: "What about privacy/security?"**
A: "Currently demo-mode - all data in Supabase with access controls. Production would add: end-to-end encryption, role-based access, PII redaction, audit logs, compliance (GDPR/SOC2). The architecture supports it - just needs implementation."

**Q: "Can you change the personality?"**
A: "Absolutely! It's just a system prompt. Could be a friendly mentor, a technical expert, Yoda, whoever. The RAG pipeline stays the same, personality is a parameter."

**Q: "What's your business model?"**
A: "SaaS subscription. Freemium for small teams (10 interviews/month), paid tiers for enterprises. Alternative: one-time deployment license for internal company use. Target market: mid-to-large companies with high turnover or specialized knowledge."

**Q: "How long did this take to build?"**
A: "Built during this hackathon! [Be honest about timeline]. Core RAG pipeline was the biggest challenge - getting embeddings, vector search, and context retrieval working smoothly took the most time."

**Q: "What's next for Scout?"**
A: "Multi-language support, video interview capture (screen sharing), knowledge graph visualization, automated interview scheduling, integration with Slack/Teams, mobile app, and enterprise features (SSO, advanced security, analytics dashboard)."

---

## Success Metrics

### You Nailed It If:
- ✅ Audience laughed at Trump's personality
- ✅ Volunteer had fun
- ✅ RAG retrieval worked and showed relevant results
- ✅ Judges asked technical questions
- ✅ Someone said "That's actually really cool"
- ✅ Finished in 3-5 minutes
- ✅ No major technical failures

### Room for Improvement If:
- ⚠️ No volunteers stepped up
- ⚠️ Demo ran over 5 minutes
- ⚠️ Technical glitch broke flow
- ⚠️ Audience seemed confused
- ⚠️ Judges looked bored

### Red Flags:
- ❌ Total technical failure
- ❌ Couldn't explain what RAG is
- ❌ Lost train of thought
- ❌ Audience walked away
- ❌ Judges didn't ask questions

---

## Tips for Success

### Before Presenting
1. **Know your timing** - Practice with a timer
2. **Prepare for failure** - Have backup plans ready
3. **Stay hydrated** - Water helps with speaking
4. **Positive visualization** - Imagine it going well
5. **Remember: judges want you to succeed!**

### During Presentation
1. **Smile!** - Enthusiasm is contagious
2. **Make eye contact** - Connect with judges
3. **Speak clearly** - Project your voice
4. **Don't apologize** - If something breaks, pivot smoothly
5. **Have fun** - If you're enjoying it, they will too

### Dealing with Technical Issues
1. **Don't panic** - Take a breath
2. **Acknowledge briefly** - "Tech demo gremlins! Let me try this..."
3. **Use backup plan** - Switch to plan B immediately
4. **Keep energy up** - Don't let failure deflate you
5. **Pivot to vision** - Talk about what it does when working

### If You Forget Your Script
1. **Remember the structure**: Problem → Demo → Tech → Vision
2. **Key phrases**: "Tribal knowledge walks out the door", "60 seconds not 60 forms", "RAG in action"
3. **Show, don't tell** - Let the demo speak for itself
4. **End strong** - "Tribal knowledge, preserved" is your anchor

---

## Final Thoughts

You've built something genuinely impressive. Scout combines entertainment (Trump) with technical depth (RAG pipeline) and real-world value (knowledge preservation). The judges will be impressed if you:

1. **Show confidence** - You built this!
2. **Balance fun and technical** - Laugh at Trump, explain the tech
3. **Make it real** - Use actual volunteer, show real retrieval
4. **Land the vision** - Help them see the impact

**Most importantly**: Have fun with it. This is a hackathon. The Trump personality exists because you wanted to make knowledge capture entertaining. That's innovation. Own it.

---

## Good luck! You've got this. 🎯

**Go make it tremendous!**
