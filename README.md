# BlackFile.xyz Frontend

Modern and responsive frontend for the BlackFile.xyz file sharing platform, built with React 19 and TypeScript.

## Features

- **React 19**: Latest version of React with modern features
- **TypeScript**: Type safety and better development experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vite**: Fast build tool and development server
- **Framer Motion**: Smooth animations and transitions
- **React Router**: Client-side routing for single page application
- **Lucide React**: Beautiful and consistent icons
- **Responsive Design**: Works perfectly on all devices

## Requirements

Before starting, make sure you have installed:

- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **npm** or **yarn** - Package manager (npm comes with Node.js)
- **Git** - Version control system

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd stealing.wtf/frontend-react
```

### 2. Install dependencies
```bash
# Using npm
npm install

# Using yarn
yarn install
```

### 3. Start the development server
```bash
# Using npm
npm run dev

# Using yarn
yarn dev
```

The application will be available at: `http://localhost:5173`

## Available Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Project Structure

```
frontend-react/
├── public/                 # Static files
├── src/                   # Source code
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   ├── styles/           # CSS and styling files
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── vite.config.ts        # Vite configuration
└── README.md            # This file
```

## Technologies Used

### Core
- **React 19**: User interface library
- **TypeScript**: Programming language with type safety
- **Vite**: Build tool and development server

### Styling
- **Tailwind CSS**: CSS framework
- **@tailwindcss/typography**: Typography plugin for Tailwind

### UI/UX
- **Framer Motion**: Animation library
- **Lucide React**: Icon library
- **React Router DOM**: Routing library

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes

## Configuration

### Tailwind CSS
The project uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`:

```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

### TypeScript
TypeScript configuration is in `tsconfig.json` with strict type checking enabled.

### Vite
Vite configuration is in `vite.config.ts` with React plugin and development settings.

## Backend Integration

The frontend connects to the BlackFile.xyz backend API. Make sure the backend is running on `http://localhost:8000` before using the frontend.

### API Configuration
Update the API base URL in your configuration files if the backend runs on a different port or domain.

## Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full features and optimal layout
- **Tablet**: Adapted interface for medium screens
- **Mobile**: Touch-friendly interface for small screens

## Core Functionalities

### Authentication
- User registration and login
- JWT token management
- Protected routes and authentication guards

### File Management
- File upload with drag and drop
- File preview and download
- File sharing with links
- File organization and management

### Dashboard
- User dashboard with file overview
- File statistics and usage
- Account settings and preferences

## Testing

```bash
# Install testing dependencies (if not already installed)
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test
```

## Build and Deployment

### Production Build
```bash
npm run build
```

This creates a `dist/` folder with optimized files ready for deployment.

### Preview Production Build
```bash
npm run preview
```

### Deployment Options
- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Drag and drop the `dist/` folder or connect via Git
- **GitHub Pages**: Use GitHub Actions for automatic deployment
- **Traditional Hosting**: Upload the `dist/` folder contents to your web server

## Troubleshooting

### Node.js Version Error
```
Error: This project requires Node.js 18+
```
**Solution**: Update Node.js to version 18 or higher.

### Port Already in Use
```
Port 5173 is already in use
```
**Solution**: Close other applications using the port or use a different port:
```bash
npm run dev -- --port 3000
```

### Build Errors
```
TypeScript errors during build
```
**Solution**: Fix TypeScript errors shown in the console or run type checking:
```bash
npm run type-check
```

### Styling Issues
```
Tailwind classes not working
```
**Solution**: Make sure Tailwind CSS is properly configured and imported in your CSS files.

## Performance Optimizations

- **Code Splitting**: Automatic code splitting with Vite
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and asset optimization
- **Lazy Loading**: Components loaded on demand
- **Caching**: Browser caching for static assets

## Security Measures

- **Input Validation**: All user inputs are validated
- **XSS Protection**: Protection against cross-site scripting
- **CSRF Protection**: Cross-site request forgery protection
- **Secure Headers**: Security headers implementation
- **Authentication**: Secure JWT token handling

## Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Test your changes before submitting
- Follow the existing code style

## License

This project is distributed under the MIT License. See the `LICENSE` file for more details.

## Support

For support and questions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

## Useful Links

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Framer Motion Documentation](https://www.framer.com/motion/)

---

**Note**: Make sure the backend API is running before starting the frontend development server.
