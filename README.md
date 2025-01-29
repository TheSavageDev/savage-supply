# First Aid Kit Tracker

This project is designed to track the contents and expiration dates of first aid kits. It includes features for notifying users via email, text, or push notifications when supplies need to be restocked or when medicines and topicals expire.

## Project Structure

The project is divided into three main parts:

1. **Backend**: Built with NestJS, it handles the business logic, database interactions, and API endpoints.
   - **Main Entry**: `backend/src/main.ts`
   - **Application Module**: `backend/src/app.module.ts`
   - **Controllers**: Manage HTTP requests related to first aid kits.
   - **Services**: Contain business logic for managing first aid kits.
   - **Middlewares**: Handle logging and other request/response processing.
   - **Entities**: Define the structure of first aid kit data in the database.
   - **DTOs**: Ensure data validation and structure for API operations.

2. **Frontend**: Developed using React Native, it provides the user interface for interacting with the first aid kit tracker.
   - **Main Entry**: `frontend/src/App.tsx`
   - **Components**: Reusable UI components for displaying first aid kits.
   - **Screens**: Define the main screens of the application.
   - **Services**: Handle API calls to the backend.

3. **Remix App**: A server-rendered application that complements the frontend, providing additional features and routing.
   - **Main Entry**: `remix-app/app/entry.client.tsx`
   - **Routes**: Define the routing for the application.
   - **Components**: Additional UI components for detailed views.

4. **Database**: Contains SQL scripts for initializing and seeding the database.

## Features

- Track contents and expiration dates of first aid kits.
- Notifications for restocking supplies and expired items via:
  - Email
  - Text messages
  - Push notifications

## Setup Instructions

1. Clone the repository.
2. Navigate to the `backend` directory and install dependencies:
   ```
   cd backend
   npm install
   ```
3. Set up the database by running the SQL scripts in the `database/migrations` directory.
4. Start the backend server:
   ```
   npm run start
   ```
5. Navigate to the `frontend` directory and install dependencies:
   ```
   cd frontend
   npm install
   ```
6. Start the React Native application:
   ```
   npm run start
   ```
7. For the Remix app, navigate to the `remix-app` directory and install dependencies:
   ```
   cd remix-app
   npm install
   ```
8. Start the Remix application:
   ```
   npm run dev
   ```

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.