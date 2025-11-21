# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Scout - A Next.js application for Tribal AI Knowledge platform.

## Tech Stack

- **Framework**: Next.js 16.0.3 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS v4 with PostCSS
- **Linting**: ESLint with Next.js configuration

## Development Commands

```bash
npm run dev    # Start development server (http://localhost:3000)
npm run build  # Build for production
npm start      # Start production server
npm run lint   # Run ESLint
```

## Project Structure

```
scout/
├── src/           # Source code
│   ├── app/       # Next.js App Router pages and layouts
│   └── ...
├── public/        # Static assets
├── node_modules/  # Dependencies
└── ...
```

## Development Workflow

- Uses Next.js App Router architecture
- TypeScript strict mode enabled
- Hot module reloading in development
- Auto-optimized fonts with next/font (Geist)
- Tailwind CSS for styling with v4 configuration

## Key Technical Decisions

- Next.js 16 with latest App Router for improved performance and developer experience
- React 19 for cutting-edge features
- Tailwind CSS v4 for modern utility-first styling
- TypeScript for type safety and better developer experience
