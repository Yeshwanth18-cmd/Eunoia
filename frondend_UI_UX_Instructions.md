
# EUNOIA

## Frontend UI/UX Architecture & Interaction Specification

**(Desktop-first now, Mobile-first compatible later)**

---

## 0. Purpose of This Document

This document defines:

* UI structure
* UX intent
* Interaction constraints
* Design system rules
* Page-by-page behavior
* Mobile-forward safeguards

It exists to ensure:

* Consistency across AI-generated frontend code
* Mental-health-safe UX
* Zero redesign debt when mobile is implemented later

**This document is authoritative.**
Agents must follow it strictly.

---

## 1. Core UX Philosophy (Non-Negotiable)

### 1.1 Product Identity

Eunoia is:

* A **mental health orientation space**
* Not a productivity app
* Not a social media app
* Not a gamified wellness tracker

The UX must feel:

* Calm
* Respectful
* Contemporary
* Non-intrusive
* Emotionally safe

---

### 1.2 Cognitive Load Principle

> Every screen must answer:
> **“What is the one thing the user should do here?”**

Rules:

* One primary action per screen
* Secondary actions visually de-emphasized
* No urgency unless crisis-related

---

### 1.3 Mobile-First Compatibility Rule (Critical)

Even though desktop is built first:

* **No interaction may depend on hover**
* **No layout may assume large horizontal space**
* **No element may require precision clicking**
* **All tap targets ≥ 44px logical size**
* **All flows must be vertical-stackable**

If a desktop UX cannot collapse cleanly into a single vertical column, it is invalid.

---

## 2. Layout Architecture (Width Strategy)

### 2.1 Layout Modes

There are **three allowed layout modes only**.

---

### A. Focus Mode (Default)

Used for:

* Home
* Assessment
* Journal
* Crisis flows
* Check-ins

**Rules:**

* Centered container
* Max width: `max-w-3xl` to `max-w-4xl`
* Large vertical spacing
* Symmetrical margins

**Reason:**

* Emotional safety
* Reduced eye travel
* Natural mobile collapse

---

### B. Exploration Mode (Selective)

Used for:

* Community
* Resources
* Booking (step 1 only)

**Rules:**

* Main content centered
* Optional sidebars
* Sidebars must collapse below content on mobile
* Sidebars must never contain primary actions

---

### C. Utility Mode

Used for:

* Admin
* Moderator dashboards

**Rules:**

* Full-width
* Dense layouts allowed
* Desktop-first acceptable

---

### ❌ Prohibited

* Full-width layouts for mental health flows
* Fixed side navigation for end users
* Permanent dual-column mandatory layouts

---

## 3. Design System: Depth & Surface Model

### 3.1 Primary Surface System: Soft Surface Layering

This is the **default** visual system.

**Characteristics:**

* No transparency
* Subtle borders
* Minimal shadows
* High contrast text

**Purpose:**

* Stability
* Readability
* Long-session comfort

---

### 3.2 Secondary Accent: Claymorphism (Limited)

Claymorphism is allowed **only for interaction affordance**.

**Allowed Use Cases:**

* Primary CTA buttons
* Slider thumbs
* Floating Action Button (GuideWidget)
* Mobile action bars (future)

**Rules:**

* Never used for containers
* Never used for lists
* Never used for text-heavy areas
* Shadow intensity must be subtle

**Reason:**

* Adds tactility for young users
* Improves mobile touch clarity
* Avoids toy-like UI

---

### 3.3 Frosted Focus (Rare, Controlled)

Frosted Focus is a **UX state**, not a style.

**Purpose:**

* Narrow attention
* Pause context
* Emotional isolation

**Allowed Use Cases Only:**

* Assessment modals
* Unified Check-in focus
* Journal editor focus
* Crisis interruption state

**Rules:**

* Minimal blur (`backdrop-blur-sm`)
* Very low opacity
* No glow
* No animation
* Never persistent

---

### 3.4 Crisis UI Exception

Crisis UI must be:

* Flat
* High contrast
* Static
* Clear

No glass.
No clay.
No animation.

---

## 4. Theme System (Light & Dark)

### 4.1 Theme Parity Rule

Light mode ≠ inverted dark mode.

Both themes must:

* Preserve hierarchy
* Preserve contrast
* Preserve emotional tone

---

### 4.2 Shared Tokens (Mandatory)

Agents must use abstract tokens, not hardcoded colors:

