

# AI Trademark Similarity & Infringement Detection Portal

A production-ready, government-style web application inspired by Singapore's IPOS digital services interface. The app serves two user roles: **Customers** (trademark applicants) and **Government Agents** (trademark evaluators), with a separate ML backend (FastAPI/Flask) consumed via REST APIs.

---

## Design System & Branding

- **Government-style color palette**: Dark navy header/nav bar, neutral blue accents, clean white backgrounds — matching the IPOS Digital Hub aesthetic
- **"A Government Agency Website" banner** at the very top (thin bar with icon, as seen on IPOS)
- **Professional typography**: System fonts, structured headings, clear hierarchy
- **No flashy animations** — minimal, formal, credible interface
- **Configurable `BASE_URL`** for all API calls via environment variable

---

## Customer-Facing Pages

### 1. Landing Page
- Government-style header with portal name: *"AI Trademark Similarity & Application Portal"*
- Navigation bar with links: Home, Check Similarity, Explore Similar Marks, Track Application
- Brief explanation section with structured notes (like IPOS "General Notes" accordion)
- Two prominent action cards: **Check Similarity** and **Track Application**
- Footer with official disclaimer

### 2. Trademark Similarity Check Page
- Structured form layout matching IPOS Digital Hub style (collapsible sections)
- **Required fields**: Business Name, Applicant Full Name, Contact Number, Email, Trademark Category (dropdown with 45 NICE classes), Logo Upload (PNG/JPG with image preview)
- **Optional field**: Text Present in Logo
- **Check Similarity** and **Reset** buttons
- Loading state: *"Analyzing Logo Using AI Model..."*
- **Results display**: Grid of cards showing matched trademarks — each with logo image, similarity percentage (bold), and Trademark ID, sorted by highest similarity
- **Actions after results**: "Submit Application" and "Upload Different Logo" buttons
- `POST /api/check-similarity` (multipart/form-data) and `POST /api/submit-application`
- Official advisory disclaimer below results

### 3. Explore Similar Marks Page
- Tab-based interface (like IPOS search tabs)
- Inputs: Logo upload, keyword search, category dropdown
- Display up to 100 results in professional grid layout
- Similarity percentage filter slider and sorting options
- `POST /api/explore-similarity`

### 4. Track Application Page
- Simple form: Email ID + Application ID
- `GET /api/application-status`
- Results card showing: Application ID, uploaded logo, submission date, status badge (Pending/yellow, Approved/green, Rejected/red), and agent notes if available

---

## Agent-Facing Pages (Protected Routes)

### 5. Agent Login Page
- Clean, government-style login form (User ID + Password)
- `POST /api/agent-login` — stores token in secure session storage
- Error messaging on failed login

### 6. Agent Dashboard
- Sidebar navigation: Pending Applications, Approved, Rejected, Logout
- Main content: Data table with columns — Application ID, Business Name, Applicant Name, Category, Submission Date, View Details button
- Pagination support
- Filtered views based on sidebar selection

### 7. Application Review Page
- **Split layout**:
  - **Left panel**: Large uploaded logo, applicant details, category, submitted logo text
  - **Right panel**: "AI Similarity Analysis" — grid of top 50 similar trademarks with image, similarity %, and Trademark ID
- **Decision section**: Approve (green) / Reject (red) buttons, mandatory notes textarea for rejection
- `POST /api/agent-decision`
- Status updates dynamically after decision

---

## Cross-Cutting Features

- **Form validation** with Zod schemas on all inputs (email format, phone number, required fields, file type/size restrictions)
- **Image preview** before upload on all logo upload fields
- **Loading states** and skeleton screens during API calls
- **Error handling** with toast notifications for API failures
- **Route protection**: Agent pages require valid auth token; redirect to login if missing
- **Duplicate submission prevention** on application submit
- **Responsive layout** that works on desktop and tablet

