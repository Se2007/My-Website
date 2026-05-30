---
title: "Lightweight Language Modeling: A Comparative Benchmark"
description: "Comparative study of lightweight neural architectures for language modeling, benchmarking LSTM variants and Transformer-based models on WikiText-2 with a focus on perplexity and computational efficiency."
date: 2023-11-21
category: "research"
banner : '/Language-Modeling.png'
github: "https://github.com/Se2007/Language-Modeling"
tags: ["Python", "PyTorch", "NLP", "Transformers", "LSTM", "Language Modeling", "WandB"]
---

## Overview
 
Language modeling is the foundational task underpinning modern NLP — the ability to assign meaningful probabilities to sequences of tokens. This project takes a rigorous comparative approach: rather than defaulting to the largest available model, the central question is *which lightweight architecture achieves the best perplexity-to-parameter tradeoff?*
 
Five distinct architectures are implemented from scratch, trained on a unified pipeline, and benchmarked against each other on the WikiText-2 corpus.


## Dataset & Pipeline

**WikiText-2** serves as the primary benchmark. Extracted from high-quality Wikipedia articles, it preserves full punctuation, capitalization, and numbers, making it a highly realistic and challenging corpus compared to older datasets.

* **Unified Pipeline (`dataset.py`):** Handles automated tokenization, vocabulary construction, and sequence batching (seq_len = 70).
* **Dual Tensor Generation:** Generates batchified inputs optimized for both stateful recurrence (LSTMs) and attention-masked parallelization (Transformers).


## Developed Architectures

### The LSTM Family
**1. Standard Deep LSTM:** A multi-layer baseline that utilizes cell states to capture long-range dependencies and mitigate vanishing gradients.

**2. AWD-LSTM (ASGD Weight-Dropped LSTM):** An advanced regularization framework applied over the LSTM backbone. This pushes the recurrent architecture to its absolute limits using orthogonal techniques:
* **DropConnect:** Stochastically zeroes out hidden-to-hidden weight matrices rather than activations for a stronger regularization signal.
* **Variational Dropout:** Applies a locked dropout mask across all time steps in a sequence to preserve temporal structures.
* **AR / TAR Regularization:** Penalizes abnormally large activations and sharp differences between consecutive hidden states.
* **ASGD Optimizer:** Averaged Stochastic Gradient Descent triggers when validation loss plateaus, guiding the model toward a flatter, more generalizable minimum.

### The Transformer Family
**3. Encoder-Only Transformer:** A standard multi-head self-attention stack with full bidirectional context. (Primarily a baseline for architecture comparison).

**4. Causal Decoder-Only Transformer:** The backbone of modern LLMs. Employs strict masked self-attention (via upper-triangular masking) to ensure autoregressive generation without data leakage.

**5. Adaptive Transformer (Compute-Efficient Variant):** The most optimized architecture in this project, integrating two major efficiency upgrades:
* **Adaptive Softmax:** Replaces the expensive linear vocabulary projection with a hierarchical cluster. Frequent words retain full dimensions, while rare words are compressed into lower-dimensional subspaces, exploiting the Zipfian distribution of language to drastically cut FLOPs.
* **Adaptive Input Embeddings:** Mirrors the output logic—dynamically allocating embedding dimensions based on token frequency.

## Training Infrastructure & Tooling

* **Metric:** Perplexity (PPL) — calculated dynamically as exp(loss) via CrossEntropyLoss.
* **Experiment Telemetry:** Fully instrumented with Weights & Biases (WandB) for epoch-level tracking of train/val loss and perplexity.
* **Smart Checkpointing:** Saves complete operational states (weights, optimizers, schedulers). Files are dynamically named by validation loss (e.g., `TR4.312.pth`) for instant identification of top-performing iterations.
* **Strict Reproducibility:** Deterministic execution enforced via fixed seeds across NumPy, PyTorch, and CUDA backends.
* **Inference & Tuning:** `generate.py` handles nucleus and temperature sampling for qualitative analysis, while `HP.py` orchestrates systematic hyperparameter sweeps (LR, weight decay, dropout).