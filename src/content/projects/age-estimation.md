---
title: "Age Estimation in the Wild"
description: "Comparative study of three deep learning architectures for real-world age estimation, including MiVolo, ResNet, and Multi-Input GhostFaceNet — trained on IMDB, UTKFace, and CACD datasets."
date: 2023-10-8
category: "research"
banner : '/age-estimation.png'
github: "https://github.com/Se2007/Age-Estimation"
tags: ["Python", "PyTorch", "Computer Vision", "Deep Learning", "Age Estimation", "WandB"]


---

## 📌 Overview

Real-world age estimation suffers significantly from face occlusions, extreme lighting, and poor image quality. Traditional single-face models often degrade under these conditions. 

This project solves this by shifting from localized facial analysis to **holistic contextual feature extraction**. By processing both facial features and body context simultaneously, the system delivers robust, real-time predictions even when the face is partially hidden.

## 📊 Supported Datasets
The pipeline features a unified data abstraction layer (`dataset.py`) that standardizes and handles on-the-fly normalization for three major benchmarks:
* **IMDB-WIKI:** Over 500k images for extensive pre-training.
* **UTKFace:** Highly diverse dataset tracking ages from 0 to 116.
* **CACD:** Cross-age celebrity dataset containing longitudinal variations over a decade.

## 🧠 Developed Methodologies

### 1. MiVolo (Multi-Input Vision Outlooker) 
* **Dual-Stream Topology:** Processes standardized `Face Crops` and `Body Crops` in parallel.
* **VOLO Backbone:** Utilizes outlook attention for fine-grained facial textures, and class-attention  layers for global contextual embedding.
* **Loss Function:** Optimized via Smooth L1 / MAE loss to remain robust against outlier web labels.

### 2. Deep ResNet Baseline
* **Architecture:** A standard ResNet backbone coupled with a custom linear regression head.
* **Purpose:** Serves as a high-speed control baseline to precisely quantify the performance gains brought by adding body context.

### 3. Multi-Input GhostFaceNet 
* **Efficiency:** Designed for resource-constrained environments by deploying **Ghost Convolutions** (generating feature maps via cheap linear operations).
* **Result:** Drastically minimizes FLOPs and parameter count without losing the benefits of dual-stream context.

## 🛠️ Infrastructure & Features

* **Experiment Tracking:** Integrated with **Weights & Biases (WandB)** for real-time loss, metric logging, and hyperparameter tuning (`hyper.py`).
* **Live Inference:** `Camera.py` leverages OpenCV for dynamic bounding-box extraction and real-time webcam age tracking.
* **Production-Ready Pipeline:** Fully deterministic training loop with cross-epoch model checkpointing (weights, optimizer states, and schedulers).