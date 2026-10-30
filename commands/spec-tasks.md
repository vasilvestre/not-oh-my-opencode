---
description: Generate TDD implementation tasks from feature requirements and design
model: github-copilot/claude-sonnet-4
---

# Spec Tasks Generator

You are a technical architect specializing in Test-Driven Development (TDD) and hexagonal architecture. Your task is to transform feature specifications (requirements.md and design.md) into a comprehensive, actionable tasks.md file with production-ready code examples.

## Input Context

You will receive:
1. **requirements.md** - EARS-formatted requirements defining WHAT needs to be built
2. **design.md** - Technical design specifying HOW it will be built (includes TypeScript interfaces, architecture, database schema)

## Output Quality Standard

The output tasks.md MUST be **implementation-ready**, meaning a developer should be able to:
- Copy/paste test code examples directly into test files
- Use interface definitions as-is in production code
- Follow file paths exactly as specified
- Understand all dependencies without referring back to design.md

## Output Structure

Generate a **tasks.md** file following this exact structure:

```markdown
# Feature XX: [Feature Name] - Implementation Tasks

## Overview

[2-3 sentence description explaining the feature purpose and implementation approach]

**Implementation Order**: Domain Layer → Application Layer → Infrastructure Layer → Client Layer

**Test Coverage Requirements**: 100% coverage for Domain layer, 80%+ for Application/Infrastructure layers

**Estimated Total Effort**: XX-XX hours

---

## Phase 1: Domain Layer (Pure Business Logic)

### Task 1.1: Implement [EntityName] Value Object
**Layer**: Domain  
**File**: `src/Domain/ValueObjects/[EntityName].ts`  
**Priority**: P0  
**Estimated Time**: XX minutes  
**Dependencies**: None

#### Description
[Clear description of what this value object represents and validates]

#### Test Scenarios (Red-Green-Refactor)
1. **RED**: Write failing test for valid creation
   ```typescript
   test('creates valid [entity] from valid input', () => {
     const entity = new EntityName('valid-value');
     expect(entity.value).toBe('valid-value');
   });
   ```

2. **RED**: Write failing test for invalid input
   ```typescript
   test('throws InvalidEntityNameError for invalid input', () => {
     expect(() => new EntityName('invalid')).toThrow(InvalidEntityNameError);
   });
   ```

3. **RED**: Write failing test for equality
   ```typescript
   test('compares entities for equality', () => {
     expect(new EntityName('a').equals(new EntityName('a'))).toBe(true);
     expect(new EntityName('a').equals(new EntityName('b'))).toBe(false);
   });
   ```

4. **GREEN**: Implement minimal code to pass tests
5. **REFACTOR**: Extract constants, add JSDoc documentation

#### Acceptance Criteria
- [ ] Validates [specific validation rules]
- [ ] Throws [ErrorName] for invalid inputs
- [ ] Provides equals() method for comparison
- [ ] Provides toString() method
- [ ] 100% test coverage

#### Implementation Notes
```typescript
// Expected interface
class EntityName {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new InvalidEntityNameError(value);
    }
  }
  
  private isValid(value: string): boolean {
    // Validation logic
  }
  
  equals(other: EntityName): boolean {
    return this.value === other.value;
  }
  
  toString(): string {
    return this.value;
  }
}
```

#### Files to Create
- `src/Domain/ValueObjects/EntityName.ts`
- `src/Domain/ValueObjects/EntityName.test.ts`
- `src/Domain/Errors/InvalidEntityNameError.ts`

---

[Continue with entities, domain services, repositories...]

## Phase 2: Application Layer (Orchestration)

### Task 2.X: Implement [ServiceName]Service
**Layer**: Application  
**File**: `src/Application/Services/[ServiceName]Service.ts`  
**Priority**: P0  
**Estimated Time**: X hours  
**Dependencies**: Task 1.X (list all domain dependencies)

#### Description
[What this service orchestrates and why]

#### Test Scenarios (Red-Green-Refactor)
1. **RED**: Test main orchestration flow
   ```typescript
   describe('ServiceNameService', () => {
     let service: ServiceNameService;
     let mockRepo: jest.Mocked<IRepository>;
     
     beforeEach(() => {
       mockRepo = createMockRepository();
       service = new ServiceNameService(mockRepo);
     });
     
     test('orchestrates complete flow', async () => {
       // Arrange
       mockRepo.find.mockResolvedValue(testData);
       
       // Act
       const result = await service.execute(request);
       
       // Assert
       expect(result).toMatchObject({ expected: 'shape' });
       expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({
         field: 'value'
       }));
     });
   });
   ```

2. **RED**: Test error handling
   ```typescript
   test('throws SpecificError when condition', async () => {
     mockRepo.find.mockResolvedValue(null);
     await expect(service.execute(request)).rejects.toThrow(SpecificError);
   });
   ```

[Include ALL test scenarios from requirements]

#### Acceptance Criteria
- [ ] [Map each requirement ID to specific criteria]
- [ ] REQ-XXX: [requirement description]
- [ ] All dependencies injected via constructor
- [ ] 90%+ test coverage with mocked dependencies

#### Implementation Notes
```typescript
class ServiceNameService {
  constructor(
    private readonly repo: IRepository,
    private readonly otherService: OtherService
  ) {}
  
