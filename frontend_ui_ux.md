# Frontend UI/UX Structure & Style Guide

This document outlines the current structural and stylistic implementation of the Eunoia platform. It is intended to serve as a reference for future UI/UX phases.

## Global Design System
- **Theme**: Dark Mode First (Toggle available).
- **Styling**: TailwindCSS.
- **Ambience**: Heavy use of `bg-black` or `bg-neutral-950` with `bg-white/5` glassmorphism, glowing gradients (`shadow-[...]`, `blur-[...]`), and micro-interactions.
- **Typography**: Sans-serif (`Inter` implied via Tailwind default), rounded-lg/xl containers.
- **Scrollbars**: Custom thin scrollbars defined in `globals.css` (`custom-scrollbar`).

---

## Page-by-Page Breakdown

### 1. Home Page (`/`)
- **Structure**:
  - **Hero Section**: Large Ambient Glow background, centralized value proposition ("Find Your Balance"), dual CTAs ("Start Self-Assessment", "Explore Resources").
  - **Feature Grid**: 3-column layout highlighting "Validated Tools", "Privacy First", "Easy Support".
  - **Footer**: Simple emergency disclaimer.
- **Key Features**:
  - CSS keyframe animations on background blobs.
  - Hover effects on cards (lift + border glow).

### 2. Assessment Hub (`/assessment`)
- **Structure**:
  - **Header**: "Self-Orientation" Title.
  - **Grid Layout**:
    - **Left (Col-4)**: **Unified Check-in** (Slider for Mood/Energy). Persists status.
    - **Right (Col-8)**: 
      - **Standard Tools Card**: Grid of buttons for specific scales (PHQ9, GAD7, PSS, UCLA, PSWQ).
      - **Guided Journal Card**: Large CTA to jump to `/journal`.
- **Features**:
  - **Modal**: Assessment questions open in a `fixed inset-0` modal overlay.
  - **Real-time feedback**: Notifications on completion.
  - **Privacy**: No login required; uses local Anonymous ID.

### 3. Journal Page (`/journal`)
- **Structure**:
  - **Split Layout (lg:flex-row)**:
    - **Left (Editor)**: Large `textarea` with prompt header ("Who are you today?"). Shuffle Prompt button.
    - **Right (History)**: Sidebar listing previous entries (`entries.map`).
- **Styles**:
  - **Editor**: Minimalist, distraction-free. `bg-white/5` container.
  - **History**: Scrollable list (`max-h-[calc(100vh-200px)]`). Cards show date, title, preview.
  - **Delete Action**: Hover-reveal trash icon.

### 4. Consultation Booking (`/booking`)
- **Structure**:
  - **Step 1 (Counselor Selection)**:
    - **Header**: "Need someone ASAP" button.
    - **Filters**: Tags (Anxiety, Academic, etc.).
    - **List**: Card view of counselors. Avatar + Bio + "Next Available" badge.
  - **Step 2 (Slot Selection)**:
    - **Calendar**: Horizontal date selector.
    - **Time Grid**: AM/PM slots.
- **Features**:
  - **Logic**: Prevents double booking via `bookedSlots` verification.
  - **Visuals**: Dynamic "Full" status, Pulse animation on "Next Available".

### 5. Community & Support (`/community`)
- **Structure**:
  - **Feed (Left/Main)**:
    - **Filters**: Chip-based categories (Academic Stress, Loneliness, etc.).
    - **Posts**: Card layout. Shows Content, Time Left (Ephemeral), Reaction buttons.
    - **Interactions**: Soft reactions (Hug, Bulb, Blue Heart), Save (Bookmarking), Report.
  - **Sidebar (Right)**:
    - **Crisis Card**: Red gradient, sticky, immediate 988 call action.
    - **Resources Widget**: Mini-list of curated resources ("Reading List").
- **Key UX**:
  - **Anonymity**: All posts are anonymous.
  - **Ephemerality**: Posts show "2d left" expiry logic.

### 6. Wellness Library (`/resources`)
- **Structure**:
  - **Grid**: Responsive 3-column grid of Resource Cards.
  - **Card**: Image header (gradient overlay) + Title + Description + Category Chip.
- **Features**:
  - **External/Internal Links**: Auto-detects `http` for `_blank` target.
  - **Visuals**: Hover zoom effect on images.

### 7. Profile & Settings (`/profile`)
- **Structure**:
  - **Header**: User Greeting (or "Guest"), Avatar, ID display.
  - **Tabs**: `overview`, `journey`, `community`, `settings`.
- **Tab Content**:
  - **Overview**: Stats Cards ( Assessments, Check-ins, Bookings) + Recent Activity Feed.
  - **Journey**:
    - **Assessment History**: Scrollable list of past scores.
    - **Consultations**: Scrollable list of bookings/status.
  - **Community**:
    - **My Reflections**: Deleteable list of user's own posts.
    - **Saved Gems**: Saved Resources & Saved Posts.
  - **Settings**:
    - **Appearance**: Dark/Light mode toggle.
    - **Data**: "Download My Data" (JSON export).

### 8. Admin & Moderator
- **Admin Dashboard (`/admin`)**:
  - **Sidebar**: Navigation (Overview, Assessments, Bookings, Users).
  - **Overview**: Vibe Meter (Mood viz), Energy Gauge.
  - **Tables**: Data management for all entities.
- **Moderator Dashboard (`/moderator`)**:
  - **Review Queue**: Flagged posts for "Delete" or "Restore".
  - **Content Manager**: Searchable feed of all posts.

### 9. Components
- **Eunoia Guide (`GuideWidget`)**:
  - Fixed bottom-right FAB (Floating Action Button).
  - Chat interface with rule-based navigation options.
  - "Crisis Card" injection logic.
- **Experiential Mirror / Capacity Snapshot**:
  - *Note*: These features have been consolidated into the "Unified Check-in" on the Assessment page.

---

## Technical Styles (Tailwind)
- **Glassmorphism**: `bg-white/5 border border-white/5 backdrop-blur-md`
- **Gradients**: `bg-gradient-to-br from-indigo-500/20 to-purple-900/20`
- **Animations**: `animate-in fade-in slide-in-from-bottom-4`
- **Text**: `text-neutral-400` (secondary), `text-white` (primary), `font-light` (headers).
