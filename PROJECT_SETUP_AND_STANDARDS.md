# Project Setup and Coding Standards Guide

## Table of Contents
1. Project Overview
2. Backend Setup
3. Frontend Setup
4. Development Workflow
5. Coding Standards
6. Testing
7. Deployment
8. API Service Development Guidelines
9. GitHub Contribution Guidelines
10. Frontend Patterns & Best Practices

## 1. Project Overview

This guide provides a comprehensive framework for setting up and maintaining web applications with:
- **Backend**: Node.js, Express, TypeScript, SQL database
- **Frontend**: React, TypeScript, Vite, Authentication
- **API Testing**: Bruno API client

The project architecture supports user management, content administration, and data tracking with different access levels (public users, members, and admins).

## 2. Backend Setup

### System Requirements
- Node.js (latest LTS version recommended)
- npm/yarn
- SQL database (MySQL, PostgreSQL, etc.)

### Project Structure
```
backend/
├── src/                  # Source code
│   ├── controllers/      # Request handlers
│   ├── models/           # Data models
│   ├── ext/              # External integrations
│   ├── routes.ts         # API routes definition
│   └── server.ts         # Server entry point
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

### Installation
```bash
cd backend
npm install
```

### Environment Setup
Create a `.env` file in the backend directory with:
```
PORT=8000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
```

### Available Scripts
- `npm run dev` - Start development server with hot-reload using nodemon
- `npm start` - Start production server with ts-node

### TypeScript Configuration
The backend should use a strict TypeScript configuration with:
- Node.js resolution
- Source maps enabled
- Decorators support (if needed)
- Output directory in `./dist`

## 3. Frontend Setup

### System Requirements
- Node.js (latest LTS version recommended)
- npm/yarn

### Project Structure
```
frontend/
├── public/               # Static files
├── src/
│   ├── api/              # API client
│   ├── assets/           # Static assets
│   ├── components/       # Reusable UI components
│   ├── entities/         # Entity definitions/types
│   ├── pages/            # Page components
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Entry point
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── eslint.config.js      # ESLint configuration
```

### Installation
```bash
cd frontend
npm install
```

### Environment Setup
Create a `.env` file in the frontend directory with:
```
VITE_API_URL=http://localhost:8000
VITE_AUTH_DOMAIN=your-auth-domain
VITE_AUTH_CLIENT_ID=your-auth-client-id
VITE_AUTH_AUDIENCE=your-auth-audience
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 4. Development Workflow

### Getting Started
1. Clone the repository
2. Install dependencies for both backend and frontend
3. Set up environment variables
4. Start backend: `cd backend && npm run dev`
5. Start frontend: `cd frontend && npm run dev`

### Branching Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`

### Pull Request Process
1. Create a feature branch from `develop`
2. Implement changes with appropriate tests
3. Ensure ESLint passes with no errors
4. Submit PR to `develop` branch
5. Code review and approval before merge

## 5. Coding Standards

### Backend

#### TypeScript Style Guide
- Use strict typing with interfaces for data models
- Avoid `any` type where possible
- Use async/await for asynchronous operations
- Document public functions with JSDoc comments

#### API Design
- RESTful API with consistent naming
- Controllers handle request/response logic
- Models define data structure and DB interactions
- Use proper HTTP status codes and error handling

#### Example Controller Structure
```typescript
// Controller functions should be modular and focused
export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    // Implementation
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
```

### Frontend

#### React & TypeScript Style Guide
- Prefer function components with hooks over class components
- Define explicit interfaces for component props and state
- Use TypeScript for consistent type definitions across the application
- Avoid the `any` type - use proper typing or unknown with type guards when necessary
- Follow consistent file and folder organization patterns

#### Component Organization
- Use barrel exports (index.ts files) for component directories:
  ```typescript
  // Example: components/common/index.ts
  export * from './Button';
  export * from './Card';
  export * from './FormComponents';
  ```
- Organize components by feature or domain (not by type)
- Break large components (>300 lines) into smaller, focused subcomponents
- Keep related components together in a directory

#### Component Reusability
- Create a centralized UI component library in `components/ui/` for shared elements
- Implement consistent component APIs with similar prop patterns
- Use composition over inheritance for component extension
- Extract repetitive UI patterns into reusable components
- Implement compound components for complex UI elements

#### Design System Integration
- Use a centralized theme system for colors, spacing, typography:
  ```typescript
  // src/styles/theme.ts - Example structure
  export const theme = {
    colors: {
      primary: { main: '#1890ff', light: '#bae7ff', dark: '#096dd9' },
      // ...other color definitions
    },
    spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', /* ... */ },
    typography: { /* ... */ },
    // ...other design tokens
  };
  ```
