# First Three Weeks Teaching Sample Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce source-backed Week 1–3 content maps, three 90-minute teacher-led lesson designs, a stable-but-configurable website architecture, and reviewable renderings before converting the approved result into SDD 003.

**Architecture:** Treat original PDFs as the factual source, separate course knowledge from weekly classroom choreography, and keep the student/teacher shell stable while composing different weekly activity modules. No production code changes occur until the renderings and design documents are approved and converted into an SDD package.

**Tech Stack:** Markdown design artifacts, Poppler `pdfinfo`/`pdftoppm`, bundled Python `pypdf` for text extraction, Codex image inspection, ImageGen for concept renderings, existing Logistics_MEM SDD conventions.

## Global Constraints

- Scope is limited to Week 1, Week 2, and Week 3; Week 4 and later content is not fabricated.
- Read every page of each source PDF and visually inspect representative pages before designing that week.
- Use a stable first-level website shell with week-specific classroom modules.
- Teacher remains the classroom orchestrator; AI video and the authorized course digital assistant provide bounded support.
- In-class interaction must include explicit device-down moments that return attention to the teacher and peers.
- AI answers and learning assets must preserve source-page provenance.
- Existing submission, boundary-checking, simulation, AI-feedback, and teacher-review capabilities remain intact.
- Do not modify production source code until SDD 003 is approved.

---

### Task 1: Establish the Three-Week Source Manifest

**Files:**
- Create: `design-references/网站框架探索/方案-03-教师引导的PBL课程现场/课程内容地图/README.md`
- Reference: `/Users/eric/Desktop/任务书/物流管理课件+学生作业/课件/wk1intro_scm.pdf`
- Reference: `/Users/eric/Desktop/任务书/物流管理课件+学生作业/课件/wk2strategicfit(1).pdf`
- Reference: `/Users/eric/Desktop/任务书/物流管理课件+学生作业/课件/wk3performanceevaluation.pdf`

**Interfaces:**
- Consumes: the three original course PDFs.
- Produces: one canonical source table containing filename, page count, title, teaching-week label, extraction status, visual-review status, and known calendar mismatch notes.

- [ ] **Step 1: Verify all source files and metadata**

Run:

```bash
rtk proxy pdfinfo '/Users/eric/Desktop/任务书/物流管理课件+学生作业/课件/wk1intro_scm.pdf'
rtk proxy pdfinfo '/Users/eric/Desktop/任务书/物流管理课件+学生作业/课件/wk2strategicfit(1).pdf'
rtk proxy pdfinfo '/Users/eric/Desktop/任务书/物流管理课件+学生作业/课件/wk3performanceevaluation.pdf'
```

Expected: page counts are 72, 53, and 79 respectively; none are encrypted.

- [ ] **Step 2: Write the canonical source manifest**

The manifest must state that Week 1 has already been fully read, while Week 2 and Week 3 require full extraction and visual review before their content maps are accepted.

- [ ] **Step 3: Validate the manifest**

Run:

```bash
rtk proxy rg -n 'wk1intro_scm|wk2strategicfit|wk3performanceevaluation|72|53|79' 'design-references/网站框架探索/方案-03-教师引导的PBL课程现场/课程内容地图/README.md'
rtk proxy git diff --check -- 'design-references/网站框架探索/方案-03-教师引导的PBL课程现场/课程内容地图/README.md'
```

Expected: all three filenames and page counts appear; `git diff --check` returns no output.

### Task 2: Build the Week 2 Source-Backed Content Map

**Files:**
- Create: `design-references/网站框架探索/方案-03-教师引导的PBL课程现场/课程内容地图/Week-02-战略适配.md`
- Reference: `/Users/eric/Desktop/任务书/物流管理课件+学生作业/课件/wk2strategicfit(1).pdf`

**Interfaces:**
- Consumes: every page of the Week 2 PDF and the source manifest from Task 1.
- Produces: page-range-backed sections for concepts, cases, teacher prompts, activity opportunities, AI-video candidates, digital-assistant sources, and future-week material.

- [ ] **Step 1: Extract all 53 pages with page markers**

Use bundled `pypdf` to print `--- PAGE N ---` before each page. Save no extracted temporary text in the repository.

- [ ] **Step 2: Render and inspect representative pages**

Render the opening, each major concept transition, each major enterprise-case transition, the strategic-fit framework, and the closing review pages to a temporary directory. Inspect every rendered image for diagrams, spatial relationships, and text that extraction may miss.

- [ ] **Step 3: Write the Week 2 content map**

The document must contain these exact sections:

```markdown
## Source
## Role in the Three-Week Arc
## Page-Range Content Inventory
## Must-Teach Concepts
## Cases and Evidence
## Teacher Questions
## Student Decisions and Discussion Outputs
## AI Video Candidates
## Digital Assistant Knowledge and Boundaries
## Prior-Knowledge Links
## Future-Week Material
## Open Questions for Teacher Confirmation
```

