# AI SDR Application

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- XAI API key

### Environment Setup
1. Create a `.env` file in the root directory:
```bash
XAI_API_KEY=your_xai_api_key_here
```

### Run the Application
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **With Nginx**: http://localhost:80

### Stop the Application
```bash
docker-compose down
```

## Production Deployment

### Environment Variables
- `XAI_API_KEY`: Your XAI API key
- `DATABASE_URL`: Database connection string (default: SQLite)

### Health Checks
- Backend: http://localhost:8000/health
- Frontend: http://localhost:3000

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
```

## Development

### Backend Development
```bash
cd backend
docker build -t ai-sdr-backend .
docker run -p 8000:8000 -e XAI_API_KEY=your_key ai-sdr-backend
```

### Frontend Development
```bash
cd frontend
docker build -t ai-sdr-frontend .
docker run -p 3000:3000 ai-sdr-frontend
```
