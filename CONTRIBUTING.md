# Squad Flight Finder: Internal Development Guide

**CONFIDENTIAL - Internal Use Only**

This document provides guidelines and instructions for the Squad Flight Finder development team. This is a proprietary commercial product.

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title**: Descriptive summary of the issue
- **Steps to reproduce**: Numbered list of exact steps
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Screenshots**: If applicable
- **Environment**:
  - Browser and version
  - Operating system
  - Node.js version
  - Any relevant console errors

**Bug Report Template:**
```markdown
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots
[If applicable]

## Environment
- Browser: Chrome 120
- OS: macOS 14.2
- Node: 18.17.0
```

### Suggesting Features

We love feature suggestions! Before creating a feature request:

1. Check if the feature is already in the [roadmap](./PROJECT_ROADMAP.md)
2. Search existing feature requests
3. Consider if it aligns with our fairness-first mission

**Feature Request Template:**
```markdown
## Feature Description
[Clear description of the proposed feature]

## Problem It Solves
[What user problem does this address?]

## Proposed Solution
[How would this feature work?]

## Alternatives Considered
[What other approaches did you consider?]

## Additional Context
[Mockups, examples, related features]
```

### Pull Requests

We actively welcome pull requests! Here's how:

1. **Fork the repository** and create a branch from `main`
2. **Make your changes** with clear, focused commits
3. **Add tests** if you're adding functionality
4. **Run the test suite** (`npm test`) and ensure it passes
5. **Run the linter** (`npm run lint`) and fix any issues
6. **Update documentation** if needed
7. **Submit a pull request** with a clear description

**Good PR Checklist:**
- [ ] Clear, descriptive title
- [ ] Description explains what and why
- [ ] Tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] New tests added for new functionality
- [ ] Documentation updated if needed
- [ ] No unrelated changes
- [ ] Commits are logical and well-messaged

## 🏗️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- Amadeus API credentials (free tier)

### Setup Steps

```bash
# 1. Fork and clone your fork
git clone https://github.com/YOUR_USERNAME/squad-flight-finder.git
cd squad-flight-finder

# 2. Add upstream remote
git remote add upstream https://github.com/karterbyrne-bit/squad-flight-finder.git

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp .env.example .env
# Edit .env and add your Amadeus API credentials

# 5. Start development server
npm run dev

# 6. Run tests
npm test
```

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features (coming soon)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `refactor/*` - Code improvements
- `docs/*` - Documentation updates

### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style (formatting, no logic change)
- `refactor:` Code restructuring (no feature/fix)
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**
```bash
feat(search): add multi-city trip support

fix(fairness): correct calculation for groups >5

docs(readme): add installation screenshots

refactor(components): extract TravelerCard component

test(fairness): add edge case for equal prices
```

## 🧪 Testing Guidelines

### Writing Tests

- **Unit tests** for utility functions and calculations
- **Component tests** for UI components
- **Integration tests** for user flows
- **E2E tests** for critical paths (Playwright)

**Test Location:**
- Unit tests: Next to source file or in `/tests/utils/`
- Component tests: `/tests/components/`
- Integration tests: `/tests/integration/`
- E2E tests: `/tests/e2e/`

**Test Naming:**
```javascript
// Good
test('calculates fairness score correctly for 3 travelers', () => {})

// Bad
test('fairness', () => {})
```

### Running Tests

```bash
# Watch mode (development)
npm test

# Run once (CI)
npm run test:run

# With UI
npm run test:ui

# Coverage
npm run test:coverage
```

### Code Coverage

We aim for >80% coverage. Critical paths (fairness calculation, API integration) should have >95% coverage.

## 📋 Code Style

### General Principles

1. **Simplicity**: Simple code is better than clever code
2. **Readability**: Code is read more than written
3. **Consistency**: Follow existing patterns
4. **Comments**: Explain why, not what

### JavaScript/React Guidelines

- Use **functional components** and hooks
- Use **const** by default, **let** when needed, avoid **var**
- Prefer **destructuring** for props and state
- Use **async/await** over promises chains
- Keep components **small and focused** (<200 lines)
- Extract **custom hooks** for reusable logic
- Use **PropTypes** or TypeScript for type checking

