# Aura AI: Frontend Experience 🎨

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://aura-ai-liard-eight.vercel.app)

> **The Interactive Interface for the Aura Intelligent Audio Platform.**

Aura AI is a modern, responsive web application built with **Next.js 16** and **React**. It provides a seamless interface for users to interact with the Aura ML Brain, exploring sounds, visualizing audio, and experiencing the multimodal "Face DJ" feature.

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📂 Project Structure](#-project-structure)
- [⚙️ Configuration](#️-configuration)
- [📸 Screenshots](#-screenshots)
- [🛠️ Contributing](#️-contributing)
- [📄 License](#-license)
- [👤 Author](#-author)

---

## ✨ Key Features

### 🌊 Immersive Sound Library
Browse and play a vast collection of high-fidelity environmental sounds, from "Cozy Rain" to "Deep Space".

### 😊 Face DJ
(Experimental) A webcam-based interface that scans your facial expressions and generates a matching soundscape in real-time using the Aura ML emotion recognition pipeline.

### 🧠 Binaural Brainwaves
Generate real-time binaural beats (Sine waves) to entrain your brain into specific states:
- **Delta (0.5-4Hz)**: Deep Sleep
- **Theta (4-8Hz)**: Meditation & Creativity
- **Alpha (8-13Hz)**: Relaxation
- **Beta (13-30Hz)**: Active Focus

### 🎛️ Sound Mixer
Create your perfect atmosphere by layering up to 4 different sounds.
- **Volume Control**: Adjust levels for each track independently.
- **Surprise Me**: Let AI generate a random harmonious mix for you.
- **Save Mix**: (Coming Soon) Save your favorite combinations.

### 🧘 Zen Mode & Breathwork
- **Zen Mode**: Toggle a distraction-free UI to focus solely on the audio.
- **Breathwork**: Access guided breathing exercises (e.g., 4-7-8 technique) directly within the app to reduce anxiety.

### 🎙️ Voice Control
Navigate the app hands-free. Use commands like *"Play Rain"*, *"Stop"*, or *"Start Meditation"* to control your experience without touching the screen.

### ⏱️ Smart Timer
Set a sleep or focus timer to automatically fade out audio after a set duration, perfect for bedtime routines.

### 🔍 Semantic Search
Find sounds using natural language (e.g., "sounds for studying" or "cozy rain") via our Vector Search engine.

### 🔒 Admin Sound Upload
Upload new sounds to the platform directly from the UI.
> **Note**: This feature is restricted to the Admin Email configured in the code.

### 📊 Audio Visualization
Real-time waveform rendering of playing tracks using the Web Audio API and Canvas.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| ![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=fff) | Framework (App Router) |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff) | Type Safety |
| ![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwind-css&logoColor=fff) | Styling |
| ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000) | UI Library |
| ![Zustand](https://img.shields.io/badge/Zustand-000?logo=react&logoColor=fff) | State Management |
| ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=fff) | Database & Auth |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- The **Aura ML Backend** running on port `8000` (see `../aura-ml/README.md`)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Configure Environment:**
   Create a `.env.local` file with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_AURA_API_KEY=your-api-key
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```

4. **Open the App:**
   Visit `http://localhost:3000` in your browser.

---

## 📂 Project Structure

```bash
aura-ai/
├── src/
│   ├── app/                    # Next.js App Router (Routing & Layouts)
│   │   ├── (auth)/             # Authentication Routes (Login/Register)
│   │   ├── (main)/             # Main Application Routes (Protected)
│   │   └── api/                # Next.js API Routes (Server-side Proxy)
│   ├── components/
│   │   ├── features/           # Feature-Specific Components (15+ Modules)
│   │   │   ├── ai-coach/       # Intelligent Assistant
│   │   │   ├── binaural-beats/ # Brainwave Entrainment
│   │   │   ├── face-dj/        # Emotion-based Music generation
│   │   │   ├── galaxy/         # 3D Visualizer
│   │   │   ├── sound-library/  # Discovery Grid
│   │   │   ├── sound-mixer/    # Multi-track Mixer
│   │   │   └── ...
│   │   └── ui/                 # Reusable Radix/Shadcn Components
│   ├── lib/                    # Core Business Logic & Utilities
│   └── store/                  # Global State (Zustand)
├── public/                     # Static Assets
└── ...
```

---

## ⚙️ Configuration

To enable **Admin Features** (like uploading sounds), add your email to the allowlist:

1. Open `src/components/features/sound-library/SoundLibrary.tsx`
2. Find and update the `ADMIN_EMAIL` constant:
   ```typescript
   const ADMIN_EMAIL = "your-email@gmail.com"
   ```

---

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

### 1. Login Screen
![Login Screen](../assets/screenshots/login.png)

### 2. Dashboard
![Dashboard](../assets/screenshots/dashboard.png)

### 3. AI Coach Interface
![AI Coach](../assets/screenshots/coach.png)

### 4. Face DJ Experience
![Face DJ](../assets/screenshots/facedj.png)

### 5. Brainwaves Mode
![Brainwaves](../assets/screenshots/brainwaves.png)

### 6. Galaxy Visualizer
![Galaxy](../assets/screenshots/galaxy.png)

</details>

---

## 🛠️ Contributing

Contributions are welcome! Please see the [CONTRIBUTING.md](../CONTRIBUTING.md) file for guidelines.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](../LICENSE) file for details.

---

## 👤 Author

**Laxmiranjan Sahu**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/laxmiranjan/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/laxmi2577)
[![Email](https://img.shields.io/badge/Email-D14836?style=flat&logo=gmail&logoColor=white)](mailto:laxmiranjan444@gmail.com)

---

<p align="center">
  <i>Part of the <a href="../README.md">Aura Platform</a></i>
</p>