Every factual item must include a source page or page range.

- [ ] **Step 4: Validate page coverage and provenance**

Run:

```bash
rtk proxy rg -n '^## ' 'design-references/网站框架探索/方案-03-教师引导的PBL课程现场/课程内容地图/Week-02-战略适配.md'
rtk proxy rg -n '第 [0-9]+ 页|第 [0-9]+–[0-9]+ 页' 'design-references/网站框架探索/方案-03-教师引导的PBL课程现场/课程内容地图/Week-02-战略适配.md'
rtk proxy git diff --check -- 'design-references/网站框架探索/方案-03-教师引导的PBL课程现场/课程内容地图/Week-02-战略适配.md'
```

Expected: all required headings are present, source-page references are present throughout, and formatting passes.

### Task 3: Build the Week 3 Source-Backed Content Map

**Files:**
- Create: `design-references/网站框架探索/方案-03-教师引导的PBL课程现场/课程内容地图/Week-03-绩效评价.md`
- Reference: `/Users/eric/Desktop/任务书/物流管理课件+学生作业/课件/wk3performanceevaluation.pdf`

**Interfaces:**
- Consumes: every page of the Week 3 PDF, Task 1 manifest, and Week 2 prerequisite links.
- Produces: page-range-backed sections separating metric definitions from managerial interpretation and network-design decisions.

- [ ] **Step 1: Extract all 79 pages with page markers**

Use bundled `pypdf`; do not rely on the earlier high-level summary as a substitute for page-level reading.

- [ ] **Step 2: Render and inspect representative pages**

Render each major SCOR/Gartner/financial-metric transition, driver-framework diagram, distribution-network option diagram, activity or calculation prompt, and closing synthesis page.

- [ ] **Step 3: Write the Week 3 content map**

Use the same required headings as Task 2. In `Must-Teach Concepts`, explicitly distinguish metric definition, calculation input, managerial meaning, and decision consequence.

- [ ] **Step 4: Validate page coverage and provenance**

Run the same heading, page-reference, and `git diff --check` validations as Task 2 against `Week-03-绩效评价.md`.

Expected: the document covers all major sections, carries page sources, and passes formatting.

### Task 4: Normalize the Existing Week 1 Analysis into the Same Content-Map Contract

**Files:**
- Create: `design-references/网站框架探索/方案-03-教师引导的PBL课程现场/课程内容地图/Week-01-课程导入.md`
- Reference: `/Users/eric/Desktop/任务书/物流管理课件+学生作业/课件/wk1intro_scm.pdf`

**Interfaces:**
- Consumes: the previously completed 72-page extraction and visual inspection plus the content-map contract from Tasks 2–3.
- Produces: a Week 1 content map directly comparable with Week 2 and Week 3.

- [ ] **Step 1: Reconcile the full Week 1 sequence**

Cover learning goals, BYD, the procurement game, SHEIN, supply-chain-network comparison, course structure, strategy/business-model content, delayed differentiation, cost/service, and strategic fit. Do not reduce Week 1 to only BYD and SHEIN.

- [ ] **Step 2: Write the Week 1 content map using the required headings**

Mark which late-deck concepts are brief Week 1 introductions versus deeper Week 2 material.

- [ ] **Step 3: Validate page coverage and provenance**

Run the same heading, page-reference, and formatting validations against `Week-01-课程导入.md`.

### Task 5: Design Three 90-Minute Teacher-Led Classroom Choreographies

**Files:**
- Create: `design-references/网站框架探索/方案-03-教师引导的PBL课程现场/课堂编排/Week-01-90分钟.md`
- Create: `design-references/网站框架探索/方案-03-教师引导的PBL课程现场/课堂编排/Week-02-90分钟.md`
- Create: `design-references/网站框架探索/方案-03-教师引导的PBL课程现场/课堂编排/Week-03-90分钟.md`

**Interfaces:**
- Consumes: the three accepted content maps.
- Produces: timed lesson plans whose activity durations total exactly 90 instructional minutes, plus one 5-minute intermission outside that total.

- [ ] **Step 1: Write Week 1 choreography**

Use a case-introduction and viewpoint-discussion pattern. Include teacher explanation, initial student judgment, group evidence, public disagreement, teacher synthesis, device-down moments, and an exit revision.

- [ ] **Step 2: Write Week 2 choreography**

Use a case-comparison and strategic-judgment pattern. Require students to connect demand uncertainty to responsive/efficient capability and revise a strategic-fit judgment after teacher explanation.

- [ ] **Step 3: Write Week 3 choreography**

Use a metric-diagnosis and decision-framework pattern. Prevent formula memorization by requiring students to explain what a metric indicates, what it hides, and what network decision it could change.

- [ ] **Step 4: Validate time, roles, and device behavior**

Each file must contain a timing table with these columns:

```markdown
| 时间 | 教师行为 | 学生行为 | 大屏 | 小组设备 | 个人设备 | 留下的证据 |
```

