# SaaS Design System

A modern, accessible design system for B2B SaaS applications built with React and Tailwind CSS.

## Features

- **WCAG AA Compliant**: All colors meet accessibility standards
- **8-Point Spacing System**: Consistent spacing throughout
- **Mobile-First Typography**: Responsive text scaling
- **Design Tokens**: Centralized design values
- **Component Library**: Reusable base components

## Design System Overview

### Color System

- **Primary**: Deep blue/indigo (#6366f1) with hover (#4f46e5) and active (#4338ca) states
- **Accent**: Teal/emerald (#14b8a6) with hover (#0d9488) state
- **Neutral**: Gray scale from gray-50 to gray-900
- **Semantic Colors**: Background, border, and text color tokens

### Typography

- **Font Family**: System-friendly sans-serif stack
- **Hierarchy**: 
  - H1: Hero text (3rem/48px)
  - H2: Section headers (2rem/32px)
  - Body: Readable content (1rem/16px)
- **Line Heights**: Optimized for readability

### Spacing

- 8-point grid system (4px, 8px, 12px, 16px, etc.)
- Consistent vertical rhythm
- Section padding: 48px (mobile) → 64px (default) → 96px (large)

### Layout

- Max content width: 1100px (standard) / 1200px (wide)
- Responsive container with padding
- Section components for consistent spacing

## Components

### Button
- Variants: `primary`, `secondary`, `ghost`
- Sizes: `sm`, `md`, `lg`
- States: hover, active, disabled

### Card
- Elevated surface with shadow
- Padding variants: `none`, `sm`, `md`, `lg`
- Shadow variants: `none`, `sm`, `default`, `md`, `lg`

### Badge
- Variants: `default`, `primary`, `accent`, `success`, `warning`, `error`
- Sizes: `sm`, `md`, `lg`

### Container
- Max width constraints
- Responsive padding
- Centered content

### Section
- Consistent vertical rhythm
- Background variants
- Responsive padding

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Usage

```jsx
import { Button, Card, Badge, Container, Section } from './design-system';

function MyComponent() {
  return (
    <Section>
      <Container>
        <Card>
          <h2>Hello World</h2>
          <Button variant="primary">Click Me</Button>
          <Badge variant="accent">New</Badge>
        </Card>
      </Container>
    </Section>
  );
}
```

## Design Tokens

All design tokens are exported from `src/design-system/tokens.js`:

- `colors`: Color palette and semantic colors
- `typography`: Font sizes, weights, line heights
- `spacing`: 8-point spacing scale
- `layout`: Max widths and section padding
- `borderRadius`: Border radius values
- `shadows`: Shadow definitions
- `transitions`: Transition timings

## Tailwind CSS Integration

The design system is built on Tailwind CSS with custom configuration:

- Custom color palette in `tailwind.config.js`
- Typography scale with mobile-first approach
- 8-point spacing system
- Custom utilities for design tokens

All Tailwind classes are safe to use and won't break existing styles.
