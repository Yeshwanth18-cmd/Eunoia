# 🌿 Eunoia — A Campus-First Digital Mental Health Companion

**Live Deployment:** [https://eunoia-prototype.vercel.app/](https://eunoia-prototype.vercel.app/)

Eunoia is a modern mental-health support platform designed specifically for college students. It brings together validated self-assessments, mood tracking, counseling bookings, reflective journaling, and a safe peer support community — all wrapped in a premium "Executive Jewel Tone" aesthetic that adapts to both Light and Dark modes.

The goal is simple:

### **Make emotional well-being accessible, private, and stigma-free.**

This project was developed using an **AI-assisted engineering workflow**, where architectural decisions, refactoring steps, and UI design were guided through structured prompting and iteration.

---

# 🚀 Features

## 🧠 1. Validated Mental Health Assessments

*   **PHQ-9** for depression
*   **GAD-7** for anxiety
*   **UCLA Loneliness Scale**
*   **Perceived Stress Scale (PSS)**
*   **Penn State Worry Questionnaire (PSWQ)**
*   Color-coded severity & instant feedback
*   Clean, accessible card-based interface

## 😊 2. Mood & Vibe Tracking

*   Daily emotion check-ins with emoji selectors
*   "Vibe Check" visualization on the dashboard
*   Optional journal notes attached to mood logs
*   Recent history panel for self-reflection

## 📖 3. Reflective Journaling

*   Private space for thoughts and feelings
*   "Executive" card-style layout for easy reading
*   Date-stamped entries

## 🤝 4. Community & Peer Support

*   **Anonymous Forum**: Safe space to share reflections and struggles.
*   **Soft Reactions**: "Warmth", "Insight", "Solidarity" (no toxic "likes").
*   **Resources Hub**: Curated guides on academic pressure, social anxiety, and more, formatted for easy reading.
*   **Moderation**: "Are you a Moderator?" access for community safety.

## 📅 5. Counseling Session Booking

*   Students can book sessions with name, email, reason & timeslot.
*   "Anonymous" booking option supported.
*   Admin can Confirm / Cancel / Delete requests.

## 📊 6. Executive Admin Dashboard

*   **System Overview**: Real-time metrics on user count, assessments, and "Campus Vibe".
*   **Data Management**: Full CRUD controls for Users, Bookings, Moods, and Assessments.
*   **Moderation Queue**: Review and manage flagged community posts.
*   **Premium UI**: High-contrast "Toner" aesthetic with glassmorphism.

---

# 🎨 UI & UX

**Theme: Executive Jewel Tone**
*   **Dual Mode**: Fully responsive Light and Dark modes.
*   **Palette**: Deep Sapphire, Emerald, and Ambers against rich backgrounds (`bg-black` / `bg-white`).
*   **Visuals**: Vignette overlays, glassmorphic cards, and crisp, high-contrast typography (`Outfit` font).
*   **Interaction**: Subtle hover glows, smooth transitions, and tactile button states.

---

# 🛠️ Tech Stack

### Frontend

*   **Next.js 14** (App Router)
*   **React**
*   **TypeScript**
*   **Tailwind CSS** (with `@tailwindcss/typography`)
*   **Framer Motion** (for smooth animations)

### Backend

*   **Next.js API Routes**
*   **Prisma ORM**
*   **PostgreSQL** (Neon Database)

### Deployment

*   **Vercel**

---

# 🏛️ Architecture Overview

```mermaid
graph TD
    User[Student User] --> Client[Next.js Frontend]
    Admin[Administrator] --> Client
    
    Client --> API{Next.js API Routes}
    
    API --> Auth[Auth Logic]
    API --> Prisma[Prisma ORM]
    
    Prisma --> DB[(PostgreSQL Database)]
```

---

# 📂 Project Structure

```
app/
  assessment/    # Screening tools (PHQ-9, GAD-7, etc.)
  booking/       # Counseling requests
  mood/          # Vibe check & logging
  journal/       # Private reflections
  community/     # Peer support forum
  resources/     # Educational blog/guides
  admin/         # Dashboard & Moderation
  profile/       # User settings & history
  
components/
  guide/         # "GuideWidget" (Chat assistant)
  community/     # Forum modals & cards
  NavBar.tsx     # Responsive navigation
  
lib/
  prisma.ts      # DB connection
  resources.ts   # Markdown content loader
```

---

# ⚙️ Local Setup

### 1. Clone the Repo

```bash
git clone https://github.com/Sat-C05/eunoia-prototype.git
cd eunoia
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create `.env`

```env
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"
```

### 4. Run Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Start Dev Server

```bash
npm run dev
```

Runs at **[http://localhost:3000](http://localhost:3000)**.

---

# ☁️ Deployment (Vercel)

1.  Push your code to a GitHub repository.
2.  Import the project into Vercel.
3.  Add the Environment Variable:
    *   `DATABASE_URL="postgresql://..."`
4.  Deploy! (Vercel typically handles the build command automatically).

---

# 📜 License

MIT License.
