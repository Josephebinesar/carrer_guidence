# 🎓 PlacementPrep AI – Interactive Mock Interview Simulator

> An AI-powered mock interview platform built for undergraduate students preparing for Indian campus placements. Upload your resume, pick a target role, and get grilled by a senior AI interviewer — one question at a time.

---

## ✨ Features

| Feature | Details |
|---|---|
| 📄 Resume Upload | Drag & drop PDF upload with text extraction via pdf-parse |
| 🎯 Role Selection | Software Engineer, Data Analyst, ML Engineer, Web Dev, PM, or Custom |
| 🤖 AI Interviewer | Powered by **Mistral-7B-Instruct-v0.2** via HuggingFace Inference API |
| 💬 Chat Interface | One question at a time — 5 Technical + 3 HR questions |
| 📊 Scoring | AI evaluates and scores your answers out of 100 |
| 📥 PDF Report | Download a full report with Q&A, strengths, weaknesses & improvements |
| 🗄️ Supabase DB | Interview sessions and results saved to Postgres via Supabase |
| 📱 Responsive | Fully mobile-responsive with a premium dark UI |

---

## 🚀 Quick Start

### 1. Clone / Navigate to the Project

```bash
cd "path/to/task4"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Open `.env.local` and fill in your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
HUGGINGFACE_API_KEY=hf_your_api_key
```

> See **Configuration** section below for where to find these.

### 4. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) → your project → **SQL Editor**
2. Paste the contents of `supabase/schema.sql` and run it
3. This creates the `interviews` table with RLS policies

### 5. Run the Development Server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🔧 Configuration

### 🟢 Supabase Setup

1. Go to [https://supabase.com](https://supabase.com) and create a **free** project
2. In your project: **Settings → API**
   - Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run `supabase/schema.sql` in the **SQL Editor**

### 🤗 HuggingFace API Key

1. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create a new **Read** token
3. Copy it → `HUGGINGFACE_API_KEY`

> **Model used**: `mistralai/Mistral-7B-Instruct-v0.2`  
> Make sure you have access to the model (accept the terms on the model page if prompted).

---

## 📁 Project Structure

```
task4/
├── app/
│   ├── page.tsx                    # 🏠 Home / Landing Page
│   ├── layout.tsx                  # Root layout + metadata
│   ├── globals.css                 # Global styles & animations
│   ├── dashboard/
│   │   └── page.tsx                # 📋 Resume Upload + Role Selection
│   ├── interview/
│   │   └── page.tsx                # 💬 Live Chat Interview
│   ├── results/
│   │   └── page.tsx                # 📊 Results & Feedback
│   └── api/
│       ├── upload-resume/route.ts  # POST – parse PDF, create DB record
│       ├── interview/route.ts      # POST – get next question or evaluation
│       └── save-result/route.ts    # POST – save final results to DB
│
├── components/
│   ├── ResumeUpload.tsx            # Drag & drop PDF uploader
│   ├── InterviewChat.tsx           # Chat interface with progress bar
│   └── FeedbackReport.tsx          # Score ring + cards + PDF download
│
├── lib/
│   ├── supabaseClient.ts           # Lazy Supabase client
│   ├── huggingface.ts              # HF API + prompt builder
│   └── pdfParser.ts                # PDF text extraction (server-side)
│
├── supabase/
│   └── schema.sql                  # 🗄️ Run this in Supabase SQL Editor
│
├── .env.local                      # 🔐 Your API keys (never commit this!)
├── vercel.json                     # ▲ Vercel deployment config
└── next.config.ts                  # Next.js config
```

---

## 🗄️ Supabase Table Schema

**Table name:** `interviews`

| Column | Type | Description |
|---|---|---|
| `id` | `uuid` | Primary key (auto-generated) |
| `resume_text` | `text` | Extracted text from the uploaded PDF |
| `role` | `text` | Selected interview role |
| `questions` | `jsonb` | Array of AI-generated questions |
| `answers` | `jsonb` | Array of candidate answers |
| `score` | `integer` | Final score out of 100 |
| `feedback` | `jsonb` | Strengths, weaknesses, improvements, topics |
| `created_at` | `timestamptz` | Auto-set timestamp |

---

## 🤖 AI System Prompt

The AI acts as a senior interviewer from **TCS, Zoho, Infosys, Google India, and Amazon India**:

- ✅ Asks **1 question at a time**
- 🔧 Questions **1–5**: Technical (role-specific + resume-based)
- 🤝 Questions **6–8**: HR (behavioural, situational)
- 📊 After question 8: Returns a **JSON evaluation** with score + feedback

---

## 🌐 Deploying to Vercel

### Option A – Vercel Dashboard (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import repo
3. Add environment variables in **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `HUGGINGFACE_API_KEY`
4. Click **Deploy** ✅

### Option B – Vercel CLI

```bash
npm i -g vercel
vercel
```
Follow the prompts. Set env vars with:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add HUGGINGFACE_API_KEY
```

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at http://localhost:3000 |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | run ESLint |

---

## 🔒 Security Notes

- `.env.local` is **gitignored** — never commit it
- `HUGGINGFACE_API_KEY` is **server-side only** — never exposed to the browser
- Supabase RLS policies restrict data access by the anon key
- For production auth, integrate `supabase.auth` and scope RLS by `auth.uid()`

---

## 📊 Interview Flow

```
User visits /dashboard
    → Selects role (e.g. "Software Engineer")
    → Uploads PDF resume
    → POST /api/upload-resume
        ✓ Extracts text with pdf-parse
        ✓ Creates DB record in Supabase
        ✓ Returns interviewId + resumeText

Redirected to /interview
    → POST /api/interview (Q1)
        ✓ Builds Mistral prompt with resume + role
        ✓ Returns first technical question

User answers → POST /api/interview (Q2–Q8)
    → Each response feeds conversation history
    → Q6–Q8 switch to HR questions automatically

After Q8:
    → AI returns JSON evaluation
    → POST /api/save-result saves to Supabase
    → Redirected to /results

/results page:
    → Shows score ring, strengths, weaknesses
    → Full Q&A transcript
    → Download PDF button (jsPDF)
```

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS + Custom CSS |
| AI Model | Mistral-7B-Instruct-v0.2 (HuggingFace) |
| Database | Supabase (PostgreSQL) |
| PDF Parsing | pdf-parse (server-side) |
| PDF Export | jsPDF (client-side) |
| Deployment | Vercel |

---

## 📝 License

MIT License — free to use and modify.

---

*Built for campus placement preparation 🎓*