- Reference theme variables instead of hardcoding values
- Create design token abstractions for consistency
- Establish a shared vocabulary for UI patterns
- Document component examples and usage patterns

#### Performance Optimization
- Implement React.memo for expensive components
- Use useMemo and useCallback for computationally intensive operations
- Implement proper dependency arrays in useEffect and other hooks
- Practice code splitting with React.lazy and Suspense
- Optimize list rendering with proper key usage and virtualization for long lists
- Implement debouncing/throttling for frequent events

#### State Management
- Use React Context API for global/shared state
- Implement custom hooks for reusable logic
- Centralize API integrations in service modules
- Practice prop drilling alternatives (Context, composition)
- Standardize loading/error state handling with custom hooks:
  ```typescript
  // Example: useApiResource hook
  function useApiResource<T>(fetchFn, initialData = null) {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // ...implementation
    
    return { data, loading, error, refetch };
  }
  ```

#### Form Management
- Use React Hook Form or Formik for complex forms
- Implement consistent form validation patterns
- Create reusable form field components
- Standardize error handling and display

#### Naming Conventions
- Components: PascalCase (e.g., `UserForm.tsx`)
- Hooks: camelCase with "use" prefix (e.g., `useAuth.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_ITEMS`)
- Types/Interfaces: PascalCase (e.g., `UserProfile`)
- Files containing a single component should match component name

#### Code Quality
- Document complex component logic with comments
- Create self-documenting component APIs with descriptive prop names
- Use TypeScript to enforce prop requirements
- Write unit tests for critical functionality
- Follow consistent code formatting with ESLint and Prettier

## 6. Testing

### Backend Testing
- API client (e.g., Bruno) for testing endpoints
- Create collections for different API resources
- Document API requests, responses, and test scenarios

### Testing Collections Structure
```
APITests/
├── configuration.json    # Testing configuration
├── resource1.test        # Resource 1 test
├── resource2.test        # Resource 2 test
└── auth.test             # Authentication test
```

### Frontend Testing
- Component testing with a testing library (Jest, Vitest, etc.)
- Form validation testing
- Authentication flow testing
- Integration tests for critical user journeys

## 7. Deployment

### Backend Deployment
- Build the TypeScript project
- Set up production environment variables
- Consider using PM2 for Node.js process management

### Frontend Deployment
- Build the project with `npm run build`
- Deploy static assets to a CDN or hosting service
- Configure environment variables for production

### CI/CD Considerations
- Automate testing in the CI pipeline
- Deploy to staging environment before production
- Implement database migration strategy

## 8. API Service Development Guidelines

### API Service Architecture

The application uses a standard pattern for all API services to promote consistency and code reuse.

#### Service Structure
```
frontend/
└── src/
    ├── api/
    │   ├── baseApiService.ts         # Base service with common functionality
    │   ├── apiClient.ts              # Axios instance for API requests
    │   ├── [entity]Service.ts        # Entity-specific services
    │   └── mockData/                 # Mock data for development
    ├── utils/
    │   └── serviceUtils.ts           # Common utility functions
    └── entities/
        ├── api.ts                    # API response interfaces
        └── [entity].ts               # Entity type definitions
```

### Implementation Guidelines

#### 1. Service Class Creation

All API services must extend the `BaseApiService` class:

```typescript
import { BaseApiService } from './baseApiService';
import { YourEntityType } from '../entities/yourEntity';
import mockData from './mockData/yourEntityData.json';
import { createSuccessResponse, handleApiError } from '../utils/serviceUtils';

/**
 * Service for managing entity data
 */
export class YourEntityService extends BaseApiService<YourEntityType> {
  constructor() {
    super('entityEndpoint', mockData);
  }
  
  // Entity-specific methods here
}

// Create and export a singleton instance
export const yourEntityService = new YourEntityService();
```

#### 2. Response Handling 

All API responses must follow the standard `ApiResponse<T>` format and use utility functions:

- Use `createSuccessResponse(data)` for successful responses
- Use `createErrorResponse(message)` for error responses
- Use `handleApiError(error, entityName, operation)` for error handling

#### 3. Date Handling

Services with date fields should use utility functions for date conversion:

- Use `convertDates<T>(obj, dateFields)` for single objects
- Use `convertDatesInArray<T>(array, dateFields)` for collections

#### 4. Data Manipulation

Reuse common data manipulation functions:

- Use `findById` and `findIndexById` for entity lookup
- Use `getNextId` for ID generation in mock environments
- Use `sumBy` and `filterByMonth` for data aggregation

#### 5. Mock Data Handling