**Good Example:**
```javascript
// Good: Clear, focused, documented
function TravelerCard({ traveler, onUpdate, onRemove }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    // Complex logic
    await saveTraveler(traveler);
    setIsEditing(false);
  };

  return (
    <div className="traveler-card">
      {/* ... */}
    </div>
  );
}
```

**Bad Example:**
```javascript
// Bad: Large, unclear, no types
function Card(props) {
  var x = true;
  // 500 lines of mixed concerns
}
```

### Tailwind CSS Guidelines

- Use Tailwind utilities over custom CSS when possible
- Extract repeated patterns to components
- Use semantic class groupings (layout, spacing, colors)
- Prefer responsive utilities (`md:`, `lg:`)

```jsx
// Good: Semantic grouping
<div className="
  flex items-center gap-4
  p-4 rounded-lg
  bg-white shadow-md
  hover:shadow-lg transition-shadow
">

// Bad: Random order
<div className="shadow-md hover:shadow-lg flex bg-white p-4 items-center rounded-lg gap-4 transition-shadow">
```

## 🔍 Code Review Process

### For Contributors

- Be open to feedback and questions
- Respond to review comments promptly
- Don't take feedback personally - it's about the code, not you
- Ask for clarification if feedback is unclear

### For Reviewers

- Be constructive and kind
- Explain the "why" behind suggestions
- Approve if changes are good, even if not perfect
- Focus on correctness, readability, and maintainability

## 📂 Project Structure

Current structure (Phase 1):
```
squad-flight-finder/
├── src/
│   ├── App.jsx           # Main component (will be refactored)
│   ├── App.css           # Styles
│   └── main.jsx          # Entry point
├── tests/                # All tests
├── public/               # Static assets
├── .env.example          # Environment template
└── vite.config.js        # Vite configuration
```

Future structure (Phase 2+):
```
squad-flight-finder/
├── src/
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   ├── services/         # API and business logic
│   ├── utils/            # Utility functions
│   ├── constants/        # App constants
│   ├── types/            # TypeScript types
│   └── App.jsx           # Main app
├── tests/                # Tests mirror src/
└── ...
```

## 🎯 What to Work On

### Good First Issues

Look for issues labeled `good-first-issue`. These are:
- Well-defined and scoped
- Don't require deep codebase knowledge
- Good for learning the project

**Current Good First Issues:**
- Extract `TravelerCard` component
- Add loading skeletons
- Improve error messages
- Add keyboard shortcuts
- Write documentation

### High-Priority Areas

Check [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) for current priorities:

**Phase 1 (Now):**
- Documentation improvements
- Security hardening
- Component extraction
- Error handling

**Phase 2 (Next):**
- Architecture refactoring
- Custom hooks
- TypeScript migration (optional)

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Assume good intentions
- Focus on what's best for the project and community
- Report unacceptable behavior to [maintainer email]

### Communication

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, general discussion
- **Pull Request Comments**: Code-specific discussion
- **Discord** (coming soon): Real-time chat

### Getting Help

Stuck? Here's how to get help:

1. **Check documentation**: README, roadmap, existing issues
2. **Search past issues**: Your question might be answered
3. **Ask in Discussions**: For general questions
4. **Create an issue**: For bugs or feature requests
5. **Tag maintainers**: If urgent (use sparingly)

## 📜 Intellectual Property

All code and contributions are proprietary to Squad Flight Finder. By contributing, team members agree that all work product belongs to the company.

## 🙏 Recognition

Team contributions are recognized through:
- Internal team acknowledgment
- Performance reviews
- Bonus/equity considerations (as applicable)
- Leadership opportunities

---

## Quick Links

- [Project Roadmap](./PROJECT_ROADMAP.md)
- [UAT Test Guide](./UAT_TEST_GUIDE.md)
- [Issue Tracker](https://github.com/karterbyrne-bit/squad-flight-finder/issues)
- [Discussions](https://github.com/karterbyrne-bit/squad-flight-finder/discussions)

---

**Thank you for contributing to Squad Flight Finder! Every contribution, no matter how small, makes a difference. 🙏✈️**
