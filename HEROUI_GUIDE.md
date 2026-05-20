# HeroUI Components Guide

Quick reference for common HeroUI components used in TruckTrack.

## Installation

HeroUI is already configured in the project. It's installed in `package.json` and configured in `tailwind.config.ts`.

## Common Components

### Button

```tsx
import { Button } from "@heroui/react"

// Basic button
<Button>Click me</Button>

// With color
<Button color="primary">Primary</Button>
<Button color="success">Success</Button>
<Button color="danger">Danger</Button>

// With variant
<Button variant="solid">Solid</Button>
<Button variant="bordered">Bordered</Button>
<Button variant="flat">Flat</Button>
<Button variant="light">Light</Button>

// Icon button
<Button isIconOnly color="danger">
  <Trash2 size={18} />
</Button>

// Loading state
<Button isLoading>Loading...</Button>

// As Link
<Button as={Link} href="/page">Navigate</Button>

// Disabled
<Button isDisabled>Disabled</Button>
```

### Input

```tsx
import { Input } from "@heroui/react"

// Basic input
<Input label="Name" />

// With type
<Input type="email" label="Email" />
<Input type="date" label="Date" />
<Input type="number" label="Amount" step="0.01" />

// With placeholder
<Input placeholder="Enter text..." />

// Required
<Input required />

// Clearable
<Input isClearable />

// Disabled
<Input isDisabled />
```

### Modal

```tsx
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button 
} from "@heroui/react"
import { useState } from "react"

const [isOpen, setIsOpen] = useState(false)

<Modal isOpen={isOpen} onOpenChange={setIsOpen}>
  <ModalContent>
    <ModalHeader>Modal Title</ModalHeader>
    <ModalBody>
      Content here
    </ModalBody>
    <ModalFooter>
      <Button color="default" onPress={() => setIsOpen(false)}>
        Close
      </Button>
      <Button color="primary" onPress={handleSubmit}>
        Confirm
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

### Table

```tsx
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react"

<Table>
  <TableHeader>
    <TableColumn>Name</TableColumn>
    <TableColumn>Email</TableColumn>
    <TableColumn>Status</TableColumn>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
        <TableCell>{item.status}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Card

```tsx
import { Card, CardBody, CardHeader } from "@heroui/react"

<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>
```

### Select / Dropdown

```tsx
import { Select, SelectItem } from "@heroui/react"

<Select label="Choose option">
  <SelectItem key="option1" value="option1">Option 1</SelectItem>
  <SelectItem key="option2" value="option2">Option 2</SelectItem>
</Select>
```

### Chip / Badge

```tsx
import { Chip } from "@heroui/react"

<Chip>Label</Chip>
<Chip color="success">Active</Chip>
<Chip color="danger" variant="flat">Inactive</Chip>
```

### Pagination

```tsx
import { Pagination } from "@heroui/react"
import { useState } from "react"

const [page, setPage] = useState(1)

<Pagination 
  isCompact
  showControls
  color="primary"
  page={page}
  total={10}
  onChange={setPage}
/>
```

### Spinner / Loading

```tsx
import { Spinner } from "@heroui/react"

<Spinner />
<Spinner color="success" />
```

### Tooltip

```tsx
import { Tooltip } from "@heroui/react"

<Tooltip content="Help text">
  <Button>Hover me</Button>
</Tooltip>
```

## Component Props

### Colors
- `primary`
- `secondary`
- `success`
- `warning`
- `danger`
- `default`

### Variants
- `solid` - Filled button
- `bordered` - Outlined button
- `flat` - Flat button
- `light` - Light button
- `shadow` - Shadow button
- `faded` - Faded button

### Sizes
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large

## Styling with Tailwind

Since HeroUI is built on Tailwind CSS, you can combine HeroUI components with Tailwind classes:

```tsx
<Button className="w-full max-w-sm">
  Full width button
</Button>

<div className="flex gap-4 items-center">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</div>
```

## Dark Mode

HeroUI automatically respects the theme from `next-themes`. The app already has dark mode support configured.

## Accessibility

HeroUI components are built with accessibility in mind:
- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

## Custom Theme

To customize HeroUI theme, modify `tailwind.config.ts`:

```ts
const { heroui } = require("@heroui/react");

module.exports = {
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: "#0070f3",
          },
        },
        dark: {
          colors: {
            primary: "#0070f3",
          },
        },
      },
    }),
  ],
};
```

## Resources

- [HeroUI Documentation](https://heroui.com)
- [Component Examples](https://heroui.com/docs/components)
- [Tailwind CSS Documentation](https://tailwindcss.com)

## Migration Notes

Previously, this project used Joy UI. Key differences:

| Joy UI | HeroUI |
|--------|--------|
| `sx={{}}` | Tailwind classes |
| `variant="solid"` | `variant="solid"` |
| `color="primary"` | `color="primary"` |
| `open` prop | `isOpen` prop |
| `onClose` | `onOpenChange` |
| `loading` prop | `isLoading` prop |
| `onClick` | `onPress` |
| `disabled` | `isDisabled` |

## Tips

1. **Use Tailwind for layout**: Use Tailwind CSS classes for spacing, layout, and positioning
2. **Components for interactions**: Use HeroUI components for interactive elements
3. **Consistency**: Keep design consistent by using the same colors and sizes
4. **Dark mode**: Test components in both light and dark modes
5. **Responsive**: HeroUI components are responsive by default
