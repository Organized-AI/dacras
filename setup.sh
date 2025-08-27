#!/bin/bash

echo "🎬 Setting up Dacras AI Video Ad Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed. Some features may not work."
else
    print_status "Docker is available"
fi

# Setup Backend
print_status "Setting up backend..."
cd backend

if [ ! -f .env ]; then
    print_status "Creating .env file from example..."
    cp .env.example .env
    print_success ".env file created! Please edit it with your API keys."
else
    print_warning ".env file already exists"
fi

print_status "Installing backend dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed!"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Setup Frontend
print_status "Setting up frontend..."
cd ../frontend

print_status "Installing frontend dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed!"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

# Final instructions
echo ""
echo -e "${PURPLE}🎉 Setup Complete!${NC}"
echo ""
echo -e "${GREEN}Quick Start Options:${NC}"
echo ""
echo -e "${YELLOW}Option 1 - Run with Docker (Recommended):${NC}"
echo "  cd backend"
echo "  docker-compose up -d"
echo "  # Backend: http://localhost:3000"
echo "  # Frontend: Run separately or add to compose"
echo ""
echo -e "${YELLOW}Option 2 - Run Locally:${NC}"
echo "  # Terminal 1 (Backend):"
echo "  cd backend && npm run dev"
echo ""
echo "  # Terminal 2 (Frontend):"
echo "  cd frontend && npm run dev"
echo "  # Frontend: http://localhost:3001"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Edit backend/.env with your API keys"
echo "2. Choose your preferred run method above"
echo "3. Visit the application in your browser"
echo "4. Check the README.md for detailed documentation"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"