Verify manually that instructional segments total 90 minutes, each plan contains at least two explicit device-down moments, and each plan identifies teacher intervention points.

### Task 6: Define the Stable Shell and Weekly Module Contract

**Files:**
- Create: `design-references/网站框架探索/方案-03-教师引导的PBL课程现场/前三周网站骨架.md`
- Modify: `design-references/网站框架探索/方案-03-教师引导的PBL课程现场/前3周教学样板-需求.md`

**Interfaces:**
- Consumes: the three classroom choreographies.
- Produces: a stable navigation shell, a weekly module catalogue, role-specific views, and an exact mapping from classroom stage to website surface.

- [ ] **Step 1: Compare all three choreographies**

Classify each activity as stable across all weeks, shared by two weeks, or unique to one week.

- [ ] **Step 2: Write the stable shell**

Define student, teacher-big-screen, and teacher/TA views. For each module, record its purpose, required inputs, output evidence, allowed device context, digital-assistant context, and empty/error state.

- [ ] **Step 3: Define AI-video and digital-assistant placement**

Specify where a contextual assistant entry appears, what context is attached, when a video is teacher-controlled, when it is student-selected, and when a question escalates to a teacher/TA queue.

- [ ] **Step 4: Reconcile the requirement document**

Update only statements that the three detailed plans have clarified. Preserve the approved Week 1–3 scope and all exclusions.

- [ ] **Step 5: Validate consistency**

Search all four design documents for conflicting navigation labels, different names for the authorized course digital assistant, unsupported Week 4+ content, and missing device-down states. Fix inconsistencies before rendering.

### Task 7: Produce and Review the First-Three-Weeks Renderings

**Files:**
- Create: `design-references/网站框架探索/方案-03-教师引导的PBL课程现场/前三周渲染图/01-Week1-课堂现场.png`
- Create: `design-references/网站框架探索/方案-03-教师引导的PBL课程现场/前三周渲染图/02-Week2-战略判断.png`
- Create: `design-references/网站框架探索/方案-03-教师引导的PBL课程现场/前三周渲染图/03-Week3-指标诊断.png`
- Create: `design-references/网站框架探索/方案-03-教师引导的PBL课程现场/前三周渲染图/04-教师课堂编排与洞察.png`
- Create: `design-references/网站框架探索/方案-03-教师引导的PBL课程现场/前三周渲染图/README.md`

**Interfaces:**
- Consumes: the stable shell, weekly module contract, content maps, and lesson plans.
- Produces: four review images with a source-and-placeholder ledger.

- [ ] **Step 1: Write source-grounded rendering briefs**

Each brief must identify the real source content being shown, the user role, the classroom moment, the primary action, and which text or metrics remain illustrative.

- [ ] **Step 2: Generate the four renderings**

Use the approved restrained Tsinghua-purple visual direction. Avoid large purple colour blocks, excessive line-only structure, unsupported metrics, fake browser chrome, and identical layouts across the three weeks.

- [ ] **Step 3: Perform visual inspection**

Check legibility, hierarchy, rounded surfaces, colour restraint, content fidelity, and whether each screen makes its classroom moment obvious. Regenerate any image that invents course facts or implies students remain on-screen continuously.

- [ ] **Step 4: Write the rendering README**

For each image, list the represented moment, real source references, illustrative content, and unresolved questions requiring user review.

- [ ] **Step 5: User review gate**

Present all four images together. Do not convert the design into production code until the user approves the architecture and classroom relationship.

### Task 8: Convert the Approved Design into SDD 003

**Files:**
- Create: `docs/sdd/specs/003-first-three-weeks-teaching-sample/spec.md`
- Create: `docs/sdd/specs/003-first-three-weeks-teaching-sample/plan.md`
- Create: `docs/sdd/specs/003-first-three-weeks-teaching-sample/tasks.md`
- Modify: `docs/sdd/constitution.md` only if the approved three-week architecture changes an active constitutional statement.

**Interfaces:**
- Consumes: user-approved renderings and all Week 1–3 design artifacts.
- Produces: an implementation-ready SDD package with file-level scope, test strategy, mobile requirements, and ordered tasks.

- [ ] **Step 1: Write the SDD spec**

Carry forward only approved behavior and visual decisions. Separate real integrations from demo simulations and preserve the no-Week-4+ scope.

- [ ] **Step 2: Write the file-level implementation plan**

Map the approved design onto existing routes, shared shells, data modules, tests, and style tokens without deleting production capabilities.

- [ ] **Step 3: Write ordered TDD tasks**

Each implementation task must identify the failing test, minimal change, verification command, and expected result.

- [ ] **Step 4: Validate the SDD package**

Run placeholder scans, `git diff --check`, route-scope checks, and a consistency review against the approved design documents.

- [ ] **Step 5: Commit the approved SDD package**

Commit only SDD and approved design artifacts; leave unrelated worktree files untouched.
