# IDA_CN - Dyslexia Awareness Platform

A full-stack web application for dyslexia awareness and education, built with Strapi CMS and Next.js.

## Project Structure

- `my-backend/` - Strapi CMS backend (v5.33.2)
- `my-frontend/` - Next.js frontend (v16.1.1)

## Tech Stack

### Backend
- Strapi CMS 5.33.2
- TypeScript
- SQLite (better-sqlite3) - Development
- MySQL (mysql2) - Production

### Frontend
- Next.js 16.1.1
- React 19
- TypeScript
- Tailwind CSS 4

## Getting Started

### Backend Setup
```bash
cd my-backend
npm install
npm run develop
```

### Frontend Setup
```bash
cd my-frontend
npm install
npm run dev
```

## Features

- Content management via Strapi CMS
- Interactive dyslexia assessment quiz
- Article and resource management
- Success stories showcase
- Fact sheets and infographics
- Responsive design with accessibility features

## Database Configuration

### Development
- **SQLite**: Default database for local development
- No additional setup required

### Production
- **MySQL**: Recommended for production environments
- See [MySQL Migration Guide](./my-backend/MYSQL_MIGRATION.md) for setup instructions

## Environment Variables

Copy `.env.example` to `.env` in the `my-backend` directory and configure:

```env
# For MySQL Production
DATABASE_CLIENT=mysql
DATABASE_HOST=your-mysql-host
DATABASE_PORT=3306
DATABASE_NAME=strapi_production
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
```

Current maintainer: 范慧东
