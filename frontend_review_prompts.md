# Frontend Code Review & Refinement Prompts

Based on the instructions in `.github/copilot-instructions.md`, please address the following in the frontend codebase:

## 1. Strict Typing: Eliminate `any` and `as any`

**Goal:** Replace all instances of `any` or `as any` with specific types, interfaces, `unknown` (with type checking), or utility types.

**Files identified with `any` or potential implicit `any`:**

*   **`d:\WebDevelopment\stock_management\frontend\src\api\apiClient.ts`**
    *   Prompt: "Refactor `apiClient.ts`. Define specific types for the `options` parameter in `buildRequestOptions`, `get`, `post`, `put`, `delete`, and `patch` methods. For example, `options` could be `RequestInit`. Replace `data: any` in `post`, `put`, `patch` with generic types (e.g., `<T>`) or specific Data Transfer Objects (DTOs). Remove the `as any` cast for `options.headers` in `buildRequestOptions` by correctly typing `options` and merging headers safely."
    *   Prompt: "In `handleResponse` within `apiClient.ts`, the `data` parsed from `response.json().catch(() => ({}))` can be typed more strictly. Consider using generics like `ApiResponse<T>` if a base API response structure is known or can be introduced, or type it as `unknown` and perform validation/casting in the service layer."

*   **`d:\WebDevelopment\stock_management\frontend\src\contexts\AuthContext.tsx`**
    *   Prompt: "In `AuthContext.tsx`, type the `err` variable in `catch` blocks more strictly. Instead of implicit `any`, use `unknown` and perform instance checks (e.g., `if (err instanceof Error)`) or define a common error type if applicable (e.g., `ApiError`)."

*   **`d:\WebDevelopment\stock_management\frontend\src\utils\apiUtils.ts`**
    *   Prompt: "Review `utils/apiUtils.ts`. Identify all uses of `any` or `as any` and replace them with specific types or interfaces. Ensure all utility functions have explicit parameter types and return types."

*   **`d:\WebDevelopment\stock_management\frontend\src\pages\Settings.tsx`**
    *   Prompt: "Review `pages/Settings.tsx`. Identify all uses of `any` or `as any` (e.g., in state variables, props, function parameters, or return types) and replace them with specific types or interfaces relevant to user settings."

*   **`d:\WebDevelopment\stock_management\frontend\src\api\userSettingsService.ts`**
    *   Prompt: "Review `api/userSettingsService.ts`. Replace `any` in function parameters (e.g., for settings data being saved) and return types with specific DTOs or interfaces for user settings. Ensure `apiClient` calls are made with appropriately typed data."

*   **`d:\WebDevelopment\stock_management\frontend\src\api\portfolioService.ts`**
    *   Prompt: "Review `api/portfolioService.ts`. Replace `any` in function parameters and return types with specific DTOs or interfaces for portfolio data (e.g., `Portfolio`, `Transaction`, `Holding`). Ensure `apiClient` calls are made with appropriately typed data."

*   **`d:\WebDevelopment\stock_management\frontend\src\api\marketEventService.ts`**
    *   Prompt: "Review `api/marketEventService.ts`. Replace `any` in function parameters and return types with specific DTOs or interfaces for market event data. Ensure `apiClient` calls are made with appropriately typed data."

*   **Other files (General Prompt based on previous `grep_search`)**
    *   Prompt: "Perform a workspace-wide search for `any` and `as any` in the `frontend/src` directory. For each identified instance, create or use existing specific types/interfaces. This includes state variables, props, function arguments, return values, and generic type parameters."

## 2. Test Coverage

**Goal:** Ensure robust test coverage for components, services, and utilities.

*   Prompt: "Review the current test coverage for the frontend. Identify key components (e.g., `Navigation.tsx`, `Home.tsx`, `MarketOverview.tsx`, `TopPerformingStocks.tsx`), services (e.g., `stockService.ts`, `authApi.ts`), and context providers (`AuthContext.tsx`) that lack tests. Write unit and integration tests for these using a testing framework like Jest and React Testing Library."
*   Prompt: "Establish a policy or reminder to create tests for all new features and bug fixes, aiming for high test coverage as per `copilot-instructions.md`."

## 3. Accessibility (A11y)

**Goal:** Ensure the application is accessible to all users.

*   Prompt: "Conduct an accessibility review of the frontend components, particularly interactive elements and data displays (e.g., `StocksTable.tsx`, `Navigation.tsx`, forms). Ensure:
    *   Semantic HTML is used correctly.
    *   All interactive elements are keyboard accessible.
    *   ARIA attributes are used appropriately where needed.
    *   Sufficient color contrast is maintained.
    *   Images have appropriate alt text.
    *   Form elements have labels."

## 4. Codebase Maintainability

*   **File Length & Organization:**
    *   Prompt: "Review all files in `frontend/src`. Ensure no file significantly exceeds 300 lines. If any do, refactor them by splitting into smaller, logical modules or components. Confirm shared types are in `entities/` and helpers in `utils/`."

*   **Comments and Readability:**
    *   Prompt: "Review the codebase for clarity. Ensure complex logic is well-commented, and code is generally simple and readable. Add or improve comments where necessary."

*   **Linters and Formatters:**
    *   Prompt: "Verify that linters (e.g., ESLint) and formatters (e.g., Prettier) are configured and consistently used across the frontend project to maintain code style and catch potential issues."

## 5. Configuration Management

*   Prompt: "Ensure all configurable values (e.g., feature flags, UI settings, non-sensitive keys beyond `VITE_API_URL`) are managed through environment variables (`import.meta.env.VITE_*`) or a dedicated configuration file, rather than being hardcoded."

## 6. Security (Frontend Perspective)

*   **Input Sanitization (Display):**
    *   Prompt: "If the application displays user-generated content or data from external sources that might not be sanitized on the backend, ensure that this data is properly sanitized on the frontend before rendering to prevent XSS attacks (e.g., when using `dangerouslySetInnerHTML` or similar)."

