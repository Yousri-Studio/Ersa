# Workflow Diagrams

This document contains visual representations of key workflows in the Ersa Training Admin Dashboard.

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database
    
    U->>F: Enters credentials
    F->>B: POST /api/auth/login
    B->>D: Validate credentials
    D-->>B: User data
    B->>B: Generate JWT tokens
    B-->>F: Return tokens
    F->>F: Store tokens in secure HTTP-only cookies
    F-->>U: Redirect to dashboard
    
    loop Session Management
        F->>B: Request with JWT
        B->>B: Verify token & check permissions
        B-->>F: Return requested data
    end
```

## Content Management Workflow

```mermaid
graph TD
    A[Admin Logs In] --> B[Access Content Management]
    B --> C{Content Type?}
    
    C -->|Page Content| D[Select Page]
    C -->|Section Content| E[Select Section]
    
    D --> F[View/Edit Bilingual Content]
    E --> F
    
    F --> G[Make Changes]
    G --> H[Preview Changes]
    H --> I{Save Changes?}
    
    I -->|Yes| J[Save to Database]
    I -->|No| K[Discard Changes]
    
    J --> L[Show Success Message]
    K --> M[Return to List]
    
    L --> M
```

## User Management Workflow

```mermaid
stateDiagram-v2
    [*] --> UserList
    
    state UserList {
        [*] --> ViewUsers
        ViewUsers --> AddUser
        ViewUsers --> EditUser
        ViewUsers --> ViewUserDetails
    }
    
    state AddUser {
        [*] --> FillUserForm
        FillUserForm --> SubmitForm
        SubmitForm --> ValidateData
        ValidateData -->|Success| SaveUser
        ValidateData -->|Error| ShowErrors
        SaveUser --> UserList
        ShowErrors --> FillUserForm
    }
    
    state EditUser {
        [*] --> LoadUserData
        LoadUserData --> UpdateForm
        UpdateForm --> SubmitUpdate
        SubmitUpdate --> ValidateUpdate
        ValidateUpdate -->|Success| SaveChanges
        ValidateUpdate -->|Error| ShowUpdateErrors
        SaveChanges --> UserList
        ShowUpdateErrors --> UpdateForm
    }
    
    state ViewUserDetails {
        [*] --> ShowUserInfo
        ShowUserInfo --> EditUser
        ShowUserInfo --> BackToList
        BackToList --> UserList
    }
```

## Order Processing Workflow

```mermaid
gantt
    title Order Processing Timeline
    dateFormat  YYYY-MM-DD HH:mm
    axisFormat %m/%d %H:%M
    
    section Order Received
    Payment Verification     :done,    des1, 2025-09-19T10:00, 15m
    Order Validation        :active,  des2, after des1, 30m
    
    section Fulfillment
    Process Order           :         des3, after des2, 2h
    Generate Invoice        :         des4, after des3, 30m
    
    section Delivery
    Send Confirmation Email :         des5, after des4, 15m
    Update Order Status     :         des6, after des5, 15m
```

## Content Publishing Workflow

```mermaid
flowchart LR
    A[Draft] -->|Submit for Review| B(Review Pending)
    B -->|Approve| C[Approved]
    B -->|Reject| A
    C -->|Publish| D((Published))
    D -->|Update| A
    
    style A fill:#e1f5fe,stroke:#01579b
    style B fill:#fffde7,stroke:#f57f17
    style C fill:#e8f5e9,stroke#2e7d32
    style D fill:#e8f5e9,stroke#2e7d32,stroke-width:2px
```

## System Architecture

```mermaid
C4Context
    title System Architecture
    
    Person(admin, "Admin User", "Manages platform content and users")
    
    System_Boundary(ersa, "Ersa Training Platform") {
        Container(frontend, "Frontend", "Next.js 15", "Responsive admin dashboard with SSR/SSG")
        Container(api, "Backend API", "ASP.NET Core 8", "RESTful API endpoints")
        Container(auth, "Auth Service", "JWT", "Handles authentication & authorization")
        Container(db, "Database", "SQL Server", "Stores application data")
        Container(storage, "Storage", "Azure Blob", "Stores files and media")
    }
    
    Rel(admin, frontend, "Uses", "HTTPS")
    Rel(frontend, api, "API Calls", "HTTPS/JSON")
    Rel(api, auth, "Validates", "JWT")
    Rel(api, db, "Reads/Writes", "SQL")
    Rel(api, storage, "Uploads/Downloads", "REST API")
    
    UpdateLayoutConfig($c4ShapeInRow="4", $c4BoundaryInRow="1")
```

## How to Use These Diagrams

1. **Mermaid Support**: These diagrams use Mermaid.js syntax which is supported by most modern markdown viewers including GitHub, GitLab, and VS Code with the Mermaid extension.

2. **Editing**: To modify a diagram, edit the Mermaid code between the ```mermaid code fences.

3. **Exporting**: To export as an image:
   - In VS Code: Use the Mermaid extension to export as PNG/SVG
   - Online: Use the [Mermaid Live Editor](https://mermaid.live/)

4. **Adding New Diagrams**:
   - Follow the existing patterns
   - Keep diagrams focused on a single workflow
   - Include a title and brief description
   - Use consistent styling and colors