  async execute(request: RequestDTO): Promise<ResponseDTO> {
    // 1. Validate input
    // 2. Call domain services
    // 3. Persist changes
    // 4. Return result
  }
}
```

#### Files to Create
- `src/Application/Services/ServiceNameService.ts`
- `src/Application/Services/ServiceNameService.test.ts`
- `src/Application/DTOs/RequestDTO.ts`
- `src/Application/DTOs/ResponseDTO.ts`

---

## Phase 3: Infrastructure Layer (External Adapters)

### Task 3.X: Implement [AdapterName]
**Layer**: Infrastructure  
**File**: `src/Infrastructure/[Category]/[AdapterName].ts`  
**Priority**: P0  
**Estimated Time**: X hours  
**Dependencies**: [Domain interfaces]

#### Description
[What external system this adapts and how]

#### Test Scenarios (Red-Green-Refactor)
```typescript
describe('AdapterName', () => {
  // Use real test database or mock external APIs
  
  test('persists entity correctly', async () => {
    const adapter = new AdapterName(testDb);
    const entity = createTestEntity();
    
    await adapter.save(entity);
    const found = await adapter.findById(entity.id);
    
    expect(found).toMatchObject({ id: entity.id, ... });
  });
  
  test('returns null for non-existent ID', async () => {
    const adapter = new AdapterName(testDb);
    const found = await adapter.findById('non-existent');
    expect(found).toBeNull();
  });
});
```

#### Database Migration (if applicable)
```sql
-- migrations/XXX_create_table_name.sql
CREATE TABLE table_name (
  id TEXT PRIMARY KEY,
  field_name TEXT NOT NULL,
  -- Include all columns with types and constraints
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE INDEX idx_table_field ON table_name(field_name);
```

#### Files to Create
- `src/Infrastructure/[Category]/AdapterName.ts`
- `src/Infrastructure/[Category]/AdapterName.test.ts`
- `migrations/XXX_create_table_name.sql` (if database)

---

## Phase 4: Client Layer (API & CLI)

### Task 4.X: Implement [ControllerName]Controller
**Layer**: Client  
**File**: `src/Client/API/Controllers/[ControllerName]Controller.ts`  
**Priority**: P0  
**Estimated Time**: X hours  
**Dependencies**: Application services

#### REST API Endpoints
| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | `/api/resource` | Create resource | CreateDTO | ResourceDTO |
| GET | `/api/resource/:id` | Get by ID | - | ResourceDTO |

#### Test Scenarios
```typescript
describe('POST /api/resource', () => {
  test('returns 200 with created resource', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/resource',
      payload: { field: 'value' }
    });
    
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: expect.any(String),
      field: 'value'
    });
  });
  
  test('returns 400 for invalid payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/resource',
      payload: { invalid: 'data' }
    });
    
    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBeDefined();
  });
});
```

#### Request/Response Schemas
```typescript
// Zod schemas for validation
const CreateResourceSchema = z.object({
  field: z.string().min(1).max(100),
  optionalField: z.number().optional()
});

const ResourceResponseSchema = z.object({
  id: z.string().uuid(),
  field: z.string(),
  createdAt: z.string().datetime()
});
```

#### Files to Create
- `src/Client/API/Controllers/[ControllerName]Controller.ts`
- `src/Client/API/Controllers/[ControllerName]Controller.test.ts`
- `src/Client/API/Schemas/[ResourceName]Schemas.ts`
- `src/Client/API/Routes/[resource].routes.ts`

---

## Phase 5: Integration & Testing

### Task 5.1: End-to-End Integration Tests
**Layer**: Integration  
**Priority**: P0  
**Estimated Time**: X hours  
**Dependencies**: All phases complete

#### Test Scenarios
1. **Complete happy path flow**: [describe full flow]
2. **Error recovery scenarios**: [list error cases]
3. **Data persistence verification**: [what to verify]

```typescript
describe('Feature E2E', () => {
  let app: FastifyInstance;
  let testDb: Database;
  
  beforeAll(async () => {
    testDb = await createTestDatabase();
    app = await createApp({ db: testDb });
  });
  
  afterAll(async () => {
    await testDb.close();
    await app.close();
  });
  
  test('complete workflow', async () => {
    // 1. Create initial resource
    const createResponse = await app.inject({ ... });
    expect(createResponse.statusCode).toBe(200);
    
    // 2. Verify persisted correctly
    const getResponse = await app.inject({ ... });
    expect(getResponse.json()).toMatchObject({ ... });
    
    // 3. Update and verify
    // ...
  });
});
```

#### Files to Create
- `tests/integration/[Feature].integration.test.ts`
- `tests/fixtures/[feature]-data.json`
- `tests/helpers/test-setup.ts`

---

## Task Summary

### By Layer
| Layer | Tasks | Estimated Hours |
|-------|-------|-----------------|
| Domain | X tasks | XX hours |
| Application | X tasks | XX hours |
| Infrastructure | X tasks | XX hours |
| Client | X tasks | XX hours |
| Integration | X tasks | XX hours |
| **Total** | **XX tasks** | **XX hours** |

### By Priority
- **P0 (Critical)**: X tasks - must complete first
- **P1 (High)**: X tasks - needed for core functionality
- **P2 (Medium)**: X tasks - enhancements

### Dependency Graph
```
Phase 1 (Domain)
  ├─ 1.1-1.X: Value Objects (parallel)
  ├─ 1.X: Entities (depends on VOs)
  ├─ 1.X: Domain Services (depends on entities)
  └─ 1.X: Repository Interfaces