Mock data operations should:
- Override `convertMockItem` for entity-specific type conversions
- Use consistent delay simulation with `mockDelay()`
- Implement realistic entity updates with proper error handling

#### 6. Method Organization

Services should organize methods in a consistent order:
1. Constructor and common setup
2. Type conversion utilities
3. GET operations (getAll, getById, getByFilter, etc.)
4. POST operations (create, start, etc.)
5. PUT/PATCH operations (update, etc.)
6. DELETE operations
7. Specialized query operations

### Example Implementation

```typescript
import { BaseApiService } from './baseApiService';
import { SomeEntity } from '../entities/someEntity';
import { ApiResponse } from '../entities/api';
import mockData from './mockData/someEntities.json';
import apiClient from './apiClient';
import { createSuccessResponse, handleApiError } from '../utils/serviceUtils';

export class SomeEntityService extends BaseApiService<SomeEntity> {
  constructor() {
    super('someEntities', mockData);
  }

  // Override for entity-specific conversion
  protected convertMockItem = (item: any): SomeEntity => {
    return {
      ...item,
      status: item.status as SomeEntityStatus,
      createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
    };
  }

  // Custom entity-specific method
  async getByStatus(status: SomeEntityStatus): Promise<ApiResponse<SomeEntity[]>> {
    if (this.useMockData) {
      await this.mockDelay();
      const filtered = this.mockData
        .filter(item => item.status === status)
        .map(this.convertMockItem);
      
      return createSuccessResponse(filtered);
    }

    try {
      const response = await apiClient.get(`/${this.endpoint}/status/${status}`);
      return createSuccessResponse(response.data);
    } catch (error: any) {
      return handleApiError(error, this.endpoint, `getting by status ${status}`);
    }
  }
}

export const someEntityService = new SomeEntityService();
```

This standardized approach ensures consistency across all API services, promotes code reuse, and reduces the risk of bugs due to inconsistent implementations.

## 9. GitHub Contribution Guidelines

### Branch Management
- `main` - Protected branch, deployable at any time
- `develop` - Integration branch for feature development
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`
- Use meaningful branch names that describe the work being done

### Pull Request Workflow
1. **Before Creating a PR**
   - Ensure code follows all project standards
   - Run linting: `npm run lint`
   - Check for code duplication
   - Test your changes locally
   - Review your own code first

2. **Creating a PR**
   - Use a descriptive title prefixed with feature area (e.g., "[Frontend] Implement tenant search")
   - Fill out the PR template completely
   - Link relevant issues with "Fixes #123" or "Related to #456"
   - Add appropriate labels (bug, enhancement, documentation, etc.)
   - Include screenshots or videos for UI changes

3. **PR Description Requirements**
   - Summary of changes and purpose
   - Testing instructions
   - Screenshot/video for visual changes
   - Note any performance considerations
   - List any new dependencies and why they're needed

4. **Code Review Standards**
   - PRs require at least one approval before merging
   - Address review comments promptly
   - Prefer fixing issues over explaining why they shouldn't be fixed
   - Use the review discussion for knowledge sharing
   - Be constructive and respectful in comments

### Commit Standards
- Use conventional commits format: `type(scope): message`
  - Types: feat, fix, docs, style, refactor, test, chore
  - Example: `feat(tenant): add tenant search functionality`
- Keep commits focused on single logical changes
- Write descriptive commit messages (not "fixed bug" or "updates")
- Reference issue numbers in commit messages when applicable

### Code Review Checklist
- Does the code follow our style and structure guidelines?
- Are there any performance concerns with the implementation?
- Is the solution unnecessarily complex?
- Are all edge cases handled appropriately?
- Is there proper error handling?
- Are there appropriate tests?
- Do the variable/function names clearly communicate their purpose?
- Does the PR introduce any security concerns?
- Are the UI components following our design system?

### Continuous Integration
- All PRs must pass CI checks before merging
- CI pipeline includes:
  - Linting
  - Type checking
  - Unit tests
  - Integration tests (for backend changes)
  - Build verification

### Documentation Requirements
- Document all new features in relevant README files or documentation
- Add inline documentation for complex code sections
- Update API documentation for backend changes
- Document any new environment variables or configuration

## 10. Frontend Patterns & Best Practices

### Component Architecture

#### UI Component Library Structure
```
frontend/
└── src/
    ├── components/
    │   ├── ui/                      # Reusable UI components
    │   │   ├── Button/              # Example component directory
    │   │   │   ├── Button.tsx       # Component implementation
    │   │   │   ├── Button.test.tsx  # Component tests
    │   │   │   └── index.ts         # Barrel export
    │   │   ├── Card/
    │   │   ├── Form/
    │   │   │   ├── FormInput.tsx
    │   │   │   ├── FormSelect.tsx
    │   │   │   └── index.ts
    │   │   ├── Modal/
    │   │   ├── Chart/
    │   │   └── index.ts             # Main barrel export
    │   ├── layout/                  # Layout components
    │   └── features/                # Feature-specific components
