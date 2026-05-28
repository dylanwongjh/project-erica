# ERIICA — Empathy & Reassurance in Illness Conversation Assistant

> An AI-powered roleplay chatbot helping nurses and healthcare professionals prepare for Serious Illness Conversations (SICs) with end-of-life patients.

---

## What is ERIICA?

Serious Illness Conversations are among the most emotionally demanding moments in clinical practice. Many of such conversations require empathy, care, and knowing how to properly engage with the patients in this manner. However, these skills are only acquired through much practice, honed with experiences with patients with diverse needs and varying situations, which may not always be readily available for trainees. ERIICA gives healthcare professionals a safe, private space to practice and rehearse these conversations before they happen in real life.

Users are able to describe their patient's situation, or select from a large database of different scenarios, and ERIICA responds as a simulated patient based on the particular context. The AI draws on a deep library of clinical dialogues with varying situations, curated from the MentalChat16K dataset. Built-in reference frameworks (SPIKES and NURSE) are available at any point during the conversation, conveniently placed within the user chat interface.

---

## Features

- **Scenario-driven Sessions** — Users describe their specific situation before the chat begins, priming ERICA with relevant context.
- **RAG-powered Responses** — ERICA retrieves the most semantically similar case from a ChromaDB vector store to ground each session in realistic patient behaviour.
- **Patient Profile Panel** — Displays a structured snapshot of the matched case (emotions, cognitive state, underlying needs) to guide the practitioner's approach.
- **Conversational Frameworks** — SPIKES, NURSE, and SIC Guide available as in-session reference tabs.
- **Session Isolation** — Each conversation is stateless and independent, with a rolling chat history window to maintain coherent dialogue.
- **Comfortable UI** — Designed with accessibility and emotional sensitivity in mind.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask |
| AI | Google API (Gemini-2.5-Flash) |
| Vector store | ChromaDB |
| Dataset | MentalChat16K (ShenLab / HuggingFace) |
| LLM enrichment | Ollama (local), OpenRouter (free-tier models) |
| Frontend | HTML, CSS, Vanilla JS |

---

## How It Works

```
The user inputs/selects a scenario that they will like to practice
        ↓
The AI searches through ChromaDB for the most similar case examples
        ↓
Case used to prime ERIICA's system prompt + build Patient Profile based on most similar case
        ↓
User starts the conversation with ERIICA
        ↓
Frameworks (SPIKES / NURSE ) available for reference throughout
        ↓
ERIICA grades the user's conversation based on the frameworks used
```

---

## Getting Started

### Prerequisites

- Python 3.9+
- [Ollama](https://ollama.com/) installed locally (for case enrichment)
- Gemini API key
- ChromaDB

### Setup

```bash
git clone https://github.com/your-username/eriica.git
cd eriica
pip install -r requirements.txt
```

Add your API keys to a `.env` file:

```
ANTHROPIC_API_KEY=your_key_here
```

### Building the Case Library

Run these steps in order to populate ChromaDB with enriched case files:

```bash
# 1. Extract case studies from HuggingFace datasets
python extract_cases.py

# 2. Clean and enrich cases with LLM-generated feature annotations
python build_enriched_cases.py

# 3. Ingest enriched cases into ChromaDB (batched for large datasets)
python ingest.py

# 4. (Optional) Reset ChromaDB and reingest from scratch
python reset_and_reingest.py
```

### Running the App

```bash
python app.py
```

Navigate to `http://127.0.0.1:5002` in your browser.

---

## Project Structure

```
eriica/
├── app.py                    # Flask app, API routes, session management
├── extract_cases.py          # Pull case studies from HuggingFace
├── build_enriched_cases.py   # LLM-based feature enrichment for cases
├── ingest.py                 # Batch ingest into ChromaDB
├── reset_and_reingest.py     # Wipe and repopulate ChromaDB
├── static/
│   ├── style.css
│   ├── script.js
│   └── projectmindfull.png
└── templates/
    └── index.html
```

---

## Acknowledgements

- Built on top of **Project Mindfull**, adapted for clinical communication training.
- Case data sourced from [ShenLab/MentalChat16K](https://huggingface.co/datasets/ShenLab/MentalChat16K) and MedDiaLog on HuggingFace.
- Conversational frameworks (SPIKES, NURSE, SIC Guide) are widely used in palliative care education.
