# FutureLenz

**A Modular, Evidence‑Traceable Futures Studies Analysis Platform**

---

## 1. Purpose & Vision

FutureLenz is a **professional futures studies (foresight) analysis platform** designed to support analysts, researchers, and decision‑makers. The system ingests text or documents and performs **structured, multi‑stage futures analysis** using large language models (LLMs) in a **modular, auditable, and reliable** way.

FutureLenz is **not** a generic AI chatbot. It is a **decision‑support system** that:

* Uses multiple LLM calls instead of a single prompt
* Activates or deactivates analytical modules based on feasibility
* Clearly states when information is missing
* Separates facts from inference and assumptions
* Produces outputs suitable for high‑level policy and strategic use

---

## 2. Core Design Principles

1. **Modularity over Monoliths**
   Each analytical function (trends, weak signals, scenarios, etc.) is a standalone module.

2. **Feasibility‑First Analysis**
   The system first evaluates what *can* and *cannot* be extracted from the input.

3. **Multi‑Pass LLM Orchestration**
   Accuracy is improved through multiple, purpose‑specific LLM calls.

4. **Evidence Traceability**
   Every analytical claim must be traceable to specific input text chunks.

5. **Transparency over Completeness**
   If data is insufficient, the system must explicitly say so.

6. **Persian‑First User Experience**
   All UI text, reports, dashboards, and outputs must be **Persian**, **RTL**, and culturally appropriate.

---

## 3. Target Users

* Futures studies analysts
* Policy analysts and advisors
* Strategic planners
* Research centers and observatories
* Government and defense decision‑support units

---

## 4. Input Capabilities

### 4.1 Supported Inputs

* Plain text (pasted)
* PDF
* DOCX
* TXT

### 4.2 Input Processing

* Text extraction
* Persian text normalization
* Noise removal (references, boilerplate)
* Token‑aware chunking with stable chunk IDs

---

## 5. High‑Level System Architecture

FutureLenz consists of:

* **Backend Analysis Pipeline (Job‑based)**
* **LLM Orchestration Layer**
* **Frontend Dashboard (Persian, RTL)**

All analysis is executed server‑side as an **asynchronous job**.

---

## 6. Backend – MVP Modules

### Module 0 – Input Manager

**Responsibilities:**

* Accept file or text input
* Extract and clean text
* Chunk text with deterministic IDs

**Outputs:**

* Clean text
* Chunk list `{ chunk_id, text }`

---

### Module 1 – Document Classifier (LLM)

**Purpose:** Identify the analytical nature of the input.

**Outputs (JSON):**

* Document type (policy, scientific, media, technical, etc.)
* Domain (e.g., AI, defense, energy)
* Dominant time horizon (short / mid / long term)
* Analytical level (descriptive / analytical / normative)

---

### Module 2 – Coverage & Feasibility Scanner (LLM)

**Purpose:** Determine which futures analysis modules are applicable.

**Evaluated Capabilities:**

* Trends
* Weak signals
* Critical uncertainties
* Scenarios
* Roadmapping

**Per Module Output:**

* status: `active | partial | inactive`
* missing_information: explicit list of missing data

This module determines the execution path of the pipeline.

---

### Module 3 – Clarification Question Generator (LLM)

**Triggered when:** A module is `partial` or `inactive`.

**Responsibilities:**

* Generate short, precise Persian clarification questions
* Questions must be answerable by a human user
* Enable incremental improvement of analysis quality

---

### Module 4 – Evidence Extractor (LLM + Rules)

**Purpose:** Extract raw analytical evidence without interpretation.

**Extracted Elements:**

* Key claims
* Actors
* Events
* Metrics and dates

**Each item includes:**

* Source chunk ID
* Short quoted snippet

---

### Module 5 – Futures Analysis Engines (LLM)

Only engines marked `active` or `partial` are executed.

#### 5.1 Trend Engine

* Mega‑trends
* Trends
* Micro‑trends
* Direction and strength

#### 5.2 Weak Signal Engine

* Non‑dominant or early signals
* Rationale for classification
* Possible future evolution

#### 5.3 Critical Uncertainty Engine

* High‑impact, high‑uncertainty drivers
* Explanation of uncertainty

All outputs must reference extracted evidence.

---

### Module 6 – Consistency & Critic Pass (LLM)

**Responsibilities:**

* Detect contradictions across modules
* Flag unsupported claims
* Normalize outputs

**Each analytical item must be labeled:**

* Fact
* Inference
* Assumption

Includes confidence level per item.

---

### Module 7 – Scenario Mini‑Engine (LLM)

**Executed only if:** At least two critical uncertainties exist.

**Outputs:**

* 2–3 compact future scenarios
* Key implications per scenario
* Early warning indicators

---

### Module 8 – Output Composer

**Responsibilities:**

* Assemble final structured outputs

**Deliverable Formats:**

* Executive brief
* Full futures analysis report
* Dashboard‑ready structured JSON

All text must be Persian.

---

## 7. Backend Engineering Requirements

* Node.js or FastAPI (choose one)
* Job‑based async execution
* Request ID per analysis
* Structured JSON logging
* Schema validation for all LLM outputs
* Retry & timeout handling
* Clear error taxonomy with Persian user messages
* `/api/health` endpoint (model + provider status)
* Demo mode when LLM key is missing

---

## 8. API Overview

* `POST /api/analyze` → returns `jobId`
* `GET /api/jobs/{jobId}` → status + partial results
* `GET /api/jobs/{jobId}/report` → final report JSON

---

## 9. Frontend – UX & UI Requirements

### 9.1 Language & Layout (CRITICAL)

* **All UI text must be Persian**
* **Full RTL layout**
* No English text anywhere in the UI

### 9.2 Design Language

* Professional, futuristic, futures‑research aesthetic
* Dashboard‑centric layout
* Clean typography, premium spacing

### 9.3 Core Screens

* Input & upload screen
* Analysis progress & job status
* Results dashboard with modular panels

### 9.4 Dashboard Panels

* Document profile
* Coverage map (active / partial / inactive)
* Clarification questions
* Trends visualization
* Weak signals
* Critical uncertainties
* Scenarios (if available)
* Evidence explorer (click → source text)

### 9.5 Export & Presentation

* Printable Persian report view (HTML)
* JSON export

---

## 10. Data Integrity & Trust

* Explicit confidence indicators
* Clear distinction between facts and interpretation
* No silent assumptions
* Missing data must be surfaced, not hidden

---

## 11. Non‑Goals (Out of MVP Scope)

* Real‑time web crawling
* Automatic OSINT ingestion
* Fully dynamic quantitative modeling

---

## 12. Success Criteria for MVP

* Pipeline executes reliably end‑to‑end
* Modules activate/deactivate correctly
* Outputs are defensible and traceable
* UI is Persian, RTL, and presentation‑ready
* System is suitable for expert and decision‑maker use

---

**FutureLenz is designed to augment human futures thinking, not replace it.**
