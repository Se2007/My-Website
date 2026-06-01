---
title: "OncoGemma: Multi-Modal Oncology Agent"
description: "An autonomous virtual tumor board — fine-tuned MedGemma-4B with multi-modal fusion of MRI, whole slide images, and genomic profiles, featuring a dual-agent zero-hallucination inference engine for precision breast cancer treatment planning."
date: 2026-02-25
category: "research"
banner: "/oncogema3.png"
github: "https://github.com/CancerAiAssistant/OncoGemma"
demo: "https://www.kaggle.com/competitions/med-gemma-impact-challenge/writeups/new-writeup-1769871399933"
tags: ["Python", "MedGemma", "LLM", "Multi-Modal", "LoRA", "Oncology", "Fine-tuning", "Next.js", "Google", "Edge-AI", "Knowledge-Distillation", "PyTorch"]
---




## The Clinical Problem

A tumor board is medicine at its most sophisticated — a weekly meeting where oncologists, radiologists, pathologists, and geneticists convene around a single patient's case to reach consensus on treatment. The process integrates information that no single specialist holds: the radiologist reads the MRI, the pathologist reads the biopsy, the geneticist reads the mutation profile, and the medical oncologist synthesizes all of it into a treatment plan.

This convergence of orthogonal expertise is what makes tumor boards effective. It is also what makes them scarce. Many hospitals don't have them. Many patients never reach one.

OncoGemma is an attempt to encode that process.

## What OncoGemma Does

OncoGemma is an autonomous AI system that ingests three clinical modalities simultaneously — **radiology (DICOM MRI)**, **histopathology (whole slide images)**, and **genomics (MAF somatic mutations)** — and produces a structured tumor board consensus: surgical recommendations, pharmacological protocols, and targeted therapy options based on the patient's specific mutation profile.

It was developed for the **Google Med-Gemma Impact Challenge 2026** and built on Google's `MedGemma-4B` — a medically pre-trained vision-language model — fine-tuned and extended with a novel dual-agent inference architecture designed specifically to eliminate clinical hallucinations.


<div class="video-wrapper">
  <iframe
    src="https://www.youtube.com/embed/JttSE5JZfcM"
    title="OncoGemma End-to-End Clinical Demonstration"
    allowfullscreen
  ></iframe>
</div>




## Core Architecture

<p align="center">
  <img src="/oncogemma.jpg" alt="OncoGemma Master Architecture Topology" style="width: 100%; height: auto;">
</p>

### 1. Multi-Modal Orthogonal Fusion

Processing gigabyte-scale medical imaging alongside genomic data requires more than concatenating modalities. OncoGemma uses Google's siglip-base-patch16-224 as independent, frozen vision encoders for both MRI and H&E pathology images — freezing the weights to preserve foundational spatial features while drastically mitigating memory overhead under local hardware constraints. Two distinct encoders are deployed because macro-structural tumor morphology (MRI) and micro-cellular tissue architecture (histopathology) require fundamentally different feature extraction.

Custom trainable projection layers map these visual embeddings directly into the latent semantic space of the MedGemma-4B tokenizer. The model doesn't process images and text separately and combine their outputs — it is given a unified embedding where visual and textual tokens coexist in the same representational space. The model inherently "sees" the tumor before generating clinical text.


<h4 align="center">Multi-Modal Input Modality Realization & Clinical Profiles</h4>

<p align="center">
  <img src="/6b814f318833a337d74b70ba5c489251.png" alt="Random Aligned Patient MRI Samples" style="width: 100%; height: auto; margin-bottom: 10px;">
  <img src="/9afd52bfbf59f9a5a255c4b7044ef217.png" alt="Random Aligned Patient Pathology Patch Samples" style="width: 100%; height: auto; margin-bottom: 15px;">
</p>
<p align="center">
  <img src="/eda-mutation.png" alt="Somatic Mutation Landscape" style="width: 37%; display: inline-block; margin-right: 0.00001%;">
  <img src="/eda-mri.png" alt="MRI Subtype Volumetrics" style="width: 62%; display: inline-block;">
</p>
<p align="center">
  <em>Figure 2: Comprehensive multi-modal input pipeline tokenized by OncoGemma. Top Rows: Actual aligned client-side patient MRI sequences showing distinct macro-structural variations and high-resolution H&E histopathology tissue micro-structures extracted directly in-memory. Bottom Rows: Accompanying downstream cohorts distribution showing driver gene somatic mutation profiles (left) and diagnostic scan depths stratified by PAM50 molecular subtypes (right).</em>
</p>

### 2. Knowledge Distillation via Teacher-Student Paradigm

Fine-tuning a 4B parameter model on clinical oncology planning from scratch is computationally prohibitive and data-scarce. OncoGemma uses a programmatic distillation pipeline:

**The Teacher (Gemini 2.5 Flash)** Acted as a multi-tier ensemble distillation pipeline to generate gold-standard clinical reasoning data. Gemini 3 Pro was utilized to map hyper-complex, multi-step oncological reasoning chains, while Gemini 2.5 Flash scaled the synthetic label generation protocol under rigorous academic constraints — acting as a "Professor of Clinical Oncology" to produce citation-grounded therapeutic rationales from raw somatic mutations.

