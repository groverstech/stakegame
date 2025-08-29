# Overview

This is a 3x5 slot machine game built with a React frontend and Express backend, designed to be compatible with Stake Engine. The application features a modern web-based slot game with real-time graphics rendering using PIXI.js, comprehensive game mathematics implemented in Python, and a full-stack architecture supporting both development and production environments.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the main UI framework
- **PIXI.js** for high-performance 2D graphics rendering of the slot machine
- **Vite** as the build tool and development server
- **Tailwind CSS** with **shadcn/ui** components for styling
- **Zustand** for state management across game phases, audio, and slot mechanics
- **TanStack Query** for API state management and caching

## Backend Architecture
- **Express.js** server with TypeScript
- **Python math engine** for game calculations and RTP compliance
- **Drizzle ORM** with PostgreSQL for data persistence
- **Memory storage** fallback for development environments
- **Modular route handling** with separation of concerns

## Game Mathematics Engine
- **Python-based slot engine** (`math_engine/`) implementing Stake Engine compliance
- **Configurable game mechanics** with 20 paylines, symbol weights, and RTP calculations
- **Pre-calculated outcome generation** for regulatory compliance
- **RTP optimization tools** for game balancing
- **Comprehensive simulation framework** for statistical analysis

## State Management
- **Game state** managed through Zustand stores for slot mechanics, audio controls, and game phases
- **Audio system** with background music, sound effects, and mute controls
- **Reactive game phases** (ready, spinning, showing results) with automatic transitions

## Graphics and Animation
- **PIXI.js rendering** for smooth slot reel animations and symbol displays
- **Real-time symbol rendering** with color-coded symbols and win line highlighting
- **Responsive canvas** that adapts to different screen sizes
- **Performance-optimized** graphics with proper cleanup and memory management

## Development Tools
- **Hot reload** in development with Vite
- **TypeScript** for type safety across the entire codebase
- **ESLint and Prettier** for code quality (implied by modern React setup)
- **Path aliases** configured for clean imports (@/ for client, @shared for shared code)

# External Dependencies

## Core Frameworks
- **React ecosystem**: React 18, React DOM, TypeScript, Vite
- **Radix UI**: Complete component library (@radix-ui/react-*)
- **PIXI.js**: 2D graphics rendering engine
- **Express.js**: Node.js web framework

## Database and ORM
- **Drizzle ORM**: Type-safe database operations
- **PostgreSQL**: Primary database (via @neondatabase/serverless)
- **Neon Database**: Serverless PostgreSQL hosting

## State Management and API
- **Zustand**: Lightweight state management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling (imported in UI components)

## Styling and UI
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library
- **class-variance-authority**: Component variant management
- **Lucide React**: Icon library

## Audio and Graphics
- **PIXI.js ecosystem**: Core rendering, extras, and utilities
- **Web Audio API**: Native browser audio handling
- **Inter font**: Typography (@fontsource/inter)

## Python Dependencies
- **Python 3**: Game mathematics engine
- **NumPy/SciPy**: Statistical calculations (implied by math engine)
- **CSV/JSON**: Data serialization for game outcomes

## Development and Build
- **Vite**: Build tool and dev server with plugins for React and runtime error handling
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution for development
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Compliance and Integration
- **Stake Engine API**: Gaming platform integration
- **Child process spawning**: Python integration from Node.js
- **Session management**: User authentication and game state persistence

## Runtime modes

Set `VITE_RUNTIME_MODE` to control how the game talks to the engine:

- `engine`: Use the host-provided Stake Engine SDK (for platform deployment).
- `server`: Call local Express API (`/api/stake/play`) which runs the Python math engine.
- `mock`:   Use built-in randomizer for quick UI work.

Create a `.env` file at repo root:

```env
VITE_RUNTIME_MODE=server
```

