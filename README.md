# Deloitte RFP Command Center

**Enterprise-Grade RFP Lifecycle Management Platform**

A production-ready, full-stack web application for managing Request for Proposal (RFP) workflows with governance, risk tracking, and executive visibility.

---

## 🎯 Project Overview

This is an internal consulting-grade proposal governance platform designed for Tier-1 consulting firms. It manages RFPs from intake to submission with:

- **Lifecycle Management**: Track RFPs through all stages (Intake → Won/Lost)
- **Risk Scoring**: Auto-calculate risk based on deadlines, tasks, and milestones
- **Task Governance**: Single-owner enforcement with SLA tracking
- **Executive Dashboard**: KPIs, analytics, and pipeline visibility
- **Approval Workflows**: Go/No-Go decisions and multi-stage approvals
- **Audit Compliance**: Complete activity logging
- **Role-Based Access**: Proposal Managers, Solution Architects, Leadership, Bid Reviewers

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL (v14+)
- **ORM**: Prisma
- **Authentication**: JWT with bcrypt
- **Architecture**: REST API with modular MVC structure

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: CSS with CSS Variables (Professional Navy/Grey theme)

---

## 📋 Prerequisites

Before installation, ensure you have:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher
- **Git**: Latest version

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd deloitte-rfp-command-center
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file with your settings:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/deloitte_rfp?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

#### Setup Database

**Create PostgreSQL Database:**

```bash
psql -U postgres
CREATE DATABASE deloitte_rfp;
\q
```

**Run Prisma Migrations:**

```bash
npx prisma migrate dev --name init
```

**Generate Prisma Client:**

```bash
npx prisma generate
```

**Seed Database with Demo Data:**

```bash
npm run prisma:seed
```

This creates 6 demo users:
- **sarah.johnson@deloitte.com** (Proposal Manager) - password: `password123`
- **michael.chen@deloitte.com** (Proposal Manager) - password: `password123`
- **david.kumar@deloitte.com** (Solution Architect) - password: `password123`
- **emily.rodriguez@deloitte.com** (Solution Architect) - password: `password123`
- **robert.williams@deloitte.com** (Leadership) - password: `password123`
- **jennifer.taylor@deloitte.com** (Bid Reviewer) - password: `password123`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd ../frontend
npm install
```

Frontend automatically connects to `http://localhost:5000` backend API.

---

## 🎮 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

---

## 👥 User Roles & Permissions

### 1. Proposal Manager (Admin)
- Create and manage RFPs
- Assign Solution Architects
- Create and assign tasks
- Request approvals
- Full visibility across all RFPs

### 2. Solution Architect (Contributor)
- View assigned RFPs
- Update tasks
- Submit draft milestones
- Add comments to RFPs
- Limited to assigned work

### 3. Leadership (Executive View)
- Read-only access
- Executive dashboard with KPIs
- Risk overview and analytics
- Pipeline visibility
- Cannot modify data

### 4. Bid Reviewer (Approval Role)
- Approve/reject draft proposals
- Approve/reject final proposals
- Make Go/No-Go decisions
- Review executive summaries

---

## 📊 Key Features

### RFP Lifecycle Management
- Create RFPs with client details, industry, deal value
- Track through 9 status stages
- Auto-generate RFP numbers (RFP-YYYY-XXXX)
- Executive summary documentation
- Go/No-Go decision tracking

### Risk Scoring Engine
Automatically calculates risk based on:
- **Deadline proximity**: Days until submission
- **Task completion**: Percentage of incomplete tasks
- **Overdue milestones**: Missed internal deadlines
- **Resource assignment**: Missing solution architect

**Risk Levels**: GREEN (< 25 points), AMBER (25-49 points), RED (50+ points)

### Task Governance
- Single owner per task (enforced)
- Status: Not Started, In Progress, Blocked, Completed
- Automatic overdue detection
- Escalation flags (>48 hours overdue)
- SLA compliance tracking

### Milestone Engine
Auto-generates 5 milestones per RFP:
1. Kickoff
2. First Draft
3. Internal Review
4. Final Review
5. Submission

Timeline visualization shows progress and delays.

### Executive Dashboard
**Key KPIs:**
- Total Active RFPs
- RFPs at Risk (Amber/Red)
- Total Pipeline Value
- Average Proposal Turnaround Time
- Win Rate (%)
- SLA Compliance (%)

**Analytics:**
- Bar chart: Industry vs Pipeline Value
- Pie chart: Risk distribution
- Recent activity feed

### Approval Workflows
- Draft approval before internal review
- Final approval before submission
- Go/No-Go decision gates
- Comments and decision tracking
- Email notifications (simulated)

### Activity Logging
Complete audit trail tracking:
- RFP creation/updates
- Task assignments/updates
- Status changes
- Approval decisions
- Risk escalations

Includes: User, Action, Timestamp, Entity Reference

### Notification System
Triggers for:
- Task assigned
- Deadline within 3 days
- Risk escalated to RED
- Approval requested

Badge indicator in UI navigation.

---

## 🗄 Database Schema

### Core Tables:
- **Users**: Authentication, roles, profile data
- **RFPs**: Proposal details, status, risk level
- **Tasks**: Work items with ownership
- **Milestones**: Auto-generated timeline markers
- **Approvals**: Workflow gates
- **ActivityLogs**: Audit compliance
- **Notifications**: User alerts

### Relationships:
- RFPs → Proposal Manager (User)
- RFPs → Solution Architect (User)
- Tasks → Owner (User)
- Tasks → RFP
- Milestones → RFP
- Approvals → Reviewer (User) + RFP