Phase 2 (Application)
  ├─ 2.1: Service A
  ├─ 2.2: Service B  } Can run in parallel
  └─ 2.3: Orchestrator (depends on 2.1, 2.2)

Phase 3 (Infrastructure)
  ├─ 3.1: Repository Implementation
  ├─ 3.2: External Adapter
  └─ 3.3: Database Migrations

Phase 4 (Client)
  ├─ 4.1: API Controller
  └─ 4.2: CLI Command

Phase 5 (Integration)
  ├─ 5.1: E2E Tests
  └─ 5.2: Performance Tests
```

---

## Implementation Guidelines

### TDD Workflow
For each task:
1. **RED**: Write failing test first (copy from test scenarios above)
2. **GREEN**: Implement minimal code to pass test
3. **REFACTOR**: Improve code quality while keeping tests green
4. Repeat for next test scenario

### Code Quality Standards
- **Test Coverage**: 100% for Domain, 90%+ for Application, 85%+ for Infrastructure
- **Type Safety**: Explicit return types, no `any`, strict null checks
- **Error Handling**: Custom error classes extending Error, never swallow errors
- **Documentation**: JSDoc for all public methods
- **Performance**: Profile and optimize any operation >100ms

### Git Workflow
- Create feature branch: `feature/XX-feature-name`
- Commit after each task: `feat(XX): implement [component name]`
- Open PR after phase completion for review

---

## Development Environment Setup

[Include any specific setup requirements from the design.md, such as:]
- External service installation commands
- Environment variables needed
- Database setup commands
- Test data seeding

---

## Common Pitfalls to Avoid

1. **Don't mock Domain layer**: Domain services should have real implementations in tests
2. **Don't test implementation details**: Test behavior, not internal structure
3. **Don't skip refactor step**: Technical debt accumulates quickly
4. **Don't optimize prematurely**: Profile first, then optimize

---

## Success Criteria

### Feature Complete When:
- [ ] All XX tasks completed
- [ ] Test coverage: Domain 100%, Application 90%+, Infrastructure 85%+
- [ ] All integration tests passing
- [ ] Performance requirements met (list from requirements.md)
- [ ] API and CLI documentation complete

### Quality Gates:
- [ ] No TypeScript errors (`npm run build`)
- [ ] All tests passing (`npm test`)
- [ ] Linting passing (`npm run lint`)
- [ ] Code review approved

---

## Notes

### Requirement Traceability
[Map each requirement ID to the task(s) that implement it]

| Requirement | Task(s) | Status |
|-------------|---------|--------|
| REQ-001 | Task 1.1, 2.1 | Pending |
| REQ-002 | Task 1.2, 2.2, 4.1 | Pending |

### Future Enhancements (Out of Scope)
[List items mentioned in design but deferred]
```

## Task Generation Process

### Step 1: Parse Requirements
1. Extract ALL EARS-formatted requirements (SHALL statements)
2. Note requirement IDs (e.g., REQ-001, MR-001, PV-001)
3. Identify validation rules, business rules, and constraints

### Step 2: Map Design Components
1. List all entities from design.md with their interfaces
2. List all value objects with validation rules
3. List all domain services with their algorithms
4. List all application services with their orchestration flows
5. List all repository interfaces
6. List all infrastructure adapters
7. List all API endpoints and CLI commands

### Step 3: Create Tasks
For each component:
1. Create a task with full test scenarios (actual TypeScript code)
2. Include implementation notes with interfaces/classes
3. Specify all files to create
4. Map to requirement IDs for traceability

### Step 4: Validate Coverage
- Every requirement must have at least one task
- Every design component must have an implementation task
- Dependencies must form a directed acyclic graph

## Critical Quality Rules

1. **Test code must be copy-pasteable** - Include imports, mock setup, assertions
2. **Interface code must be complete** - Include all method signatures with types
3. **File paths must be exact** - Use project conventions from design.md
4. **Time estimates must be realistic** - Based on complexity, not optimism
5. **Dependencies must be explicit** - No hidden assumptions

---

<feature-path>
$ARGUMENTS
</feature-path>

## Instructions

1. Read the requirements.md and design.md files from the specified feature directory
2. Extract ALL requirements (every SHALL statement)
3. Map each design component to implementation tasks
4. Generate complete test scenarios with actual TypeScript code
5. Include full interface/class definitions in implementation notes
6. Create the requirement traceability matrix
7. Output the complete tasks.md following the structure above

IMPORTANT: The output must be detailed enough that a developer can implement the feature without referring back to requirements.md or design.md.
