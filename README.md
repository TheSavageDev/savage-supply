# Savage Supply - First Aid and Survival Kit Management System

A web application designed to track the contents and expiration dates of first aid kits, with notification features for restocking and expiration alerts.

## Features

- Track first aid kit inventory
- Monitor expiration dates
- Notification system for:
  - Low stock alerts
  - Expiring items
  - Required restocking

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL (v15 or higher)

## Getting Started

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/savage-supply.git
   cd savage-supply
   ```

2. Install dependencies

```bash
npm run install:all
```

3. Set up environment variables:

   - Copy `.env.example` to `.env` in both api and frontend directories
   - Update the values as needed

4. Start the development servers

```bash
npm start
```

The API will run on http://localhost:3050 and the frontend on http://localhost:5173

## Project Structure

```
savage-supply/
├── api/           # Backend NestJS API
├── frontend/      # Frontend Vite/React application
└── package.json   # Root level scripts for development
```

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details
