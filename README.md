# Fundsroom ERP-CRM

Mini ERP + CRM Operations Portal for wholesale/distribution companies.

> Full documentation will be added in Phase 21.

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
# fill in .env values
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# fill in .env values
npm run dev
```

## Demo Credentials

| Role      | Email                      | Password      |
|-----------|----------------------------|---------------|
| ADMIN     | admin@fundsroom.com        | Admin@123     |
| SALES     | sales@fundsroom.com        | Sales@123     |
| WAREHOUSE | warehouse@fundsroom.com    | Warehouse@123 |
| ACCOUNTS  | accounts@fundsroom.com     | Accounts@123  |
