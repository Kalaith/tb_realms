# Tradeborn Realms

> A fantasy trading simulation game where magic meets money

![Status](https://img.shields.io/badge/Status-Active%20Development-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61dafb)
![Backend](https://img.shields.io/badge/Backend-PHP%20%2B%20MySQL-777bb4)

## 🎮 About the Game

Tradeborn Realms is a web-based fantasy trading simulation that combines the strategic depth of financial markets with the immersive storytelling of a living fantasy world. Players trade shares in fictional guilds, magical commodities, mythical beasts, and powerful empires—all influenced by procedurally generated events and news cycles.

### 🌟 Key Features

- **📈 Fantasy Trading Market**: Buy and sell shares in guilds, magical artifacts, and legendary beasts
- **💰 Risk-Free Learning**: Start with virtual currency - no real money involved
- **🎲 Dynamic Events**: Market-influencing events like dragon sightings, guild wars, and royal scandals
- **📊 Real-Time Analytics**: Charts, historical data, and performance tracking
- **🏆 Achievements & Leaderboards**: Global rankings and milestone rewards
- **🎓 Educational Tools**: Tutorials and insights for trading strategy development
- **⚡ Time Acceleration**: Fast-forward market simulation for quick strategy testing

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for responsive styling
- **Vite** for fast development and building
- **Zustand** for state management
- **Chart.js** for market data visualization

### Backend
- **PHP 8.1+** with modern architecture
- **MySQL 8.0+** for data persistence
- **Composer** for dependency management
- **PHPUnit** for testing
- **RESTful API** architecture

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **PHP** 8.1.0 or higher
- **Composer** 2.0.0 or higher
- **MySQL** 8.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kalaith/webhatchery.git
   cd webhatchery/game_apps/tb_realms
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Backend**
   ```bash
   cd ../backend
   composer install
   cp .env.example .env
   # Edit .env with your database configuration
   php scripts/init-database.php
   ```

4. **Start Development Servers**
   ```bash
   # Frontend (from frontend/ directory)
   npm run dev

   # Backend (from backend/ directory)
   php -S localhost:8000 -t public
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## 📁 Project Structure

```
tb_realms/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── stores/         # Zustand state stores
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # PHP backend
│   ├── src/
│   │   ├── Controllers/    # API controllers
│   │   ├── Models/         # Data models
│   │   ├── Services/       # Business logic
│   │   └── Utils/          # Helper utilities
│   ├── public/             # Web server entry point
│   ├── scripts/            # Database and setup scripts
│   ├── tests/              # PHPUnit tests
│   └── composer.json
├── bruno/                   # API testing collection
├── docs/                    # Documentation
└── README.md
```

## 🎯 Gameplay Overview

### Starting Your Journey
1. Create an account and receive virtual starting capital
2. Complete the onboarding tutorial to learn trading basics
3. Explore the fantasy market and choose your first investments

### Trading Mechanics
- **Market Orders**: Buy/sell immediately at current prices
- **Limit Orders**: Set specific price targets for transactions
- **Stop-Loss Orders**: Protect investments with automatic selling
- **Portfolio Diversification**: Spread risk across different asset types

### Asset Categories
- **🏰 Guild Shares**: Invest in powerful trading guilds and merchant organizations
- **🔮 Magical Commodities**: Trade in rare spell components and enchanted materials
- **🐉 Mythical Beasts**: Own shares in legendary creatures and their territories
- **👑 Empire Bonds**: Stable investments in established kingdoms and realms

## 🏗️ Development

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Backend Development
```bash
cd backend
composer install     # Install dependencies
php artisan serve    # Start development server
composer test        # Run PHPUnit tests
composer lint        # Run PHP CodeSniffer
```

### Environment Configuration

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Tradeborn Realms
VITE_DEBUG_MODE=true
```

#### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=tb_realms
DB_USERNAME=your_username
DB_PASSWORD=your_password
API_DEBUG=true
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Backend Tests
```bash
cd backend
composer test        # Run all tests
composer test:unit   # Run unit tests only
composer test:integration # Run integration tests
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
composer install --no-dev --optimize-autoloader
```

### Environment Setup
1. Configure production environment variables
2. Set up MySQL database with proper permissions
3. Configure web server (Apache/Nginx) with proper rewrite rules
4. Enable HTTPS for secure API communication

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Guidelines
1. Follow TypeScript strict mode for frontend development
2. Use PSR-12 coding standards for PHP backend
3. Write tests for new features and bug fixes
4. Ensure accessibility compliance (WCAG 2.1 AA)
5. Use semantic commit messages

### Code Quality
- **Frontend**: ESLint + Prettier for code formatting
- **Backend**: PHP CodeSniffer for PSR-12 compliance
- **Testing**: Minimum 80% code coverage requirement
- **Types**: Strict TypeScript - no `any` types allowed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Documents

- [Game Design Document](game_design_doc.md) - Comprehensive game design and mechanics
- [Project Setup & Standards](PROJECT_SETUP_AND_STANDARDS.md) - Development standards and setup
- [Migration Guide](MIGRATION_NODE_TO_PHP.md) - Node.js to PHP migration notes
- [Frontend Review Prompts](frontend_review_prompts.md) - Code review guidelines

## 📞 Support

For questions, bug reports, or feature requests:
- Create an issue on GitHub
- Contact the development team
- Check the [Wiki](wiki) for additional documentation

---

**Ready to become the richest merchant in the realm? Start trading in Tradeborn Realms today!** 🏰✨
