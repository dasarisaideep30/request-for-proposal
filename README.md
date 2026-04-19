# 🚀 RFP Command Center: The Enterprise Command Edition

[**🌐 Explore the Live Command Center**](https://rfp-eta-puce.vercel.app/)

An elite, high-fidelity Enterprise platform engineered for mission-critical RFP orchestration, algorithmic risk intelligence, and zero-trust administrative governance. This system transforms the chaotic RFP intake process into a streamlined, high-performance executive workflow.

---

## 💎 State-of-the-Art Features

### 🧠 Strategic AI Intelligence
- **Large-Scale Document Analysis**: Automated ingestion of complex RFP PDFs and Word files into executive-ready summaries using LLaMA-3 (via Groq).
- **Infinite Generation Fallback**: Resilient AI orchestration that gracefully handles API quotas with high-fidelity system mocks.
- **Architectural Elaboration**: Transforms brief inputs into comprehensive, multi-page technical proposals.

### 🛡️ Ironclad Governance & "Undo" Sovereignty
- **Dynamic Administrative Delegation**: Promote Proposal Managers to Co-Admins or Solution Architects instantly.
- **Fail-Safe Revocation**: The only platform with "One-Click Undo" for administrative promotions and governance assignments.
- **Full Privacy Context**: Unified data isolation ensuring users only see RFPs and Tasks they are explicitly authorized to oversee.

### ⚡ Professional-Grade Performance
- **Sub-Millisecond Navigation**: Smart application-wide caching ensures data transitions are visually instant.
- **"Butter-Smooth" UX**: Optimistic UI updates provide immediate visual feedback for all administrative and status actions.
- **Audit Compliance**: Every status change, task assignment, and document upload leaves a crystalline trail in the Immutable Activity Log.

---

## 🛠️ Performance-Optimized Stack
- **Frontend**: React 18, Vite, Lucide-React, Advanced Glassmorphic CSS3.
- **Backend**: Node.js & Express (Edge-Optimized for Vercel).
- **Data Tier**: PostgreSQL with Prisma ORM.
- **AI Core**: Groq (LLaMA-3.3-70b), OpenAI (GPT-4o), Google Gemini.

---

## 🏁 Presentation Showroom (Live Credentials)
The environment is pre-configured with and elite "Perfect Strike" team for immediate demonstration:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `sarah.johnson@gmail.com` | `password123` |
| **Lead Architect** | `james@gmail.com` | `password123` |
| **Governance Co-Admin** | `jim@gmail.com` | `password123` |

---

## 🚀 Deployment & Local Operation

### Cloud Deployment
Optimized for **Vercel Edge Runtime**.
- **Build Command**: `npx prisma generate --schema=api/_core/prisma/schema.prisma && npm run build --workspace=frontend`
- **Output Directory**: `frontend/build_output`

### Local Setup
1. **Initialize Workspace**:
   ```bash
   npm install
   ```
2. **Environment Synchronization**:
   Update `backend/.env` with your `DATABASE_URL` and `GROQ_API_KEY`.
3. **Enterprise Seeding**:
   ```bash
   cd backend
   npx prisma generate
   node scripts/final_qa_showcase.js
   ```
4. **Launch Command**:
   ```bash
   npm run dev
   ```

---
*Delivering Enterprise Excellence through Intelligence and Accountability.*