**Indexing on:**
- Deadlines, Status, Risk Level
- User assignments
- Timestamps

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access Control (RBAC)**: Middleware guards
- **Input Validation**: Server-side validation
- **Rate Limiting**: DDoS protection (100 req/15min)
- **Environment Variables**: Sensitive data protection
- **CORS Configuration**: Restricted origins

---

## 📁 Project Structure

```
deloitte-rfp-command-center/
├── backend/
│   ├── controllers/          # Business logic
│   │   ├── auth.controller.js
│   │   ├── rfp.controller.js
│   │   ├── task.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── approval.controller.js
│   │   └── activity.controller.js
│   ├── routes/              # API endpoints
│   │   ├── auth.routes.js
│   │   ├── rfp.routes.js
│   │   ├── task.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── approval.routes.js
│   │   ├── activity.routes.js
│   │   └── notification.routes.js
│   ├── middleware/          # Auth & validation
│   │   └── auth.middleware.js
│   ├── utils/               # Helper functions
│   │   └── riskEngine.js
│   ├── prisma/              # Database
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── server.js            # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API calls
│   │   ├── context/         # Auth context
│   │   ├── layouts/         # Layout wrappers
│   │   ├── styles/          # CSS files
│   │   ├── App.jsx          # Main app
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md (this file)
```

---

## 🧪 Testing the Application

### Login Credentials

Use these demo accounts:

**Proposal Manager (Full Access):**
- Email: `sarah.johnson@deloitte.com`
- Password: `password123`

**Solution Architect:**
- Email: `david.kumar@deloitte.com`
- Password: `password123`

**Leadership (Read-Only):**
- Email: `robert.williams@deloitte.com`
- Password: `password123`

### Test Workflow

1. **Login** as Proposal Manager
2. **View Dashboard**: See KPIs and active RFPs
3. **Create New RFP**: Add client details
4. **Assign Tasks**: Create tasks for team
5. **Check Risk**: View auto-calculated risk levels
6. **View as Architect**: Login as David to see assigned work
7. **Update Tasks**: Mark tasks complete
8. **Check Executive View**: Login as Leadership to see dashboard

---

## 🔧 Useful Commands

### Backend

```bash
# Development with auto-reload
npm run dev

# Production
npm start

# Database migrations
npx prisma migrate dev

# Open Prisma Studio (DB GUI)
npm run prisma:studio

# Reset and reseed database
npx prisma migrate reset
npm run prisma:seed
```

### Frontend

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## 📈 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### RFPs
- `GET /api/rfps` - List all RFPs (filtered by role)
- `GET /api/rfps/:id` - Get single RFP details
- `POST /api/rfps` - Create new RFP
- `PATCH /api/rfps/:id` - Update RFP
- `DELETE /api/rfps/:id` - Delete RFP
- `POST /api/rfps/:id/recalculate-risk` - Recalculate risk

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Dashboard
- `GET /api/dashboard/executive` - Executive KPIs
- `GET /api/dashboard/my-rfps` - User's RFPs and tasks

### Approvals
- `POST /api/approvals` - Create approval request
- `PATCH /api/approvals/:id` - Approve/Reject

### Activity & Notifications
- `GET /api/activities` - Activity logs
- `GET /api/notifications` - User notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read

All protected routes require `Authorization: Bearer <token>` header.

---

## 🎨 UI Theme

**Color Palette:**
- Primary Navy: `#1e3a8a` (Professional trust)
- Secondary Grey: `#64748b` (Neutral balance)
- Success Green: `#10b981` (Low risk)
- Warning Amber: `#f59e0b` (Medium risk)
- Danger Red: `#ef4444` (High risk)
- Background: `#f8fafc` (Clean canvas)

**Typography:**
- Headers: System fonts (clean, professional)
- Body: -apple-system, BlinkMacSystemFont, Segoe UI
- Monospace: Courier for RFP numbers

**Design Principles:**
- Enterprise-grade professionalism
- Clear hierarchy and spacing
- Consistent component patterns
- Responsive layout
- Accessible color contrast

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify credentials in .env
DATABASE_URL="postgresql://user:password@localhost:5432/deloitte_rfp"
```

### Port Already in Use
```bash
# Backend (5000)
lsof -ti:5000 | xargs kill -9

# Frontend (5173)
lsof -ti:5173 | xargs kill -9
```

### Prisma Client Not Generated
```bash
cd backend
npx prisma generate
```

### Frontend Cannot Connect to Backend
- Ensure backend is running on port 5000
- Check CORS settings in `backend/server.js`
- Verify `FRONTEND_URL` in `.env`

---

## 🚢 Deployment Considerations

### Backend
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET` (32+ characters)
- Configure production database
- Enable HTTPS
- Set up proper logging
- Implement rate limiting per user
- Add monitoring (e.g., Sentry)

### Frontend
- Run `npm run build`
- Serve `dist/` folder via Nginx/Apache
- Configure API base URL for production
- Enable gzip compression
- Set up CDN for assets

### Database
- Regular backups
- Connection pooling
- Query optimization
- Index maintenance

---

## 📝 License

This project is created as an educational demonstration for Alliance University students as part of a Case Competition in collaboration with Deloitte.

---

## 👨‍💻 Development Team

**Alliance University Team:**
- Abhishek Banerjee
- Balineni Rishitha
- Kunal Kumar
- Manya Bhardwaj

**In Collaboration With:**
- Deloitte Consulting

---

## 🎓 Case Competition Context

This platform was developed as a live project challenge for the Alliance University Case Competition. It demonstrates:
- Enterprise software development practices
- Full-stack architecture
- Consulting-grade governance systems
- Production-ready code quality
- Professional UI/UX design

---

## 📞 Support

For questions or issues:
1. Check this README
2. Review API documentation above
3. Inspect browser console and backend logs
4. Verify database connections

---

**Built with precision for enterprise excellence.**
