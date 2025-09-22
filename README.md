# AI SDR - Sales Development Representative System

An AI-powered SDR system for intelligent lead qualification, personalized outreach, and meeting coordination.

## 🚀 Quick Start (Localhost Only)

### Prerequisites
- Python 3.11+
- Node.js 18+
- XAI API Key

### Manual Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd ai-sdr

# Create environment file
cp env.example .env
# Edit .env and add your XAI_API_KEY

# Backend Setup
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend Setup (New Terminal)
cd frontend
npm install
npm run dev -- --port 5173
```

### Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

## 📋 Features

### ✅ Completed Features
- **Lead Management**: Create, import, and manage leads
- **AI Qualification**: Intelligent lead scoring and qualification
- **AI Outreach**: Personalized email generation
- **Meeting Scheduling**: Calendar invite generation (ICS files)
- **Search & Filter**: Real-time lead search and filtering
- **Evaluation Framework**: AI performance testing and monitoring
- **Professional UI**: Toast notifications, loading states, empty states

### 🎯 Core Functionality
- **Lead Scoring**: AI-powered lead qualification with confidence scores
- **Outreach Generation**: Personalized email content with multiple variants
- **Meeting Proposals**: Calendar slot suggestions and ICS file downloads
- **Activity Tracking**: Complete audit trail of all lead interactions
- **Performance Monitoring**: Evaluation dashboard for AI accuracy

## 🔧 API Endpoints

### Lead Management
- `GET /api/leads` - Get all leads
- `POST /api/leads` - Create new lead
- `POST /api/leads/import` - Bulk import from CSV
- `POST /api/leads/seed` - Seed sample data

### AI Features
- `POST /api/leads/{id}/score` - AI lead scoring
- `POST /api/leads/{id}/qualify` - AI qualification
- `POST /api/leads/{id}/message` - AI outreach generation

### Meeting Scheduling
- `POST /api/meetings/slots` - Get meeting time suggestions
- `POST /api/meetings/ics` - Generate calendar invite

### Evaluation
- `POST /api/evals/run` - Run AI evaluation tests
- `GET /api/evals/` - List evaluation results
- `GET /api/evals/{id}` - Get specific evaluation

## ⚙️ Environment Variables

Create a `.env` file in the root directory:
```bash
XAI_API_KEY=your_xai_api_key_here
DATABASE_URL=sqlite:///./backend/leads.db
```

## 🗄️ Database

- **SQLite** database with automatic table creation
- **Models**: Lead, Activity, ScoringConfig, CompanyProfile, EvaluationRun
- **Relationships**: Proper foreign keys and data integrity

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Evaluation Framework
```bash
cd backend/evals
python run.py
```

## 📊 Evaluation Framework

The system includes a comprehensive evaluation framework that tests AI performance:

- **5 Test Leads**: Predefined scenarios with expected outcomes
- **Schema Validation**: Ensures AI responses follow correct format
- **Performance Metrics**: Pass rates, accuracy, confidence calibration
- **Dashboard**: Real-time monitoring of AI performance

## 🛠️ Technology Stack

- **Backend**: FastAPI, Python 3.11, SQLAlchemy, Pydantic
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **AI**: xAI Grok API integration
- **Database**: SQLite (production-ready for PostgreSQL)
- **Deployment**: Docker, Docker Compose

## 📱 User Interface

- **Modern Design**: Clean, professional interface
- **Responsive**: Works on desktop and mobile
- **Real-time Updates**: Live data synchronization
- **User Feedback**: Toast notifications and loading states
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🔒 Security

- **Environment Variables**: Secure API key management
- **CORS Configuration**: Proper cross-origin settings
- **Input Validation**: Pydantic schema validation
- **SQL Injection Protection**: SQLAlchemy ORM

## 📈 Performance

- **Fast Loading**: Optimized React components
- **Efficient Queries**: Database query optimization
- **Caching**: Strategic data caching
- **Bundle Optimization**: Vite build optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the [INSTALL.md](INSTALL.md) for setup issues
2. Review [FREE_DEPLOYMENT.md](FREE_DEPLOYMENT.md) for deployment help
3. Open an issue on GitHub
