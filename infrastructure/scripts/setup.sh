#!/bin/bash

# Setup script for development environment
set -e

echo "🚀 Setting up Repo Ghost Hunter development environment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first:"
    echo "npm install -g pnpm"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
pnpm run db:generate

# Setup environment variables
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual values"
fi

# Start development services
echo "🐳 Starting development services..."
cd infrastructure/docker
docker-compose up -d postgres redis

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Update .env.local with your GitHub OAuth credentials"
echo "2. Run 'pnpm run dev' to start the development servers"
echo "3. Visit http://localhost:3000 for the web app"
echo "4. Visit http://localhost:3001 for the API"
echo ""
echo "📚 For more information, check the README.md"
