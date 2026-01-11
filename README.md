# Aura: The Intelligent Audio Platform 🌌

[![GitHub Stars](https://img.shields.io/github/stars/laxmi2577/aura-platform?style=social)](https://github.com/laxmi2577/aura-platform)
[![GitHub Forks](https://img.shields.io/github/forks/laxmi2577/aura-platform?style=social)](https://github.com/laxmi2577/aura-platform/fork)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://aura-ai-liard-eight.vercel.app)
[![Hugging Face](https://img.shields.io/badge/🤗%20Backend-Hugging%20Face-yellow)](https://laxmiranjan444-aura-ml-brain.hf.space)

> **Bridging Emotion, Vision, and Sound with AI.**

**Aura** is a next-generation AI platform designed to create personalized therapeutic and functional soundscapes. By analyzing user emotions through computer vision and understanding natural language requests, Aura dynamically composes audio environments to match your vibe.

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [📊 Performance Highlights](#-performance-highlights)
- [🔧 Built With](#-built-with)
- [📂 System Architecture](#-system-architecture)
- [🚀 Quick Start](#-quick-start)
- [🌐 Live Demo](#-live-demo)
- [🛠️ Contribution](#️-contribution)
- [📄 License](#-license)
- [👤 Author](#-author)
- [🖼️ Gallery](#️-gallery)

---

## ✨ Features

- 🎭 **Face DJ** - Webcam-based emotion detection that generates matching soundscapes
- 🧠 **Binaural Brainwaves** - Real-time binaural beat generation for meditation & focus
- 🎛️ **Sound Mixer** - Layer up to 4 tracks with independent volume control
- 🤖 **AI Coach** - Natural language powered assistant with scientific knowledge
- 🔍 **Semantic Search** - Find sounds using natural language queries
- 🎙️ **Voice Control** - Hands-free navigation with voice commands
- 🌌 **Galaxy Visualizer** - 3D WebGL audio visualization
- ⏱️ **Smart Timer** - Auto fade-out for sleep routines

---

## 📊 Performance Highlights

| Metric | Score | Description |
| :--- | :--- | :--- |
| **Inference Latency** | **~430ms** | Cold-start reduced by 82% via FastAPI Lifespan optimization |
| **Audio Classification** | **0.459 mAP** | Mean Average Precision on AudioSet (MIT AST Model) |
| **Face Emotion Recog.** | **0.85 F1** | Weighted F1-Score on FER-2013 dataset |
| **Vector Search** | **0.92 Recall** | High retrieval accuracy using `all-MiniLM-L6-v2` |
| **Cost Efficiency** | **400x ROI** | Token cost reduction vs. GPT-4o by using Gemini Flash |

---

## 🔧 Built With

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

### Backend
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)

### Infrastructure
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Hugging Face](https://img.shields.io/badge/Hugging%20Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)

---

## 📂 System Architecture

The project follows a **Monorepo** structure separating the specialized AI backend from the interactive frontend.

```
aura-platform/
├── aura-ai/          # 🖥️ Next.js Frontend
├── aura-ml/          # 🧠 Python ML Backend
├── assets/           # 📸 Screenshots & Media
└── README.md         # 📖 You are here
```

### 1. [🖥️ Frontend: Aura AI (`/aura-ai`)](./aura-ai/README.md)
- **Tech**: Next.js 16, TypeScript, TailwindCSS
- **Responsibility**: User Interface, Webcam Handling, Audio Visualization, State Management

### 2. [🧠 Backend: Aura ML (`/aura-ml`)](./aura-ml/README.md)
- **Tech**: Python, FastAPI, PyTorch, Supabase Vector Store
- **Responsibility**: Emotion Classification, Audio Analysis, Semantic Search, Recommendation Algorithms

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm
- Python 3.9+
- Supabase Account

### 1. Clone the Repo
```bash
git clone https://github.com/laxmi2577/aura-platform.git
cd aura-platform
```

### 2. Setup Backend
```bash
cd aura-ml
python -m venv venv

# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Setup Frontend
```bash
# In a new terminal
cd aura-ai
npm install
npm run dev
```

### 4. Open the App
Visit **http://localhost:3000** to start the experience! 🎉

---

## 🌐 Live Demo

| Component | URL | Status |
|-----------|-----|--------|
| **Frontend** | [aura-ai-liard-eight.vercel.app](https://aura-ai-liard-eight.vercel.app) | ✅ Live |
| **Backend API** | [laxmiranjan444-aura-ml-brain.hf.space](https://laxmiranjan444-aura-ml-brain.hf.space) | ✅ Live |

---

## 🛠️ Contribution

Contributions are welcome! Please follow these steps:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 👤 Author

<p align="center">
  <img src="https://github.com/laxmi2577.png" width="100" height="100" style="border-radius: 50%;" alt="Laxmiranjan Sahu"/>
</p>

<h3 align="center">Laxmiranjan Sahu</h3>

<p align="center">
  <a href="https://www.linkedin.com/in/laxmiranjan/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
  <a href="https://github.com/laxmi2577"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>
  <a href="mailto:laxmiranjan444@gmail.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/></a>
</p>

---

## 🖼️ Gallery

<details>
<summary>📸 Click to expand screenshots</summary>

### 🔐 Login Screen
![Login Screen](./assets/screenshots/login.png)

### 🖥️ Dashboard
![Dashboard](./assets/screenshots/dashboard.png)

### 🤖 AI Coach
![AI Coach](./assets/screenshots/coach.png)

### 🎭 Face DJ
![Face DJ](./assets/screenshots/facedj.png)

### 🌊 Brainwaves
![Brainwaves](./assets/screenshots/brainwaves.png)

### 🌌 Galaxy View
![Galaxy View](./assets/screenshots/galaxy.png)

</details>

---

<p align="center">
  <b>⭐ If you found this helpful, please star the repo! ⭐</b>
</p>

<p align="center">
  <i>Built with ❤️ by Laxmiranjan Sahu</i>
</p>