```

#### Component Implementation Guidelines

1. **Component Design**
   - Focus on single responsibility
   - Use composition over inheritance
   - Accept props for customization
   - Document props with TypeScript interfaces and JSDoc comments

2. **Compound Components Pattern**
   For complex UI elements that maintain internal state:

   ```tsx
   // Example compound components pattern
   const Card = ({ children }: CardProps) => (
     <div className="card">{children}</div>
   );

   Card.Header = ({ children }: CardChildProps) => (
     <div className="card-header">{children}</div>
   );

   Card.Body = ({ children }: CardChildProps) => (
     <div className="card-body">{children}</div>
   );

   Card.Footer = ({ children }: CardChildProps) => (
     <div className="card-footer">{children}</div>
   );

   // Usage
   <Card>
     <Card.Header>Card Title</Card.Header>
     <Card.Body>Card content</Card.Body>
     <Card.Footer>Footer</Card.Footer>
   </Card>
   ```

3. **Component Testing**
   - Test component rendering
   - Test interactive behavior
   - Test edge cases
   - Use test data mocks

### Design System Implementation

#### Theme Structure

Create a centralized theme system in `src/styles/theme.ts`:

```typescript
export const theme = {
  colors: {
    primary: {
      main: '#1890ff',
      light: '#40a9ff',
      dark: '#096dd9',
      contrastText: '#ffffff',
    },
    secondary: { /* ... */ },
    success: { /* ... */ },
    warning: { /* ... */ },
    error: { /* ... */ },
    neutral: {
      100: '#ffffff',
      200: '#f5f5f5',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeights: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      xxl: '2rem',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  breakpoints: {
    xs: '320px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
    lg: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
  },
  motion: {
    durations: {
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
    },
    easings: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    tooltip: 1500,
  },
};

export type Theme = typeof theme;
```

#### CSS Variables Implementation

Generate global CSS variables from the theme:

```typescript
// src/styles/themeUtils.ts
import { Theme } from './theme';

export function generateCssVariables(theme: Theme): string {
  let cssVars = ':root {\n';
  
  // Process colors
  Object.entries(theme.colors).forEach(([colorName, colorValue]) => {
    if (typeof colorValue === 'string') {
      cssVars += `  --color-${colorName}: ${colorValue};\n`;
    } else {
      Object.entries(colorValue).forEach(([shade, value]) => {
        cssVars += `  --color-${colorName}-${shade}: ${value};\n`;
      });
    }
  });
  
  // Process typography
  Object.entries(theme.typography.sizes).forEach(([size, value]) => {
    cssVars += `  --font-size-${size}: ${value};\n`;
  });
  
  // Process spacing
  Object.entries(theme.spacing).forEach(([size, value]) => {
    cssVars += `  --spacing-${size}: ${value};\n`;
  });
  
  // Add other theme properties as needed
  
  cssVars += '}\n';
  return cssVars;
}
```

#### Theming with CSS-in-JS (optional)

For components requiring dynamic theming, use CSS-in-JS libraries like styled-components or emotion:

```typescript
import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const StyledButton = styled.button<{ variant: 'primary' | 'secondary' | 'danger' }>`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: 4px;
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  transition: background-color ${props => props.theme.motion.durations.normal} ${props => props.theme.motion.easings.easeInOut};
  
  ${props => {
    if (props.variant === 'primary') {
      return `
        background-color: ${props.theme.colors.primary.main};
        color: ${props.theme.colors.primary.contrastText};
        &:hover {
          background-color: ${props.theme.colors.primary.dark};
        }
      `;
    }
    // Add other variant styles
  }}
`;
```

### Data Fetching and State Management

#### Custom Hooks for API Requests

Create reusable data fetching hooks to standardize loading, error states, and caching:

```typescript
// src/hooks/useResource.ts
import { useState, useEffect } from 'react';

export interface UseResourceOptions<T> {
  initialData?: T;
  autoFetch?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useResource<T>(
  fetchFn: () => Promise<T>,
  options: UseResourceOptions<T> = {}
) {
  const { initialData, autoFetch = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (onError) onError(error);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, []);

  return { data, error, loading, refetch: fetchData };
}
```

#### Context for Global State

Implement React Context for sharing state across components:

```typescript
// src/context/UserPortfolioContext.ts
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Portfolio } from '../entities/Portfolio';
import { portfolioService } from '../api/portfolioService';

interface UserPortfolioContextType {
  portfolio: Portfolio | null;
  loading: boolean;
  error: string | null;
  refetchPortfolio: () => Promise<void>;
}

const UserPortfolioContext = createContext<UserPortfolioContextType | undefined>(undefined);

export const UserPortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace hardcoded ID with actual user ID from auth context in real app
      const response = await portfolioService.getUserPortfolio('user1');
      
      if (response.success && response.data) {
        setPortfolio(response.data);
      } else {
        setError('Failed to load portfolio data');
      }
    } catch (err) {
      setError('An error occurred while fetching portfolio data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  return (
    <UserPortfolioContext.Provider 
      value={{ portfolio, loading, error, refetchPortfolio: fetchPortfolio }}
    >
      {children}
    </UserPortfolioContext.Provider>
  );
};

export const useUserPortfolio = () => {
  const context = useContext(UserPortfolioContext);
  if (context === undefined) {
    throw new Error('useUserPortfolio must be used within a UserPortfolioProvider');
  }
  return context;
};
```

### Performance Optimization

#### Component Memoization

Use React.memo for expensive components:

```tsx
const StockListItem = React.memo(({ stock }: { stock: Stock }) => {
  // Component implementation
  return (
    <tr>
      <td>{stock.symbol}</td>
      <td>{stock.name}</td>
      <td>${stock.currentPrice.toFixed(2)}</td>
    </tr>
  );
});
```

#### List Virtualization

For long scrollable lists, use virtualization:

```tsx
import { FixedSizeList as List } from 'react-window';

const StocksList = ({ stocks }: { stocks: Stock[] }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const stock = stocks[index];
    return (
      <div style={style} className="stock-row">
        <div className="stock-symbol">{stock.symbol}</div>
        <div className="stock-name">{stock.name}</div>
        <div className="stock-price">${stock.currentPrice.toFixed(2)}</div>
      </div>
    );
  };

  return (
    <div className="stocks-list-container">
      <List
        height={400}
        width="100%"
        itemCount={stocks.length}
        itemSize={50}
      >
        {Row}
      </List>
    </div>
  );
};
```

#### Debouncing User Input

For search inputs and other high-frequency events:

```tsx
import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';

