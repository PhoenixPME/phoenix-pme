# Phase 2: Modular Item Details Components

## Architecture Principles

### 1. Single Responsibility
Each component handles ONE specific task:
- `FormTypeSelector.tsx`: Select item form (coin, round, bar, jewelry, other)
- `PuritySelector.tsx`: Select metal purity/fineness  
- `CertificationInput.tsx`: Handle grading/certification details
- `ImageUploader.tsx`: Upload and manage photos
- `SerialNumberInput.tsx`: Input serial numbers/mint marks

### 2. Self-Contained
- No cross-component dependencies
- Each component manages its own state logic
- Clear props interface: `value` and `onChange`
- Types defined in `phase2.types.ts`

### 3. Consistent Interface
All components follow the same pattern:
```typescript
interface ComponentProps {
  value: ComponentValueType;
  onChange: (value: ComponentValueType) => void;
  // Optional: configuration props
}
```

### 4. Size Limit  
- Each component: < 200 lines
- Focused, readable code
- Easy to test and maintain

## Usage Example

```typescript
// Import what you need
import FormTypeSelector from './phase2/FormTypeSelector';
import PuritySelector from './phase2/PuritySelector';

// Use independently
<FormTypeSelector value={formType} onChange={setFormType} />
<PuritySelector metalType={metalType} value={purity} onChange={setPurity} />
```

## Benefits

1. **Testability**: Each component can be tested in isolation
2. **Reusability**: Use in different parts of the application  
3. **Maintainability**: Fix/update one component without affecting others
4. **Scalability**: Add new components without refactoring existing ones
5. **Type Safety**: Full TypeScript support

## File Structure
```
/components/auctions/forms/phase2/
├── FormTypeSelector.tsx    (78 lines)
├── PuritySelector.tsx      (110 lines)
├── CertificationInput.tsx  (180 lines)
├── ImageUploader.tsx       (170 lines)
├── SerialNumberInput.tsx   (75 lines)
├── Phase2Demo.tsx          (Demo integration)
├── README.md              (This file)
└── types/
    └── phase2.types.ts    (Shared types)
```

Total: 5 components, ~613 lines, all modular and independent.