**The Student (MedGemma-4B)** learns from these synthetic labels via **Low-Rank Adaptation (LoRA)**, with a high-rank configuration (`r=128`, `alpha=256`) targeting attention and MLP projections across `q_proj`, `v_proj`, `gate_proj`, and others. The high rank is deliberate — oncology nomenclature is dense and the model needs sufficient capacity to absorb it without catastrophic forgetting of its base medical knowledge.

<p align="center">
  <img src="/d02f404a3280c9fb6b741e2ac3ace25a.png" alt="Professor-Student Distillation Convergence Curve" style="width: 80%; height: auto;">
</p>

### 3. Masked Cross-Entropy via Custom Head Wrapper

To maximize training stability and prevent the visual representations from corrupting the linguistic gradient updates under strict local hardware limitations, we engineered a custom model head wrapper. Mathematically, the vision encoder outputs are projected into the unified sequence but are dynamically sliced off prior to calculating the cross-entropy loss:

<br />

$$L = -\sum_{t \in \text{text tokens}} \log P(x_t \mid x_{<t}, V_{\text{tokens}})$$

<br />
By penalizing the cognitive engine strictly on text generation rather than visual reconstruction, multi-modal alignment became immensely more memory-efficient, effectively bypassing Out-of-Memory (OOM) limits during local optimization loops.

### 4. Dual-Agent Zero-Hallucination Inference

This is the architecture's most consequential innovation. A hallucinated drug interaction or misidentified mutation pathway in a clinical recommendation is not an acceptable error rate — it is a patient safety issue.

OncoGemma splits inference into two strictly isolated cognitive phases:

**Phase 1 — The Specialist (Fact Extraction):** With LoRA adapters active, this agent analyzes all multi-modal inputs and produces a detailed but raw medical draft. It operates as a pure data-mining entity — comprehensive, but unstructured.

**Phase 2 — The Chief Editor (Logical Structuring):** The LoRA adapters are dynamically disabled (`model.llm.disable_adapter()`), returning to the unbiased reasoning capability of the base MedGemma model. With `do_sample=False` (greedy decoding) and repetition penalties engaged, this agent acts as a strict compiler. It strips conversational artifacts, resolves internal contradictions, and formats the output into rigidly defined tumor board headers.

The key insight is that the fine-tuned model knows oncology; the base model reasons cleanly. Separating these roles produces a system that is both medically informed and logically disciplined — without either capability contaminating the other.

### 5. In-Memory Gigabyte Data Processing

Handling raw TCGA data at inference time poses severe I/O bottlenecks. The custom `DataProcessor` uses dynamic `BytesIO` buffers and strategic chunking to parse `.maf` (Mutation Annotation Format) and `.svs` files entirely in memory — bypassing OS-level path length restrictions and enabling real-time patch extraction and Base64 encoding for the Next.js frontend without writing temporary files to disk.

<div class="video-wrapper">
  <iframe
    src="https://www.youtube.com/embed/y39G7AERgNY"
    title="OncoGemma Demo"
    allowfullscreen
  ></iframe>
</div>


## The Application

The full system is deployed as a Next.js web application that accepts clinical uploads (MRI DICOM series, WSI patches, MAF mutation files), passes them through the OncoGemma inference pipeline, and returns a structured tumor board consensus report in real time.

<p align="center">
  <img src="/oncogemma.gif" alt="OncoGemma Live Web Application Real-Time Ingestion Walkthrough" style="width: 100%; height: auto; border-radius: 8px;">
</p>
<p align="center">
  <em>Figure 3: Live end-to-end user interaction walkthrough within the OncoGemma Next.js ecosystem. The client interface facilitates seamless localization of client-side patient folders containing heterogeneous DICOM series, digital pathology patches, and MAF mutation arrays, routing them directly into the local in-memory parsing pipeline for zero-latency inference initialization.</em>
</p>

<br />

> 🚀 **Open-Source Reproducibility:** The complete, production-ready inference pipeline is fully documented, containerized, and publicly executable on Kaggle:
> 
> **[Run OncoGemma Inference Notebook ↗](https://www.kaggle.com/code/sepehreslamimoghadam/oncogemma-inference)**

<br />

## Why This Matters

The clinical value of a multi-modal tumor board is well-established. The bottleneck has always been access — to specialists, to time, to infrastructure. A system that can approximate that consensus from raw clinical data, reliably and without hallucination, has direct implications for underserved clinical settings where tumor boards don't exist and oncology expertise is sparse.

OncoGemma does not claim to replace clinical judgment. It claims to make the inputs to that judgment — a structured, contradiction-free synthesis of multi-modal data — available at scale.

## Future Roadmap

- [ ] Extend to additional cancer types beyond breast cancer
- [ ] Integrate longitudinal patient records for treatment response tracking
- [ ] Add uncertainty quantification so the model flags low-confidence outputs
- [ ] Clinical validation study with oncology partners