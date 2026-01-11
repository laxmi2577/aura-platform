# 🚀 Deployment Guide: Aura AI (Forever Free Tier)

This guide explains how to deploy the entire Aura Platform (Frontend + Backend) for **$0.00** using industry-standard high-performance platforms.

## 🏗️ Architecture
- **Frontend**: [Vercel](https://vercel.com) (Free, fast, specifically built for Next.js).
- **Backend (Python)**: [Hugging Face Spaces](https://huggingface.co/spaces) (Free 16GB RAM, perfect for AI models).
- **Database**: [Supabase](https://supabase.com) (Free 500MB PostgreSQL).

---

## ✅ Prerequisites
1.  **GitHub Account** (Push your code to a repository `laxmi2577/aura-platform`).
2.  **Hugging Face Account**.
3.  **Vercel Account**.
4.  **Supabase Project** (You already have this).

---

## 1️⃣ Part 1: Deploy Backend (Hugging Face Spaces)
*We use Hugging Face because it provides a generous 16GB RAM for free, which is required for our Audio/ML models. Render's free tier (512MB) will crash immediately.*

1.  **Create a New Space**:
    -   Go to [huggingface.co/new-space](https://huggingface.co/new-space).
    -   **Space Name**: `aura-ml-brain` (or similar).
    -   **License**: `MIT`.
    -   **SDK**: Select **Docker**.
    -   **Hardware**: Select **Free (2 vCPU, 16GB RAM)**.
    -   Click **Create Space**.

2.  **Push Code to Space**:
    *Since `aura-ml` is a subfolder, the easiest way is to clone the Space and copy the files.*
    -   In your terminal (on your local machine):
        ```bash
        # 1. Clone your new empty Space (replace YOUR_USERNAME)
        git clone https://huggingface.co/spaces/YOUR_USERNAME/aura-ml-brain
        
        # 2. Copy all files from your local 'aura-ml' folder into this new folder
        # (Make sure to include Dockerfile, requirements.txt, and src folders)
        
        # 3. Add and Push
        cd aura-ml-brain
        git add .
        git commit -m "Initial deploy"
        git push
        ```
    -   *Alternative*: If you know how to use GitHub Actions, you can set up a workflow to sync the folder, but the manual copy is foolproof for the first time.

3.  **Configure Secrets (Environment Variables)**:
    -   Go to your Space's **Settings** tab.
    -   Scroll to **Variables and secrets**.
    -   Add the following **Secret** keys (copy values from your local `.env`):
        -   `SUPABASE_URL`: Your Supabase URL.
        -   `SUPABASE_KEY`: Your Supabase Service Role Key (or Anon key if RLS allows).
        -   `AURA_API_KEY`: Create a secure password (e.g., `my-secret-password-123`).
        -   `OPENAI_API_KEY`: (If you use OpenAI features).

4.  **Wait for Build**:
    -   Click the **App** tab. You will see "Building".
    -   Once it says "Running", your backend is live!
    -   **Copy the Direct URL**: It will look like `https://yourusername-aura-ml-brain.hf.space`. NOTE: You usually need the direct API address. For HF Spaces, simple GET requests work, but for API usage, click the "Embed this space" menu -> "Direct URL".

---

## 2️⃣ Part 2: Deploy Frontend (Vercel)

1.  **Import Project**:
    -   Go to [vercel.com/new](https://vercel.com/new).
    -   Import your GitHub repository (`aura-platform`).

2.  **Configure Project**:
    -   **Framework Preset**: Next.js (Auto-detected).
    -   **Root Directory**: Click "Edit" and select `aura-ai`. **(Important!)**
    
3.  **Environment Variables**:
    -   Expand the **Environment Variables** section.
    -   Add:
        -   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL.
        -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
        -   `NEXT_PUBLIC_API_URL`: The **Hugging Face URL** from Part 1 (e.g., `https://yourusername-aura-ml-brain.hf.space`). 
            -   *Note: Ensure there is no trailing slash `/` at the end if your code appends it automatically.*

4.  **Deploy**:
    -   Click **Deploy**.
    -   Wait ~1 minute. Vercel will build and assign a domain (e.g., `aura-ai.vercel.app`).

---

## 3️⃣ Verification

1.  Open your new Vercel URL.
2.  Inspect the page.
3.  Check if the "AI" features (like recommendations or chat) work.
    -   If they fail, check the **Console** (F12) for CORS errors.
    -   *Fix for CORS*: In your Hugging Face `main.py`, we already have `allow_origins=["*"]`, so it should work.

## 💡 Troubleshooting

-   **Backend sleeping?** Hugging Face Spaces "sleep" after inactivity. The first request might take 30-60 seconds to wake it up. This is normal for the free tier.
-   **Dependencies missing?** Check the "Logs" tab in Hugging Face to see if `pip install` failed.
