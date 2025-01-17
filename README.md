
```markdown:README.md

## Setup

1. Clone this repository
2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

To start the application, run the following command from the project root directory:

```bash
uvicorn app:asgi_app --reload
```

This command:
- Starts the FastAPI server
- Loads the AI model
- Enables hot reloading for development
- Makes the prediction endpoint available

The application will be accessible at `http://localhost:8000` by default.


## Running the Backend Server

After starting the model server, navigate to the server directory and start the Express backend:

```bash
cd server
npm run start
```

This will start the backend server, which will be accessible at `http://localhost:5000` by default.

## Running the Frontend

Navigate to the frontend directory and start the React application:

```bash
cd frontend
npm start
```

This will start the frontend server, which will be accessible at `http://localhost:3000` by default.