```
surface.page
surface.section
surface.card
surface.focus
surface.interactive
surface.crisis

text.primary
text.secondary
text.muted

border.subtle
border.focus
```

Themes define values; components consume tokens.

---

### 4.3 Accessibility Constraints

* Minimum contrast WCAG AA
* No text over blur-heavy backgrounds
* Motion must respect reduced-motion preferences

---

## 5. Motion & Interaction Rules

### 5.1 Motion Philosophy

Motion is **feedback**, not decoration.

**Allowed:**

* Fade-in
* Gentle slide
* Soft scale on press

**Prohibited:**

* Bounce
* Elastic motion
* Attention-grabbing loops

---

### 5.2 Crisis Motion Rule

Crisis UI must be **static**.

No transitions.
No pulsing.
No shimmer.

---

## 6. Page-by-Page UX Instructions

---

### 6.1 Home Page

**Intent:** Soft entry, reduce anxiety.

**Rules:**

* Single primary CTA
* Secondary CTA visually lighter
* Copy emphasizes privacy & safety
* Ambient background only (non-interactive)

**Mobile Safeguard:**

* Hero content stacks vertically
* CTAs full-width on mobile

---

### 6.2 Assessment Hub

**Intent:** Orientation, not testing.

#### Unified Check-in

* Full-width card within centered layout
* Must be visually isolated
* Other UI de-emphasized during interaction

#### Tool Selection

* Decision-aided labels (“Used for…”, “Recommended when…”)
* No grid smaller than 2 columns on desktop
* Always single column on mobile

#### Modal Assessments

* No aggressive close button
* Exit = “Pause & exit”
* Progress via dots, not percentages

---

### 6.3 Journal Page

**Intent:** Cognitive offload.

#### Editor

* Primary visual focus
* Prompt fades after typing starts
* No visible word count

#### History

* Secondary visual priority
* Scrollable
* No emotional labeling before writing

**Mobile Safeguard:**

* History collapses behind toggle
* Editor always first

---

### 6.4 Booking Flow

**Intent:** Reduce friction & intimidation.

#### Counselor Cards

* Emphasize availability & tone
* De-emphasize credentials
* No competitive visuals

#### Slot Selection

* Unavailable slots disabled (not teasing)
* Selected state calm, not celebratory

---

### 6.5 Community

**Intent:** Shared space without performance pressure.

**Rules:**

* No infinite scroll
* No public reaction counts
* One reaction per user per post
* Ephemeral indicators visible but subtle

**Mobile Safeguard:**

* Feed single column only
* Sidebar content collapses below feed

---

### 6.6 Resources

**Intent:** Emotional search, not browsing.

**Rules:**

* Contextual labels (“Read when…”)
* Cards must be tappable as a whole
* External links clearly marked

---

### 6.7 Profile & Settings

**Intent:** Ownership without attachment.

**Rules:**

* No streaks
* No scores
* Trends expressed verbally, not graphically
* Data export framed as user ownership

---

### 6.8 Admin & Moderator

**Intent:** Responsibility, not power.

**Rules:**

* Neutral tones
* Logs over flashy charts
* Actions clearly reversible where possible

---

## 7. Empty Space Usage

Empty space is **intentional**.

Allowed uses:

* Emotional breathing room
* Ambient context
* Reduced stimulation

Not allowed:

* Decorative widgets
* Always-on side content
* Engagement bait

---

## 8. Mobile-First Safeguards (Critical Section)

Agents must ensure:

* All layouts collapse into single column
* No dependency on hover
* All actions reachable via thumb zone
* No fixed heights blocking scroll
* No horizontal scrolling

**If a desktop component cannot be reused on mobile with only CSS changes, it is invalid.**

---

## 9. Implementation Guidance for AI Agents

### Agents Must:

* Follow layout modes strictly
* Use tokens, not raw values
* Respect interaction constraints
* Avoid introducing new visual metaphors

### Agents Must NOT:

* Invent animations
* Add gamification
* Optimize for “engagement metrics”
* Add unnecessary visual noise

---

## 10. Final Design Direction Summary

* Base system: **Soft Surface Layering**
* Interaction affordance: **Claymorphism (limited)**
* Focus isolation: **Frosted Focus (rare)**
* Layout: **Centered by default, adaptive**
* UX priority: **Mental safety > novelty**
* Mobile readiness: **Designed-in, not retrofitted**

