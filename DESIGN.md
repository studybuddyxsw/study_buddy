# StudyBuddy Design System (DESIGN.md)

## Visual World: "Serene Focus & Vibrant Momentum"
การออกแบบสไตล์ Modern Bento Grid ผสมผสานความสงบที่ช่วยให้มีสมาธิ (Focus-inducing calm) และความมีชีวิตชีวาที่กระตุ้นพลัง (Energizing momentum) เพื่อลดความตระหนกก่อนสอบ และสร้างความรู้สึกมั่นใจในการควบคุมเวลา

## Typography
```css
:root {
  --font-sans: "IBM Plex Sans Thai", "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
```
- Primary Font: "IBM Plex Sans Thai" (น้ำหนัก 300, 400, 500, 600, 700) ร่วมกับ "DM Sans"
- Data / Timers / Counts: Tabular numbers ด้วย `--font-mono` สำหรับนาฬิกา Pomodoro, ตัวเลขนับถอยหลัง D-Day, สถิติชั่วโมง

## Color Tokens & Palette
- **Deep Indigo / Midnight Navy (ความมุ่งมั่น & โครงสร้าง):**
  - `--color-primary-900: #1e1e38;`
  - `--color-primary-800: #2d2b55;`
  - `--color-primary-700: #4338ca;`
  - `--color-primary-600: #4f46e5;`
  - `--color-primary-100: #e0e7ff;`
  - `--color-primary-50: #eef2ff;`
- **Soft Lavender / Violet (ความผ่อนคลาย & ความคิดสร้างสรรค์):**
  - `--color-accent-violet: #8b5cf6;`
  - `--color-accent-lavender: #ede9fe;`
  - `--color-accent-violet-dark: #6d28d9;`
- **Focus Mint / Sage Green (สมาธิ & ความสำเร็จ):**
  - `--color-mint-500: #10b981;`
  - `--color-mint-600: #059669;`
  - `--color-mint-100: #d1fae5;`
  - `--color-mint-50: #ecfdf5;`
- **Warm Amber / Fire Streak (พลังใจ & ไฟแห่งการอ่าน):**
  - `--color-amber-500: #f59e0b;`
  - `--color-amber-600: #d97706;`
  - `--color-amber-100: #fef3c7;`
  - `--color-fire-orange: #f97316;`
- **Neutral & Surfaces:**
  - `--bg-canvas: #f8fafc;`
  - `--bg-surface: #ffffff;`
  - `--bg-surface-subtle: #f1f5f9;`
  - `--text-primary: #0f172a;`
  - `--text-secondary: #475569;`
  - `--text-tertiary: #94a3b8;`
  - `--border-subtle: #e2e8f0;`
  - `--border-strong: #cbd5e1;`

## Elevation & Radii
- `--radius-sm: 8px;`
- `--radius-md: 12px;`
- `--radius-lg: 18px;`
- `--radius-xl: 24px;`
- `--radius-full: 9999px;`
- `--shadow-card: 0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03);`
- `--shadow-hover: 0 12px 28px -4px rgba(15, 23, 42, 0.09), 0 4px 10px -2px rgba(15, 23, 42, 0.04);`
- `--shadow-modal: 0 25px 50px -12px rgba(15, 23, 42, 0.2);`

## Component Guidelines
1. **Cards (Bento Grid):**
   - Padding 20px - 24px
   - Subtle border `1px solid var(--border-subtle)`
   - Hover transition: `transform: translateY(-2px); box-shadow: var(--shadow-hover);`
2. **Interactive Elements:**
   - Buttons: Solid filled or soft-tinted, explicit hover and active micro-scale (0.98)
   - Progress Bars: Smooth transition, rounded ends, color-coded by readiness
   - Stars / Confidence: Accessible rating buttons with immediate visual feedback
   - Flip Flashcards: 3D perspective flip with front (question/prompt) and back (answer/key formula)
3. **Sound System:**
   - Web Audio API synthesizer for White Noise, Pink Noise, Brown Noise, and peaceful meditation bowl chimes.
