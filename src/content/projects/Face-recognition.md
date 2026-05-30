---
title: "Edge AI Face Recognition System"
description: "A production-grade, real-time face recognition system engineered for resource-constrained ARM devices — combining FaceNet embeddings, MTCNN detection, and direct Raspberry Pi GPIO integration for physical access control."
date: 2024-05-12
category: "research"
banner: "/Face-Recognition.gif"
github: "https://github.com/Se2007/face-recognition"
tags: ["Python", "PyTorch", "Computer Vision", "Edge AI", "Raspberry Pi", "OpenCV", "FaceNet", "MTCNN"]
---

 
## 📌 Overview
 
Most face recognition projects lean on public benchmarks — clean, well-lit, studio-quality images that bear little resemblance to real deployment conditions. This project takes the opposite approach: **the dataset was collected from scratch**, capturing real subjects under varied lighting, distances, angles, and environmental conditions via video recording. This deliberate collection strategy is what drives the system's robustness — not just the model architecture.
 
The result is a complete, self-contained pipeline covering every stage: dataset construction, embedding generation, identity enrollment, and real-time recognition.
 
## 📦 Custom Dataset — Built from Video
 
The most consequential engineering decision in this project was rejecting off-the-shelf datasets entirely.
 
**The collection workflow (`vid2imgs.py`):** Video footage was recorded of each subject across diverse real-world conditions — varying distances from camera, different ambient lighting (indoor, outdoor, artificial), multiple head angles, and partial occlusions. `vid2imgs.py` then processes each video file with `cv2.VideoCapture`, iterates over every frame using a `tqdm`-tracked loop, and writes each frame as a uniquely named `.jpg` into a per-identity subdirectory (`./dataset/{id}/`). The naming convention — `{video_name}_{frame_index:04d}.jpg` — ensures deterministic ordering and zero filename collisions across subjects.
 
This approach yields hundreds to thousands of training samples per identity from a single recording session, with natural variation that no static photo collection can replicate.
 
**Why this matters:** A model trained on posed photographs memorizes appearance, not identity. By training on frames sampled from continuous video, the model learns to recognize a person across the same intra-class variance it will encounter at inference time — motion blur, partial profiles, and inconsistent illumination included.
 
## 🧠 Recognition Pipeline
 
### Stage 1 — Face Detection: MTCNN
The Multi-Task Cascaded Convolutional Network runs a three-stage cascade (`P-Net → R-Net → O-Net`) to simultaneously localize faces and predict 5-point facial landmarks for alignment. MTCNN is initialized with deliberately permissive thresholds (`[0.4, 0.5, 0.5]`) and a `min_face_size` of 60px to handle subjects at varying distances from the camera — a direct consequence of how the dataset was collected.
 
A custom `detect_box` method is monkey-patched onto the MTCNN instance via `MethodType`, fusing detection and crop extraction into a single call and eliminating redundant forward passes during the real-time loop.
 
### Stage 2 — Embedding Generation: InceptionResnetV1
Aligned face crops are passed through an `InceptionResnetV1` backbone pretrained on VGGFace2 (3.3M images, 9,000+ identities), producing a **128-dimensional embedding vector** per face. This pretrained foundation gives the model strong general biometric priors, while fine-tuning on the custom dataset adapts those representations to the specific identities and conditions in scope.
 
**Enrollment (`embedding.py`):** For each subject, `embedding.py` replays the source video through the full MTCNN → ResNet pipeline, extracting one embedding per successfully detected frame. Each embedding is stored as a row in a `pandas` DataFrame and persisted to a CSV (`data1.csv`), indexed by subject ID. This gives the recognition stage a dense, variance-rich reference set rather than a single averaged template.
 
### Stage 3 — Identity Matching (`recog.py`)
At inference time, the live frame embedding is passed through a sigmoid-activated head fine-tuned on the custom dataset. A confidence threshold of `pred > 0.98` gates the final authorized/unauthorized decision — a deliberately high bar chosen because the training data's real-world variation means a genuine match will score consistently high, while impostors fall well below it.
 
## 🗂️ Codebase Structure
 
| File | Role |
|---|---|
| `vid2imgs.py` | Dataset construction — video-to-frame extraction with per-identity folder organization |
| `embedding.py` | Enrollment — generates and persists per-subject embedding databases from video |
| `recog.py` | Real-time inference loop — live MTCNN detection, encoding, and identity decision |
| `face_detection.py` | Isolated MTCNN validation — standalone bounding box visualization for dataset QA |
| `compare.py` | Embedding distance analysis — threshold calibration and pairwise similarity inspection |
| `utils.py` | Shared helpers — checkpoint loading and model state restoration |
| `main.ipynb` | Exploratory notebook — architecture experiments and qualitative embedding analysis |
 