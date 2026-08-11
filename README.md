# Fundsroom ERP-CRM Operations Portal

A modern, full-stack Enterprise Resource Planning (ERP) and Customer Relationship Management (CRM) portal built specifically for wholesale and distribution companies. This portal streamlines business-critical workflows including customer lead management, product catalogs, warehouse stock tracking, atomic sales challan processing, payment status tracking, PDF document generation, and cloud-based product image storage via AWS S3.

🌐 **Live Deployment Links:**
- **Live Frontend Web Application (Vercel)**: [https://fundsroom-erp-crm-operations-portal.vercel.app/](https://fundsroom-erp-crm-operations-portal.vercel.app/)
- **Live Backend API Service (Render)**: [https://fundsroom-erp-crm-operations-portal-1.onrender.com](https://fundsroom-erp-crm-operations-portal-1.onrender.com)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Project Objectives](#3-project-objectives)
4. [Key Features](#4-key-features)
5. [User Roles & Permission Matrix](#5-user-roles--permission-matrix)
6. [Role Responsibilities](#6-role-responsibilities)
7. [Technology Stack](#7-technology-stack)
8. [System Architecture](#8-system-architecture)
9. [Complete System Workflow](#9-complete-system-workflow)
10. [Authentication Flow](#10-authentication-flow)
11. [JWT & Role Authorization](#11-jwt--role-authorization)
12. [Customer CRM Module](#12-customer-crm-module)
13. [Product Management Module](#13-product-management-module)
14. [Inventory Management Module](#14-inventory-management-module)
15. [Stock Movement Module](#15-stock-movement-module)
16. [Sales Challan Module](#16-sales-challan-module)
17. [Challan Status Lifecycle](#17-challan-status-lifecycle)
18. [Payment Status Lifecycle](#18-payment-status-lifecycle)
19. [Challan Transaction Logic (Atomic Execution)](#19-challan-transaction-logic-atomic-execution)
20. [Product Snapshot Architecture](#20-product-snapshot-architecture)
21. [Customer Challan Statistics](#21-customer-challan-statistics)
22. [AWS S3 Product Image Integration](#22-aws-s3-product-image-integration)
23. [AWS S3 Environment Variables](#23-aws-s3-environment-variables)
24. [PDF Generation System](#24-pdf-generation-system)
25. [Database Schema & ER Diagram](#25-database-schema--er-diagram)
26. [Database Technology](#26-database-technology)
27. [Master API Table](#27-master-api-table)
28. [Detailed API Documentation](#28-detailed-api-documentation)
    - [Authentication APIs](#authentication-apis)
    - [Customer CRM APIs](#customer-crm-apis)
    - [Product APIs](#product-apis)
    - [Stock & Inventory APIs](#stock--inventory-apis)
    - [Sales Challan APIs](#sales-challan-apis)
    - [Tax Invoice APIs](#tax-invoice-apis)
29. [API Error Handling](#29-api-error-handling)
30. [Environment Variables](#30-environment-variables)
31. [Local Development Setup](#31-local-development-setup)
32. [Demo Accounts & Credentials](#32-demo-accounts--credentials)
33. [Security & Business Rules](#33-security--business-rules)
34. [Known Limitations & Future Improvements](#34-known-limitations--future-improvements)
35. [License](#35-license)

---

## 1. Project Overview

The **Fundsroom ERP-CRM Operations Portal** is an end-to-end management platform engineered to digitize distribution operations. It integrates core CRM functionalities with multi-location inventory controls, automated stock movements, and transactional sales challan workflows.

Designed with a modern single-page frontend (React 19, Vite 8, Tailwind CSS 4) and a high-performance Express 5 REST API backed by PostgreSQL (Prisma 7 ORM), the platform ensures role-segregated access for Administrative, Sales, Warehouse, and Accounts teams.

---

## 2. Problem Statement

Wholesale and distribution enterprises frequently suffer from operational friction caused by fragmented systems:
- **Disjointed Customer Management**: Sales teams track leads and follow-ups in spreadsheets, missing key reorder dates.
- **Stock Discrepancies**: Lack of real-time inventory updates results in overselling products or warehouse stockouts.
- **Challan & Invoicing Delays**: Manual sales challans lead to pricing errors, inventory miscounts, and lost audit trails.
- **Role Interference**: Unrestricted access allows unauthorized staff to alter pricing, inventory, or payment statuses.

The Fundsroom ERP-CRM Portal solves these challenges by providing a unified, role-governed platform that enforces atomic database transactions for inventory changes and maintains accurate product snapshots for historical integrity.

---

## 3. Project Objectives

- **Centralize Customer Relations**: Store customer business records, GST numbers, types, and follow-up schedules.
- **Ensure Accurate Inventory Control**: Monitor minimum stock alerts, current inventory, and log every manual/automated stock movement.
- **Atomic Order Processing**: Guarantee that sales challan confirmation automatically deducts inventory and logs stock-out records in a single database transaction.
- **Role-Based Authorization**: Restrict sensitive operations (such as pricing modifications, stock additions, or payment marks) to designated staff roles.
- **Automate Document Generation**: Produce standardized PDF Sales Challans and Tax Invoices on demand using PDFKit.
- **Cloud Media Assets**: Store product imagery securely in AWS S3 and serve them via short-lived presigned URLs.

---

## 4. Key Features

### 🔐 Authentication & Security
- Secure login using email and password with `bcryptjs` hashing.
- Standardized JSON Web Token (JWT) issuance for authenticated API calls.
- Endpoint-level role authorization middleware (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).

### 👥 Customer CRM
- Complete customer lifecycle tracking (`LEAD`, `ACTIVE`, `INACTIVE`).
- Categorization by customer type (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`).
- Follow-up logging with scheduled follow-up dates and notes.
- Customer-level order summary statistics (total, confirmed, draft, cancelled, paid, unpaid).

### 📦 Product & Inventory Management
- SKU uniqueness enforcement and category organization.
- Stock threshold monitoring (`currentStock` vs `minimumStock`) for low-stock alerts.
- Stock IN and Stock OUT manual adjustments with mandatory reasoning.
- Audited stock movement logs tied to the user who performed the operation.

### 📄 Sales Challan Operations
- Draft creation with multi-product selection and automatic total quantity calculation.
- Auto-generated sequential challan numbers (`CHL-YYYYMMDD-XXXX`).
- Atomic challan confirmation that validates item stock, updates inventory, and creates `OUT` stock movement records.
- Support for draft cancellation and draft editing.

### 💳 Payment & Billing
- Dual-status tracking separating delivery status (`DRAFT`, `CONFIRMED`, `CANCELLED`) from payment status (`UNPAID`, `PAID`).
- One-click payment confirmation (`PATCH /api/challans/:id/paid`).
- Automated PDF document generation for Sales Challans and Tax Invoices with itemized GST breakdowns (CGST 9% + SGST 9%).

### ☁️ AWS S3 File Storage
- Direct image file uploads via `multer` memory storage.
- Storage of product images in AWS S3 buckets.
- Presigned URL generation for secure, temporary image viewing in the frontend.

---

## 5. User Roles & Permission Matrix

The portal defines four primary system roles:
- `ADMIN`: Complete system access to all modules and configurations.
- `SALES`: Customer relationship management, lead follow-ups, and sales challan creation/confirmation.
- `WAREHOUSE`: Product catalog management, warehouse location mapping, and inventory stock movements.
- `ACCOUNTS`: Operational oversight, financial tracking, challan review, payment verification, and PDF invoice generation.

| Feature / Operation | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| **View Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **List / View Customers** | ✅ | ✅ | ❌ | ✅ |
| **Create / Edit / Delete Customers** | ✅ | ✅ | ❌ | ❌ |
| **Add / View Customer Follow-ups** | ✅ | ✅ | ❌ | ✅ (View) |
| **List / View Products** | ✅ | ✅ | ✅ | ✅ |
| **Create / Edit / Delete Products** | ✅ | ❌ | ✅ | ❌ |
| **Upload Product Images (AWS S3)** | ✅ | ❌ | ✅ | ❌ |
| **View Inventory & Movements** | ✅ | ❌ | ✅ | ✅ |
| **Perform Stock IN / Stock OUT** | ✅ | ❌ | ✅ | ❌ |
| **Create / Edit Draft Challans** | ✅ | ✅ | ❌ | ❌ |
| **Confirm / Cancel Challans** | ✅ | ✅ | ❌ | ❌ |
| **Mark Challan Payment as PAID** | ✅ | ✅ | ❌ | ✅ |
| **Generate / Download PDF Challans** | ✅ | ✅ | ❌ | ✅ |
| **Generate / Download PDF Tax Invoices**| ✅ | ✅ | ❌ | ✅ |

---

## 6. Role Responsibilities

- **ADMIN**: Holds global permissions. Can manage customers, products, stock movements, sales orders, and payment records.
- **SALES**: Responsible for customer acquisition and order placement. Creates draft challans, monitors lead follow-ups, confirms orders with clients, and tracks customer order histories.
- **WAREHOUSE**: Responsible for inventory accuracy. Adds new products, updates stock levels via Stock IN / Stock OUT, uploads product images, and monitors low-stock warnings.
- **ACCOUNTS**: Responsible for financial oversight. Reviews confirmed orders, verifies payments, updates payment status to PAID, and exports official PDF Tax Invoices for client billing.

---

## 7. Technology Stack

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js (v5.2)
- **Database**: PostgreSQL (Hosted on Neon DB)
- **ORM**: Prisma (v7.9) with `@prisma/adapter-pg`
- **Authentication**: `jsonwebtoken` (v9.0) & `bcryptjs` (v3.0)
- **File Storage**: AWS SDK for JavaScript v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
- **File Parsing**: `multer` (v1.4)
- **PDF Generation**: `pdfkit` (v0.16)

### Frontend
- **Framework**: React (v19.2)
- **Build Tool**: Vite (v8.2)
- **Language**: TypeScript (v6.0)
- **Router**: React Router DOM (v7.18)
- **Styling**: Tailwind CSS (v4.3)
- **Icons**: Lucide React (`lucide-react`)
- **HTTP Client**: Axios (v1.19)

---

## 8. System Architecture

```mermaid
flowchart TD
    subgraph Client["Client Tier"]
        UI["React 19 Single Page Application"]
        AXIOS["Axios Interceptor Layer (Bearer JWT)"]
        UI --> AXIOS
    end

    subgraph Server["Application Server Tier (Node.js + Express 5)"]
        ROUTER["Express Router Layer"]
        AUTH_MW["JWT Auth Middleware"]
        ROLE_MW["Role Authorization Middleware"]
        VAL_MW["Input Validation Middleware"]

        CONTROLLERS["Controllers Layer"]
        SERVICES["Services Layer"]

        PDF_ENG["PDFKit Document Engine"]
        AWS_UTIL["AWS S3 SDK Manager"]

        ROUTER --> AUTH_MW --> ROLE_MW --> VAL_MW --> CONTROLLERS --> SERVICES
        SERVICES --> PDF_ENG
        SERVICES --> AWS_UTIL
    end

    subgraph Cloud["External Cloud Services"]
        S3["AWS S3 Bucket (Product Images)"]
        AWS_UTIL <-->|"PutObjectCommand / GetObjectCommand (Presigned URL)"| S3
    end

    subgraph Data["Database Tier"]
        PRISMA["Prisma 7 ORM (Adapter PG)"]
        PGDB[("PostgreSQL Database (Neon DB)")]
        SERVICES <--> PRISMA <--> PGDB
    end

    AXIOS <-->|"HTTP Requests / JSON Responses"| ROUTER
```

---

## 9. Complete System Workflow

```
[ User Action ]
       │
       ▼
[ Login Screen ] ──► (POST /api/auth/login) ──► Validates Credentials & Returns JWT
       │
       ▼
[ Protected Layout ] ──► Attaches Bearer Token to Request Headers
       │
       ├──► [ CRM Module ] ─────────► Create Lead ──► Log Follow-up ──► View Customer Stats
       ├──► [ Product Catalog ] ───► Add Product ──► Upload Image to S3 ──► View Presigned URL
       ├──► [ Inventory Control ] ──► Stock IN / Stock OUT ──► Audit Movement Logs
       └──► [ Sales Processing ] ──► Create Draft Challan
                                            │
                                            ▼
                                     Confirm Challan (Atomic Transaction)
                                            │
                                            ├──► Deducts Product Inventory
                                            ├──► Creates OUT Stock Movements
                                            ├──► Sets Status to CONFIRMED
                                            │
                                            ▼
                                     [ Billing / Accounts ]
                                            │
                                            ├──► Mark Payment as PAID
                                            ├──► Download Challan PDF
                                            └──► Download Tax Invoice PDF (GST 18%)
```

---

## 10. Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client User
    participant FE as React Frontend
    participant BE as Express Backend
    participant DB as PostgreSQL (Prisma)

    User->>FE: Enter Email & Password
    FE->>BE: POST /api/auth/login { email, password }
    BE->>DB: prisma.user.findUnique({ email })
    DB-->>BE: Returns User Record
    BE->>BE: bcrypt.compare(password, user.password)
    alt Credentials Valid
        BE->>BE: jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' })
        BE-->>FE: HTTP 200 { success: true, data: { user, token } }
        FE->>FE: Store token in localStorage
        FE-->>User: Redirect to /dashboard
    else Invalid Credentials
        BE-->>FE: HTTP 401 { success: false, message: "Invalid email or password" }
        FE-->>User: Display Error Message
    end
```

---

## 11. JWT & Role Authorization

Every request to protected API routes must include the token in the HTTP `Authorization` header:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Authorization Logic & Status Codes
- **401 Unauthorized**: Issued when the `Authorization` header is missing, malformed, or contains an expired/invalid JWT signature.
- **403 Forbidden**: Issued when the user's token is valid, but their assigned role (e.g., `WAREHOUSE`) is not listed in the route's `authorizeRoles(...)` middleware (e.g., attempting to create a customer).

---

## 12. Customer CRM Module

The Customer CRM module manages client details and tracks sales engagements.

### Data Model Attributes
- `customerName`: Full name of primary contact person.
- `mobile`: Unique contact number.
- `email`: Optional email address.
- `businessName`: Company or store name.
- `gstNumber`: Optional GST Identification Number.
- `customerType`: `RETAIL` | `WHOLESALE` | `DISTRIBUTOR`.
- `address`: Full physical address.
- `status`: Customer status (`LEAD` | `ACTIVE` | `INACTIVE`).
- `followUpDate`: Scheduled date for next interaction.
- `notes`: General client notes.
- `createdBy`: User ID of creator.

---

## 13. Product Management Module

The Product module maintains the centralized product catalog.

### Data Model Attributes
- `productName`: Descriptive title of product.
- `sku`: Unique Stock Keeping Unit identifier.
- `category`: Category string (e.g., *Fasteners*, *Pipes*, *Electrical*).
- `unitPrice`: Base price per unit (Decimal 10, 2).
- `currentStock`: Real-time warehouse quantity available.
- `minimumStock`: Reorder threshold quantity.
- `warehouseLocation`: Physical rack/bay location string (e.g., *Rack A1*).
- `imageUrl`: S3 object key or image path reference.

---

## 14. Inventory Management Module

Inventory is tracked dynamically based on `currentStock` and `minimumStock` thresholds.

### Low-Stock Detection Logic
A product is flagged as **Low Stock** when:
$$\text{currentStock} \le \text{minimumStock}$$

Filter requests (`GET /api/products?lowStock=true`) dynamically evaluate this condition across the product catalog.

---

## 15. Stock Movement Module

Stock movement records maintain an unalterable audit trail for inventory changes.

### Movement Types
- `IN`: Stock added to warehouse (manual receipt, restock).
- `OUT`: Stock removed from warehouse (manual dispatch, confirmed sales challan).

### Attributes Recorded
- `productId`: Foreign key to Product.
- `quantity`: Quantity adjusted.
- `type`: `IN` | `OUT`.
- `reason`: Mandatory text description (e.g., *"Initial stock entry"*, *"Challan CHL-20260811-0001"*).
- `createdBy`: User ID who authorized the adjustment.

---

## 16. Sales Challan Module

Sales Challans represent orders issued to customers.

### Workflow Stages
1. **Draft Generation**: A Sales user selects a customer and line items with requested quantities. The system saves the challan with status `DRAFT` and paymentStatus `UNPAID`.
2. **Product Snapshots**: Item descriptions, SKUs, and unit prices are copied directly into `ChallanItem` rows to lock in historical prices.
3. **Confirmation**: Confirming a challan initiates an atomic stock validation and deduction.

---

## 17. Challan Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Create Challan (No Stock Deducted)
    DRAFT --> CONFIRMED : Confirm Challan (Deducts Stock & Logs OUT Movement)
    DRAFT --> CANCELLED : Cancel Challan (No Stock Impact)
    CONFIRMED --> [*]
    CANCELLED --> [*]
```

- `DRAFT`: Order draft created. Editable. No stock is deducted.
- `CONFIRMED`: Order confirmed. Stock is permanently deducted. Cannot be reverted to draft.
- `CANCELLED`: Order cancelled from draft state. Cannot perform stock deductions.

---

## 18. Payment Status Lifecycle

Payment status is decoupled from order fulfillment status:
- `UNPAID`: Default state upon order creation.
- `PAID`: Updated when payment verification is completed (`PATCH /api/challans/:id/paid`).

```
[ Order Confirmed ] ──► status: CONFIRMED, paymentStatus: UNPAID
                             │
                             ▼
[ Payment Received ] ──► status: CONFIRMED, paymentStatus: PAID
```

---

## 19. Challan Transaction Logic (Atomic Execution)

When a Sales user confirms a draft challan (`PATCH /api/challans/:id/confirm`), the backend executes an **atomic database transaction** (`prisma.$transaction`).

```mermaid
flowchart TD
    START([PATCH /api/challans/:id/confirm]) --> FETCH[Fetch Challan & Items]
    FETCH --> CHK_DRAFT{Is Status DRAFT?}
    CHK_DRAFT -- No --> ERR1[Throw 400: Only draft challans can be confirmed]
    CHK_DRAFT -- Yes --> FETCH_PRODS[Fetch Current Product Stock Levels]

    FETCH_PRODS --> CHK_STOCK{Are all product stocks >= required quantity?}
    CHK_STOCK -- No --> ROLLBACK[ABORT TRANSACTION\nThrow 400: Insufficient Stock]
    
    CHK_STOCK -- Yes --> BEGIN_TX[BEGIN TRANSACTION]
    BEGIN_TX --> DEDUCT[Update Product: currentStock = currentStock - quantity]
    DEDUCT --> RECORD_MOV[Create StockMovement: type = OUT, reason = Challan #]
    RECORD_MOV --> SET_CONFIRMED[Update Challan: status = CONFIRMED]
    SET_CONFIRMED --> COMMIT[COMMIT TRANSACTION]
    COMMIT --> SUCCESS([Return HTTP 200 Confirmed Challan])
```

---

## 20. Product Snapshot Architecture

To prevent historical order data corruption when product details (such as price or title) change in the main product catalog, the system implements **Product Snapshots** inside `ChallanItem`.

### Historical Integrity Comparison

```
[ Product Catalog ]
Product ID: prod_101
productName: "Industrial Bolt M10"
sku: "BOLT-M10"
unitPrice: 2.50
        │
        ▼ (Order Created on 2026-08-01)
[ ChallanItem Snapshot ]
challanId: "chl_99"
productId: "prod_101"
productName: "Industrial Bolt M10"
sku: "BOLT-M10"
unitPrice: 2.50
quantity: 100

        │ (Price updated on 2026-08-10)
        ▼
[ Product Catalog Updated ]
unitPrice: 3.50  <-- (Current Price Increased)

        │
        ▼
[ Historical Order Display ]
Challan CHL-99 continues to render unitPrice = 2.50 (Preserving financial record).
```

---

## 21. Customer Challan Statistics

The endpoint `GET /api/customers/:id/challans` computes real-time statistics for a customer's purchasing history:

```json
{
  "total": 12,
  "confirmed": 8,
  "draft": 2,
  "cancelled": 2,
  "paid": 6,
  "unpaid": 2
}
```

---

## 22. AWS S3 Product Image Integration

Product images are uploaded through a memory buffer pipeline and stored in Amazon S3.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend / User
    participant BE as Express Backend (Multer)
    participant S3 as AWS S3 Storage
    participant DB as PostgreSQL

    Client->>BE: POST /api/products/:id/image (multipart/form-data)
    BE->>BE: Multer memoryStorage parses buffer (Max 5MB)
    BE->>S3: s3.send(PutObjectCommand { Bucket, Key, Body: buffer, ContentType })
    S3-->>BE: Upload Successful
    BE->>DB: prisma.product.update({ imageUrl: key })
    DB-->>BE: Product Updated
    BE-->>Client: Returns Updated Product

    Note over Client, S3: Image Rendering Flow
    Client->>BE: GET /api/products/images?key=products/HOSE-HYD-10MM-123.png
    BE->>S3: getSignedUrl(GetObjectCommand, { expiresIn: 600 })
    S3-->>BE: Presigned URL String
    BE-->>Client: HTTP 200 { success: true, data: { url: "https://..." } }
    Client->>Client: Render <img> tag using Presigned URL
```

---

## 23. AWS S3 Environment Variables

| Variable Name | Purpose | Example Value |
| :--- | :--- | :--- |
| `AWS_ACCESS_KEY_ID` | IAM User Access Key ID | `AKIAYOURAWSKEYID12345` |
| `AWS_SECRET_ACCESS_KEY` | IAM User Secret Key | `YOUR_AWS_SECRET_ACCESS_KEY_HERE` |
| `AWS_BUCKET_NAME` | Target S3 Bucket Name | `your-s3-bucket-name` |

---

## 24. PDF Generation System

PDF documents are rendered server-side using **PDFKit** and streamed directly to the client as an `application/pdf` binary stream.

### 1. Sales Challan PDF (`GET /api/challans/:id/pdf`)
Renders company header, sales challan number, date, customer business address, GST number, itemized product table, total quantity, status, payment status, and creator name.

### 2. Tax Invoice PDF (`GET /api/invoices/:id/pdf`)
Renders official Tax Invoice for `CONFIRMED` orders:
- **Company GSTIN**: `27AABCU9603R1ZM`
- **Itemized Financial Table**: Unit prices, line totals.
- **Tax Breakdown**: Subtotal calculation, 18% total tax structure, and terms & conditions.

---

## 25. Database Schema & ER Diagram

```mermaid
erDiagram
    User ||--o{ Customer : "creates"
    User ||--o{ FollowUp : "creates"
    User ||--o{ StockMovement : "creates"
    User ||--o{ Challan : "creates"

    Customer ||--o{ FollowUp : "has"
    Customer ||--o{ Challan : "places"

    Product ||--o{ StockMovement : "has"
    Product ||--o{ ChallanItem : "referenced_in"

    Challan ||--|{ ChallanItem : "contains"

    User {
        string id PK
        string name
        string email UK
        string password
        enum role "ADMIN | SALES | WAREHOUSE | ACCOUNTS"
        datetime created_at
        datetime updated_at
    }

    Customer {
        string id PK
        string customerName
        string mobile UK
        string email
        string businessName
        string gstNumber
        enum customerType "RETAIL | WHOLESALE | DISTRIBUTOR"
        string address
        enum status "LEAD | ACTIVE | INACTIVE"
        datetime followUpDate
        string notes
        string createdBy FK
        datetime created_at
        datetime updated_at
    }

    FollowUp {
        string id PK
        string customerId FK
        string note
        datetime followUpDate
        string createdBy FK
        datetime created_at
    }

    Product {
        string id PK
        string productName
        string sku UK
        string category
        decimal unitPrice
        int currentStock
        int minimumStock
        string warehouseLocation
        string imageUrl
        datetime created_at
        datetime updated_at
    }

    StockMovement {
        string id PK
        string productId FK
        int quantity
        enum type "IN | OUT"
        string reason
        string createdBy FK
        datetime created_at
    }

    Challan {
        string id PK
        string challanNumber UK
        string customerId FK
        int totalQuantity
        enum status "DRAFT | CONFIRMED | CANCELLED"
        enum paymentStatus "UNPAID | PAID"
        datetime paidAt
        string createdBy FK
        datetime created_at
        datetime updated_at
    }

    ChallanItem {
        string id PK
        string challanId FK
        string productId FK
        string productName
        string sku
        decimal unitPrice
        int quantity
    }
```

---

## 26. Database Technology

- **Database Engine**: PostgreSQL
- **Database Host**: Neon Serverless PostgreSQL
- **ORM**: Prisma 7 (`@prisma/client` & `@prisma/adapter-pg`)
- **Key Features Used**:
  - Type-safe database queries.
  - Foreign key constraints with cascading deletes (`FollowUp`, `ChallanItem`).
  - Indexing on `email`, `mobile`, `status`, `sku`, `category`, `challanNumber`.
  - Atomic database transactions via `prisma.$transaction`.

---

## 27. Master API Table

| Method | Endpoint | Auth | Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/auth/login` | Public | All | Authenticate user & obtain JWT token |
| `GET` | `/api/auth/me` | JWT | All | Get current user profile |
| `GET` | `/api/customers` | JWT | `ADMIN`, `SALES`, `ACCOUNTS` | List customers with search/filters |
| `POST` | `/api/customers` | JWT | `ADMIN`, `SALES` | Create a new customer |
| `GET` | `/api/customers/:id` | JWT | `ADMIN`, `SALES`, `ACCOUNTS` | Get customer details & follow-ups |
| `PUT` | `/api/customers/:id` | JWT | `ADMIN`, `SALES` | Update customer record |
| `DELETE` | `/api/customers/:id` | JWT | `ADMIN`, `SALES` | Delete customer & related orders |
| `POST` | `/api/customers/:id/followups` | JWT | `ADMIN`, `SALES` | Add a customer follow-up note |
| `GET` | `/api/customers/:id/followups` | JWT | `ADMIN`, `SALES`, `ACCOUNTS` | List customer follow-up history |
| `GET` | `/api/customers/:id/challans` | JWT | `ADMIN`, `SALES`, `ACCOUNTS` | Get customer orders & stats |
| `GET` | `/api/products` | JWT | `ADMIN`, `WAREHOUSE`, `SALES`, `ACCOUNTS` | List products with search/filters |
| `POST` | `/api/products` | JWT | `ADMIN`, `WAREHOUSE` | Create new product entry |
| `GET` | `/api/products/images` | JWT | All | Get S3 presigned URL for image key |
| `GET` | `/api/products/:id` | JWT | `ADMIN`, `WAREHOUSE`, `SALES`, `ACCOUNTS` | Get product details by ID |
| `PUT` | `/api/products/:id` | JWT | `ADMIN`, `WAREHOUSE` | Update product details |
| `DELETE` | `/api/products/:id` | JWT | `ADMIN`, `WAREHOUSE` | Delete product from catalog |
| `POST` | `/api/products/:id/image` | JWT | `ADMIN`, `WAREHOUSE` | Upload product image to AWS S3 |
| `GET` | `/api/stock/movements` | JWT | `ADMIN`, `WAREHOUSE`, `ACCOUNTS` | List inventory movement audit logs |
| `POST` | `/api/stock/in` | JWT | `ADMIN`, `WAREHOUSE` | Record manual Stock IN adjustment |
| `POST` | `/api/stock/out` | JWT | `ADMIN`, `WAREHOUSE` | Record manual Stock OUT adjustment |
| `GET` | `/api/challans` | JWT | `ADMIN`, `SALES`, `ACCOUNTS` | List sales challans with filters |
| `POST` | `/api/challans` | JWT | `ADMIN`, `SALES` | Create draft sales challan |
| `GET` | `/api/challans/:id` | JWT | `ADMIN`, `SALES`, `ACCOUNTS` | Get sales challan details |
| `PUT` | `/api/challans/:id` | JWT | `ADMIN`, `SALES` | Update draft sales challan |
| `PATCH` | `/api/challans/:id/confirm` | JWT | `ADMIN`, `SALES` | Confirm challan & deduct inventory |
| `PATCH` | `/api/challans/:id/cancel` | JWT | `ADMIN`, `SALES` | Cancel draft sales challan |
| `PATCH` | `/api/challans/:id/paid` | JWT | `ADMIN`, `SALES`, `ACCOUNTS` | Mark confirmed order payment as PAID |
| `GET` | `/api/challans/:id/pdf` | JWT | `ADMIN`, `SALES`, `ACCOUNTS` | Stream PDF Sales Challan document |
| `GET` | `/api/invoices/:id/pdf` | JWT | `ADMIN`, `SALES`, `ACCOUNTS` | Stream PDF Tax Invoice document |

---

## 28. Detailed API Documentation

### Authentication APIs

#### `POST /api/auth/login`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "admin@fundsroom.com",
    "password": "Admin@123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "73025522-1e8b-4e05-b05c-167a523fb2b9",
        "name": "Admin User",
        "email": "admin@fundsroom.com",
        "role": "ADMIN"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

### Customer CRM APIs

#### `GET /api/customers`
- **Auth**: JWT (`ADMIN`, `SALES`, `ACCOUNTS`)
- **Query Params**: `page` (default 1), `limit` (default 10), `search`, `status`, `customerType`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "c101",
        "customerName": "Rajesh Sharma",
        "mobile": "9876543210",
        "email": "rajesh@sharma.com",
        "businessName": "Sharma Traders",
        "gstNumber": "27AAPFU0939F1ZV",
        "customerType": "WHOLESALE",
        "address": "12 MG Road, Mumbai",
        "status": "ACTIVE",
        "createdByUser": { "name": "Admin User" }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
  ```

---

### Product APIs

#### `POST /api/products/:id/image`
- **Auth**: JWT (`ADMIN`, `WAREHOUSE`)
- **Content-Type**: `multipart/form-data`
- **Form Data Field**: `image` (File, Max 5MB)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "p101",
      "productName": "Safety Helmet",
      "sku": "PPE-HELM-001",
      "imageUrl": "products/PPE-HELM-001-1786469991.png"
    }
  }
  ```

---

### Stock & Inventory APIs

#### `POST /api/stock/in`
- **Auth**: JWT (`ADMIN`, `WAREHOUSE`)
- **Request Body**:
  ```json
  {
    "productId": "p101",
    "quantity": 50,
    "reason": "New shipment received from vendor"
  }
  ```
- **Success Response (200 OK)**: Returns updated product record with new `currentStock`.

---

### Sales Challan APIs

#### `POST /api/challans`
- **Auth**: JWT (`ADMIN`, `SALES`)
- **Request Body**:
  ```json
  {
    "customerId": "c101",
    "items": [
      { "productId": "p101", "quantity": 10 },
      { "productId": "p102", "quantity": 5 }
    ]
  }
  ```
- **Success Response (200 OK)**: Returns created draft challan with `status: "DRAFT"`, `paymentStatus: "UNPAID"`, and assigned `challanNumber`.

#### `PATCH /api/challans/:id/confirm`
- **Auth**: JWT (`ADMIN`, `SALES`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "chl_01",
      "challanNumber": "CHL-20260811-0001",
      "status": "CONFIRMED",
      "paymentStatus": "UNPAID"
    }
  }
  ```

---

## 29. API Error Handling

The application features a centralized Express error middleware (`error.middleware.ts`) that standardizes error payloads:

```json
{
  "success": false,
  "message": "Error description message"
}
```

### Standard HTTP Status Codes Returned
- `200 OK`: Successful retrieval or update.
- `201 Created`: Successful resource creation.
- `400 Bad Request`: Validation failure or business logic error (e.g., insufficient inventory).
- `401 Unauthorized`: Token missing, expired, or invalid credentials.
- `403 Forbidden`: User role lacks permission for the endpoint.
- `404 Not Found`: Requested record does not exist.
- `409 Conflict`: Duplicate unique key violation (e.g., existing mobile or SKU).
- `500 Internal Server Error`: Unexpected server or connection exception.

---

## 30. Environment Variables

### Backend Configuration (`backend/.env`)

```ini
# PostgreSQL Connection URL
DATABASE_URL="postgresql://neondb_owner:npg_2lsuMcP9ydiw@ep-withered-queen-ai14u3wy-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# JWT Secret Token Key
JWT_SECRET="skdhfkhffshfsjhfj"

# Server Port
PORT=5000

# Environment Mode
NODE_ENV="development"

# Frontend Origin for CORS
FRONTEND_URL="http://localhost:5173"

# AWS S3 Credentials
AWS_ACCESS_KEY_ID="AKIAYOURAWSKEYID12345"
AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY_HERE"
AWS_BUCKET_NAME="your-s3-bucket-name"
```

### Frontend Configuration (`frontend/.env`)

```ini
# Backend API Endpoint
VITE_API_URL="http://localhost:5000/api"
```

---

## 31. Local Development Setup

### Prerequisites
- Node.js (v20 or higher)
- npm (v10 or higher)
- Access to PostgreSQL Database (or Neon DB instance)

### Installation & Startup Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Ravindraprajapat/Fundsroom-ERP-CRM-Operations-Portal.git
   cd Fundsroom-ERP-CRM-Operations-Portal
   ```

2. **Setup & Start Backend**:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npm run db:seed
   npm run dev
   ```

3. **Setup & Start Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **One-Click Windows Launcher**:
   Alternatively, run `run-project.bat` from the root project directory to launch both backend and frontend dev servers concurrently.

---

## 32. Demo Accounts & Credentials

The database comes pre-seeded with four role-specific demonstration accounts:

| Role | Email Address | Password | Intended Use Case |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@fundsroom.com` | `Admin@123` | Full administrative control across all modules |
| **SALES** | `sales@fundsroom.com` | `Sales@123` | Customer management, follow-ups, draft & confirm orders |
| **WAREHOUSE** | `warehouse@fundsroom.com` | `Warehouse@123` | Product catalog, S3 image uploads, stock adjustments |
| **ACCOUNTS** | `accounts@fundsroom.com` | `Accounts@123` | Review confirmed orders, mark payment PAID, export Tax Invoices |

---

## 33. Security & Business Rules

1. **Password Hashing**: Plaintext passwords are never stored; all passwords undergo salt hashing via `bcryptjs`.
2. **Atomic Inventory Isolation**: Inventory deductions occur inside Prisma transactions to prevent race conditions or partial updates during order confirmation.
3. **Price Snapshot Locking**: Line item prices are snapshotted on creation to guarantee historical invoice accuracy regardless of future catalog price changes.
4. **CORS Origin Filtering**: Dynamic regex origin checks enforce CORS boundary protection while allowing local dev ports.

---

## 34. Known Limitations & Future Improvements

- **Pagination Limits**: Stock movement histories currently render paginated lists; real-time WebSocket updates can be added in future iterations.
- **Automated Reordering**: The platform currently identifies low-stock items (`currentStock <= minimumStock`); automated Purchase Order (PO) creation for suppliers can be integrated in Phase 2.
- **Payment Gateway Integration**: Payment updates are handled operationally by Accounts staff; direct gateway integration (Razorpay/Stripe) can be connected to the payment status endpoint.

---

## 35. License

This project is licensed under the **ISC License**.
