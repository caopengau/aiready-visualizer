# Contributing to @aiready/components

Thank you for your interest in contributing to AIReady Components! We welcome bug reports, feature requests, and code contributions.

## 🎯 What is Components?

The Components package provides **reusable UI components** for building AIReady applications:
- **UI Components**: Button, Card, Input, Label, Badge (shadcn/ui based)
- **D3 Charts**: Interactive visualizations (LineChart, BarChart, ForceGraph)
- **React Hooks**: Utility hooks (useDebounce, useTheme, useD3)
- **Utilities**: ClassName merging, formatters, color schemes

## 🏛️ Architecture

This package follows a modular design with granular exports for tree-shaking:

```
@aiready/components
    │
    ├── button/          # Individual component exports
    ├── card/
    ├── input/
    ├── label/
    ├── badge/
    └── index.ts         # Barrel exports
```

### Design System

- **Based on shadcn/ui**: Accessible, composable components
- **Tailwind CSS**: Utility-first styling
- **Dark Mode**: Built-in theme support
- **TypeScript**: Full type safety

## 🐛 Reporting Issues

Found a bug or have a feature request? [Open an issue](https://github.com/caopengau/aiready-components/issues) with:
- Clear description of the problem or feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Your environment (Node version, OS)

## 🔧 Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/aiready-components
cd aiready-components

# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode
pnpm dev

# Run tests
pnpm test
```

## 📝 Making Changes

1. **Fork the repository** and create a new branch:
   ```bash
   git checkout -b fix/button-props
   # or
   git checkout -b feat/new-component
   ```

2. **Make your changes** following our code style:
   - Use TypeScript strict mode
   - Follow shadcn/ui patterns
   - Add proper ARIA attributes
   - Test accessibility

3. **Test your changes**:
   ```bash
   pnpm build
   pnpm test
   
   # Preview in Storybook (if available)
   pnpm storybook
   ```

4. **Commit using conventional commits**:
   ```bash
   git commit -m "fix: correct button disabled state"
   git commit -m "feat: add new Modal component"
   ```

5. **Push and open a PR**:
   ```bash
   git push origin feat/new-component
   ```

## 📋 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature (new component, component enhancement)
- `fix:` - Bug fix (accessibility, props, styling)
- `docs:` - Documentation updates
- `perf:` - Performance improvements
- `refactor:` - Code restructuring
- `test:` - Test additions/updates
- `style:` - CSS/styling changes

## 🧪 Testing Guidelines

- Add tests for new components
- Test accessibility with screen readers
- Verify responsive behavior
- Test dark/light mode switching

Example test:
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './button';

test('button renders with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

## 🏗️ Architecture

### Directory Structure

```
packages/components/
├── src/
│   ├── button/          # Component directory
│   │   ├── button.tsx  # Component implementation
│   │   ├── button.test.tsx
│   │   └── index.ts     # Barrel export
│   ├── card/
│   ├── input/
│   ├── label/
│   ├── badge/
│   └── index.ts         # Main exports
├── tailwind.config.js   # Tailwind configuration
├── tsup.config.ts       # Build configuration
└── package.json
```

### Adding a New Component

1. Create directory `src/your-component/`:
   ```bash
   mkdir -p src/your-component
   ```

2. Create component file `src/your-component/your-component.tsx`:
   ```typescript
   import * as React from 'react';
   
   export interface YourComponentProps {
     children?: React.ReactNode;
     variant?: 'default' | 'secondary';
   }
   
   export function YourComponent({ children, variant = 'default' }: YourComponentProps) {
     return (
       <div className={cn('base-classes', variant === 'secondary' && 'secondary-classes')}>
         {children}
       </div>
     );
   }
   ```

3. Create index export `src/your-component/index.ts`:
   ```typescript
   export { YourComponent } from './your-component';
   export type { YourComponentProps } from './your-component';
   ```

4. Add to main export in `src/index.ts`

5. Add to Tailwind config if needed

6. Add tests

## 🎯 Areas for Contribution

Great places to start:
- **New UI components**: Modal, Dropdown, Tabs, Tooltip
- **Form components**: Select, Checkbox, Radio, Switch
- **D3 Charts**: LineChart, BarChart, ScatterPlot
- **React hooks**: useDebounce, useLocalStorage, useTheme
- **Utilities**: Formatters, color schemes
- **Accessibility**: ARIA improvements

## 🎨 Design Guidelines

- Follow [shadcn/ui](https://ui.shadcn.com/) patterns
- Use CSS variables for theming
- Support dark/light modes
- Ensure keyboard navigation
- Include proper ARIA attributes
- Test with screen readers

## 🔍 Code Review

- All checks must pass (build, tests, lint)
- Maintainers review within 2 business days
- Address feedback and update PR
- Once approved, we'll merge and publish

## 📚 Documentation

- Update README.md for new components
- Add usage examples
- Document props and variants
- Include accessibility notes

## 💡 Feature Ideas

Looking for inspiration? Consider:
- Data table component
- Date picker
- Charts (Area, Pie, Radar)
- Drag and drop
- Rich text editor
- File upload

## ❓ Questions?

Open an issue or reach out to the maintainers. We're here to help!

---

**Thank you for helping build beautiful, accessible UI!** 💙
