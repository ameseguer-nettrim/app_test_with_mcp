# Testing Documentation

This document provides information about the test suite for the Family Expense Tracker application.

## Overview

The project includes comprehensive unit and integration tests for both backend and frontend:

- **Backend**: Jest for Node.js/Express API testing
- **Frontend**: Vitest for Vue 3 component and view testing
- **Coverage Target**: 80% across all metrics (lines, functions, branches, statements)

## Backend Tests (Jest)

### Setup

```bash
cd backend
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

```
backend/src/__tests__/
├── setup.ts                    # Test configuration and mocks
├── unit/
│   └── controllers/
│       ├── environmentController.test.ts
│       ├── expenseController.test.ts
│       └── personController.test.ts
└── integration/
    └── api.test.ts             # End-to-end API flow tests
```

### What's Tested

#### Unit Tests
- **Environment Controller**: Create, read, update environments; manage environment members
- **Expense Controller**: CRUD operations, expense computing, Excel generation
- **Person Controller**: Fetch people, filter by environment

#### Integration Tests
- Complete workflow: Create environment → Add expenses → Compute
- Cross-controller operations
- Access control enforcement

### Mocking Strategy

- **Database**: All database queries are mocked using Jest
- **External Libraries**: ExcelJS, filesystem operations are mocked
- **No real database**: Tests use mocked connections and queries

### Coverage Reports

After running `npm run test:coverage`, view the report:
- **Terminal**: Summary displayed in console
- **HTML Report**: `backend/coverage/index.html`

## Frontend Tests (Vitest)

### Setup

```bash
cd frontend
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

```
frontend/src/__tests__/
├── setup.ts                    # Test configuration and global mocks
├── components/
│   ├── NavBar.test.ts
│   ├── EnvironmentSelector.test.ts
│   ├── AddExpenseForm.test.ts
│   └── ExpenseList.test.ts
├── views/
│   ├── LoginView.test.ts
│   ├── RegisterView.test.ts
│   ├── DashboardView.test.ts
│   └── HistoryView.test.ts
└── services/
    ├── authService.test.ts
    └── expenseService.test.ts
```

### What's Tested

#### Components
- **NavBar**: Navigation, logout functionality, active route highlighting
- **EnvironmentSelector**: Display environments, switch between them, create new ones
- **AddExpenseForm**: Form validation, expense creation, error handling
- **ExpenseList**: Display expenses, delete functionality, compute and export

#### Views
- **LoginView**: Form rendering, login flow, error messages
- **RegisterView**: Form validation, registration flow, password matching
- **DashboardView**: Component integration, expense loading
- **HistoryView**: Computed expenses display, grouping, totals

#### Services
- **AuthService**: Login, register, token management, localStorage operations
- **ExpenseService**: CRUD operations, compute expenses, API calls

### Mocking Strategy

- **API Calls**: All API calls mocked using `vi.mock()`
- **Stores**: Pinia stores mocked for isolated component testing
- **Router**: Vue Router mocked with memory history
- **LocalStorage**: Mocked for consistent testing environment

### Coverage Reports

After running `npm run test:coverage`, view the report:
- **Terminal**: Summary displayed in console
- **HTML Report**: `frontend/coverage/index.html`

## Coverage Thresholds

Both backend and frontend are configured with 80% coverage thresholds:

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

Tests will fail if coverage drops below these thresholds.

## Writing New Tests

### Backend (Jest)

```typescript
import { Request, Response } from 'express';
import { yourController } from '../../../controllers/yourController';
import db from '../../../config/database';

jest.mock('../../../config/database');

const mockQuery = db.query as jest.MockedFunction<typeof db.query>;

describe('Your Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // Setup mocks
  });

  it('should do something', async () => {
    // Your test
  });
});
```

### Frontend (Vitest)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import YourComponent from '@/components/YourComponent.vue';

vi.mock('@/services/yourService');

describe('YourComponent', () => {
  it('should render correctly', () => {
    const wrapper = mount(YourComponent, {
      props: { /* your props */ }
    });
    
    expect(wrapper.text()).toContain('Expected text');
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on others
2. **Clarity**: Test names should clearly describe what is being tested
3. **Coverage**: Aim for both happy path and error cases
4. **Mocking**: Mock external dependencies to keep tests fast and reliable
5. **Assertions**: Use specific assertions rather than general ones
6. **Cleanup**: Always clean up after tests (clear mocks, reset state)

## Continuous Testing

For development, use watch mode:

```bash
# Backend
cd backend && npm run test:watch

# Frontend (in another terminal)
cd frontend && npm run test:watch
```

This will re-run tests automatically when you make changes.

## Troubleshooting

### Tests Failing Due to Missing Mocks

If you see errors about modules not being mocked:
1. Add the module to the appropriate mock file
2. Ensure vi.mock() is called before importing the tested module

### Coverage Not Meeting Threshold

1. Run coverage report to see which files/lines are missing
2. Add tests for uncovered code paths
3. Focus on error handling and edge cases

### Frontend Tests Failing in CI

Ensure all required dependencies are installed:
```bash
npm install --save-dev jsdom @vue/test-utils vitest
```

## Future Enhancements

- E2E tests with Playwright/Cypress
- Visual regression tests
- Performance tests
- API contract tests
- Mutation testing for test quality
