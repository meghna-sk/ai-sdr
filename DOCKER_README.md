# AI SDR Application - Docker Setup

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- XAI API key

### Environment Setup
1. Copy the environment template:
```bash
cp env.example .env
```

2. Edit `.env` file and add your XAI API key:
```bash
XAI_API_KEY=your_xai_api_key_here
```

### Run the Application

#### Development Mode
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

#### Production Mode
```bash
# Set production environment
echo "ENVIRONMENT=production" >> .env
echo "DEBUG=false" >> .env

# Build and start
docker-compose up -d --build
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **With Nginx**: http://localhost:80
- **API Documentation**: http://localhost:8000/docs

### Stop the Application
```bash
# Stop services
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v
```

## Service Details

### Backend Service
- **Port**: 8000
- **Health Check**: http://localhost:8000/health
- **Database**: SQLite stored in Docker volume
- **API Docs**: http://localhost:8000/docs

### Frontend Service
- **Port**: 3000
- **Build**: Production build served with `serve`
- **Health Check**: Built-in health check

### Nginx Service (Optional)
- **Ports**: 80 (HTTP), 443 (HTTPS)
- **Features**: Reverse proxy, gzip compression, security headers
- **SSL**: Mount SSL certificates to `./ssl` directory

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clean build (removes cached layers)
docker-compose build --no-cache

# Check build logs
docker-compose logs backend
docker-compose logs frontend
```

#### 2. Database Issues
```bash
# Reset database volume
docker-compose down -v
docker-compose up -d --build
```

#### 3. Port Conflicts
```bash
# Check what's using ports
netstat -tulpn | grep :8000
netstat -tulpn | grep :3000

# Use different ports in docker-compose.yml
```

#### 4. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

### Health Checks
```bash
# Check service health
docker-compose ps

# View health check logs
docker inspect <container_name> | grep -A 10 Health
```

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f backend
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

### Database Management
```bash
# Access database container
docker-compose exec backend bash

# Run database migrations (if any)
# python -m alembic upgrade head
```

## Production Deployment

### Environment Variables
- `XAI_API_KEY`: Your XAI API key (required)
- `DATABASE_URL`: Database connection string
- `ENVIRONMENT`: Set to `production`
- `DEBUG`: Set to `false`

### Security Considerations
- Use strong secret keys
- Enable HTTPS with proper SSL certificates
- Regularly update base images
- Monitor logs for security issues

### Performance Optimization
- Use multi-stage builds (already implemented)
- Enable gzip compression (nginx)
- Use proper caching headers
- Monitor resource usage

### Backup Strategy
```bash
# Backup database volume
docker run --rm -v ai-sdr_backend_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .

# Restore database volume
docker run --rm -v ai-sdr_backend_data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /data
```