const SearchBox = ({ onSearch }: { onSearch: (term: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounce the search callback
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      onSearch(term);
    }, 300),
    [onSearch]
  );
  
  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);
  
  return (
    <input
      type="text"
      placeholder="Search..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="search-input"
    />
  );
};
```

### Accessibility Best Practices

#### Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

```tsx
// Focus trap for modals
import { useRef, useEffect } from 'react';

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Focus the modal when it opens
      modalRef.current?.focus();
      
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
      
      // Restore body scrolling when modal closes
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);
  
  // Handle escape key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <button 
          className="close-btn" 
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};
```

#### ARIA Attributes

Use appropriate ARIA roles and attributes:

```tsx
const Tabs = ({ tabs, activeTab, onChange }: TabsProps) => {
  return (
    <div className="tabs-container">
      <div role="tablist" className="tabs-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div 
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="tab-panel"
      >
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};
```

### End-to-End Testing

Implement E2E testing with Cypress to ensure critical user flows work correctly:

```javascript
// cypress/e2e/trade.cy.js
describe('Trade Page Functionality', () => {
  beforeEach(() => {
    cy.visit('/trade');
    cy.wait(1000); // Wait for mock data to load
  });
  
  it('should allow buying stocks', () => {
    // Select a stock
    cy.get('.stock-item').first().click();
    
    // Enter number of shares
    cy.get('#shares').clear().type('10');
    
    // Click buy button
    cy.get('.buy-button').click();
    
    // Confirm transaction
    cy.get('.confirm-button').click();
    
    // Verify success message
    cy.get('.success-message').should('be.visible');
    
    // Verify portfolio updated
    cy.visit('/portfolio');
    cy.get('.position').should('have.length.at.least', 1);
  });
});
```

## Additional Resources

- React Documentation: https://react.dev/
- TypeScript Documentation: https://www.typescriptlang.org/docs/
- Express Documentation: https://expressjs.com/
- Vite Documentation: https://vitejs.dev/guide/
- Authentication Documentation (Auth0, etc.): https://auth0.com/docs/
- Database Documentation: https://dev.mysql.com/doc/ (or relevant DB)

## Project Contacts

- Project Lead: [Project Lead Name]
- Backend Developer: [Backend Developer Name]
- Frontend Developer: [Frontend Developer Name]

Last Updated: April 12, 2025