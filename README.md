# ERIICA — Empathy & Reassurance in Illness Conversation Assistant

> An AI-powered clinical training chatbot that helps nurses and healthcare professionals practise Serious Illness Conversations (SICs) in a safe, realistic simulation environment.

---

## Overview

Serious Illness Conversations are among the most emotionally demanding moments in clinical practice. This conversations require empathy, presence, and the ability to navigate grief, denial, and uncertainty in real time. Yet these skills can only be developed through repeated practice across diverse patient situations, which are not always accessible to trainees.

ERIICA gives healthcare professionals a safe, private space to rehearse these conversations before they happen in real life. Users describe a patient scenario or choose from a curated library, and ERIICA responds as a simulated patient, dynamically adjusting its emotional state based on how the conversation unfolds.

---

## Features

| Feature | Description |
|---|---|
| **Scenario Library** | Browse and filter a large database of clinical scenarios by difficulty (Beginner / Intermediate / Advanced), or describe your own |
| **RAG-powered Simulation** | Retrieves the most semantically similar real case from ChromaDB to ground each session in authentic patient behaviour and voice |
| **Dynamic Emotional Tracking** | ERIICA's emotional state evolves throughout the conversation — good technique visibly de-escalates distress; poor communication causes withdrawal |
| **Patient Profile Panel** | Displays a structured snapshot of the matched case (primary emotions, cognitive state, underlying needs) to guide the practitioner |
| **Clinical Frameworks** | SPIKES, NURSE, and the SIC Guide are available as in-session reference tabs at any point during the conversation |
| **Session Debrief** | After each session, ERIICA grades the conversation against the clinical frameworks and highlights demonstrated vs. missed skills |
| **Session Isolation** | Each conversation is fully stateless and independent, with a rolling history window for coherent dialogue |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.9+, Flask |
| AI Model | Google Gemini 2.5 Flash |
| Vector Store | ChromaDB + SentenceTransformers (`all-MiniLM-L6-v2`) |
| Dataset | [MentalChat16K](https://huggingface.co/datasets/ShenLab/MentalChat16K) + MedDiaLog (HuggingFace) |
| LLM Enrichment | Ollama (local), OpenRouter (free-tier models) |
| Frontend | HTML, CSS, Vanilla JS |

---

## How It Works

```
User selects or describes a scenario
        ↓
ChromaDB retrieves the most semantically similar case studies
        ↓
Retrieved cases prime ERIICA's system prompt + populate the Patient Profile panel
        ↓
User begins the conversation — ERIICA roleplays as the patient
        ↓
SPIKES / NURSE / SIC Guide available as reference throughout
        ↓
Session ends → ERIICA evaluates the conversation and provides a structured debrief
```

---

## Getting Started

### Prerequisites

- Python 3.9+
- A [Gemini API key](https://aistudio.google.com/app/apikey)
- [Ollama](https://ollama.com/) installed locally (for case enrichment only)

### Installation

```bash
git clone https://github.com/dylanwongjh/project-sic-chatbot.git
cd project-sic-chatbot
pip install -r requirements.txt
```

Add your Gemini API key to `config.py`:

```python
GEMINI_API_KEY = "your_key_here"
```

### Building the Case Library

Run these steps in order to populate ChromaDB with enriched case files:

```bash
# 1. Extract case studies from HuggingFace
python extract_cases.py

# 2. Enrich cases with LLM-generated feature annotations
python build_enriched_cases.py

# 3. Ingest enriched cases into ChromaDB
python ingest.py

# 4. (Optional) Wipe and reingest from scratch
python reset_and_reingest.py
```

### Running the App

```bash
python app.py
```

Open `http://127.0.0.1:5002` in your browser.

---

## Project Structure

```
project-sic-chatbot/
├── app.py                    # Flask app — routes, session management, AI logic
├── config.py                 # API key configuration
├── extract_cases.py          # Pull case studies from HuggingFace
├── build_enriched_cases.py   # LLM-based feature enrichment
├── ingest.py                 # Batch ingest into ChromaDB
├── reset_and_reingest.py     # Wipe and repopulate ChromaDB
├── chroma_db/                # Persisted ChromaDB vector store
├── case_studies/             # Source case-study text files
├── static/
│   ├── style.css
│   ├── script.js
│   └── grid-background.png
└── templates/
    └── index.html
```

---

## Clinical Frameworks

ERIICA incorporates three widely used palliative care communication frameworks as in-session references:

- **SPIKES** — A six-step protocol for delivering serious news (Setting, Perception, Invitation, Knowledge, Empathy, Summary)
- **NURSE** — An empathic response framework for acknowledging emotion (Naming, Understanding, Respecting, Supporting, Exploring)
- **SIC Guide** — The Serious Illness Conversation Guide for structured goals-of-care discussions

---

## Acknowledgements

- Adapted from **Project Mindfull**, reoriented for clinical communication training.
- Case data sourced from [ShenLab/MentalChat16K](https://huggingface.co/datasets/ShenLab/MentalChat16K) and MedDiaLog on HuggingFace.
- Clinical frameworks (SPIKES, NURSE, SIC Guide) are widely used in palliative and serious illness care education.
