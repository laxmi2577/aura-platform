# Aura: The Intelligent Audio Platform 🌌

> **Bridging Emotion, Vision, and Sound with AI.**

**Aura** is a next-generation AI platform designed to create personalized therapeutic and functional soundscapes. By analyzing user emotions through computer vision and understanding natural language requests, Aura dynamically composes audio environments to match your vibe.

---

## 🖼️ Gallery

### � Login Screen
*(Save as `assets/screenshots/login.png`)*
![Login Screen](./assets/screenshots/login.png)

### �🖥️ Dashboard
*(Save as `assets/screenshots/dashboard.png`)*
![Dashboard](./assets/screenshots/dashboard.png)

### 🤖 AI Coach
*(Save as `assets/screenshots/coach.png`)*
![AI Coach](./assets/screenshots/coach.png)

### 🎭 Face DJ
*(Save as `assets/screenshots/facedj.png`)*
![Face DJ](./assets/screenshots/facedj.png)

### 🌊 Brainwaves
*(Save as `assets/screenshots/brainwaves.png`)*
![Brainwaves](./assets/screenshots/brainwaves.png)

### 🌌 Galaxy View
*(Save as `assets/screenshots/galaxy.png`)*
![Galaxy View](./assets/screenshots/galaxy.png)

---

## 📂 System Architecture

The project follows a **Monorepo** structure separating the specialized AI backend from the interactive frontend.

### 1. [🖥️ Frontend: Aura AI (`/aura-ai`)](./aura-ai/README.md)
- **Tech**: Next.js 16, TypeScript, TailwindCSS
- **Responsibility**: User Interface, Webcam Handling, Audio Visualization, State Management.

### 2. [🧠 Backend: Aura ML (`/aura-ml`)](./aura-ml/README.md)
- **Tech**: Python, FastAPI, PyTorch, Supabase Vector Store
- **Responsibility**: Emotion Classification, Audio Analysis, Semantic Search, Recommendation Algorithms.

## 🚀 Quick Start

**1. Clone the Repo**
```bash
git clone https://github.com/your-username/aura-monorepo.git
cd aura-monorepo
```

**2. Setup Backend**
```bash
cd aura-ml
python -m venv venv
# Windows: .\venv\Scripts\activate | Mac: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**3. Setup Frontend**
```bash
# In a new terminal
cd aura-ai
npm install
npm run dev
```

Visit **http://localhost:3000** to start the experience.

## 🛠️ Contribution
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
## 👤 Author

**Laxmiranjan Sahu**

- 🌐 **LinkedIn**: [laxmiranjan](https://www.linkedin.com/in/laxmiranjan/)
- 🐙 **GitHub**: [@laxmi2577](https://github.com/laxmi2577)
- 📧 **Email**: laxmiranjan444@gmail.com

---
*Built with ❤️ by Laxmiranjan Sahu*
