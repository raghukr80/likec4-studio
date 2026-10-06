# LikeC4 Studio

LikeC4 Studio — an interactive architecture design studio for modeling cloud, container, and system architectures. Drag architecture elements onto the canvas, connect them with relationships, manage named views, and explore your design visually.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Visual canvas** — interactive architecture diagram with drag-and-drop elements (nodes) and connections (connectors) powered by React Flow
- **Live model state** — footer shows real-time counts of nodes, connectors, and active views
- **Architecture elements** — containers, pods, services, load balancers, volumes, and more
- **Named architecture views** — switch between different architecture perspectives
- **Light / Dark mode** — light mode by default with smooth theme transition
- **Inline editing** — edit labels and properties directly on nodes
- **Export / Import** — diagrams can be exported and imported as structured data
- **Custom `.ico` favicon** (`public/likC4sd.ico`)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite |
| Canvas / Diagrams | React Flow v12 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| State | React `useState` + Zustand-style patterns |
| Language | JavaScript (JSX) |

## Project Structure

```
likec4-studio/
├── public/
│   ├── favicon.svg         # SVG favicon (legacy)
│   ├── icons.svg           # Icon sprite
│   └── likC4sd.ico         # Custom .ico icon
├── src/
│   ├── App.jsx             # Main app component (canvas + toolbar + footer)
│   ├── App.css             # Component-level styles
│   ├── index.css           # Tailwind v4 import + base styles
│   ├── main.jsx            # Entry point
│   └── assets/             # Static assets (hero.png, logos)
├── index.html              # App shell (icon link, meta tags)
├── package.json            # Dependencies + scripts
├── vite.config.js          # Vite + Tailwind v4 plugin config
└── README.md               # This file
```

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- Modern browser (Chrome 90+, Firefox 90+, Safari 15+)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/raghukr80/likec4-studio.git
cd likec4-studio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown by Vite).

### 4. Build for production

```bash
npm run build
```

Output will be in `dist/`.

### 5. Preview production build

```bash
npm run preview
```

### 6. Run lint

```bash
npm run lint
```

> Note: There are pre-existing lint errors in `App.jsx` (unused imports, `Date.now()` impurity, unused variables) — these are not related to recent changes and do not block the build.

## Usage

### Designing an Architecture

1. **Add elements** — Click an archetype from the left toolbar / control panel to add nodes to the canvas
2. **Connect elements** — Drag from one node's handle to another to create relationships (connectors)
3. **Switch views** — Use the view selector to change between architecture perspectives
4. **Edit inline** — Click nodes to edit labels and properties
5. **Manage zones** — Create layout zones to group and organize architecture components

### Footer Status Bar

The bottom footer displays live model statistics:
- **nodes** — active architecture elements
- **connectors** — active relationships between elements
- **views** — active named architecture views



## Environment Variables

No `.env` file is required for basic operation. The app runs with default settings out of the box.

## Credits

Idea & Design by [raghukr80](https://github.com/raghukr80)

- [LikeC4 Studio repository](https://github.com/raghukr80/likec4-studio)
- Built with [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [React Flow](https://reactflow.dev/)

## License

MIT License — see repository for details.
