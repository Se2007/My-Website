---
title: "Medical Image Segmentation: GI Tract"
description: "Deep learning pipeline for automated segmentation of gastrointestinal organs in MR-Linac scans, enabling precise radiation dose delivery for GI tract cancer treatment — benchmarking UNet, UNet++, and DeepLabV3 with multiple encoder backbones."
date: 2024-02-08
category: "research"
banner: "/v.gif"
github: "https://github.com/Se2007/Medical-Image-Segmentation"
demo: "https://www.youtube.com/watch?v=U9xRgetbRTg"
tags: ["Python", "PyTorch", "Medical Imaging", "Segmentation", "UNet", "Computer Vision", "Kaggle"]
---

## 🏥 Clinical Motivation

Radiation therapy for gastrointestinal tract cancers demands sub-millimeter precision. The stomach and intestines shift position daily responding to digestion, breathing, and organ filling what makes static treatment plans dangerous. 

While modern MR-Linac systems acquire real-time MRI scans during radiation delivery, manually segmenting these anatomical structures before each session is incredibly labor-intensive and introduces inter-observer variability. 

**The Solution:** This project automates the segmentation process. Given an MRI scan, the model simultaneously and accurately delineates three critical structures in real-time:
* 🔴 **Large Bowel** (Red Mask)
* 🟢 **Small Bowel** (Green Mask)
* 🔵 **Stomach** (Blue Mask)

This automation enables oncologists to adapt radiation beams to daily organ positions, heavily targeting tumors while strictly sparing healthy tissue.

<br />

## 🎥 Project Demo

<div class="video-wrapper">
  <iframe 
    src="https://www.youtube.com/embed/U9xRgetbRTg"
    title="Medical Image Segmentation Demo"
    allowfullscreen
  ></iframe>
</div>

<br />



## 📊 Dataset & Pipeline

Trained on the **UW-Madison GI Tract Image Segmentation** clinical dataset, featuring high intra-patient variability, varying contrast, and thin-slice MRI scans.

**Custom Data Pipeline (`dataset.py`):**
* Decodes complex Run-Length Encoded (RLE) masks on-the-fly into binary segmentation maps.
* Stacks masks into 3-channel tensors (one channel per target organ).
* Implements robust data augmentation and memory-efficient loading with RAM caching capabilities.

## 🧠 Benchmarked Architectures

This repository moves beyond a single model, offering a systematic benchmark of multiple segmentation topologies:

### 1. Custom U-Net (From Scratch)
A pure PyTorch implementation featuring successive 3x3 convolution blocks, a deep context bottleneck, and transposed convolution upsampling with skip connections to preserve fine spatial details.

### 2. U-Net with Pre-trained Encoders
Utilizes transfer learning by replacing the standard encoder with ImageNet-pretrained backbones:
* **EfficientNet-B4:** Delivers the highest accuracy-to-FLOP ratio.
* **ResNet-50 / ResNet-101:** Provides exceptionally stable feature hierarchies.
* **SE-ResNeXt:** Integrates Squeeze-and-Excitation blocks for channel-wise attention, boosting sensitivity to subtle, ambiguous organ boundaries.

### 3. U-Net++
A nested, densely connected architecture that bridges the semantic gap between encoder and decoder feature maps. Intermediate nodes aggregate features progressively, heavily improving performance on complex, varying shapes.

### 4. DeepLabV3+
Leverages Atrous Spatial Pyramid Pooling (ASPP). By using dilated convolutions, it expands the receptive field to capture multi-scale context without downsampling—proving highly effective for irregular, non-convex structures like the small bowel.

## 🔬 Loss Functions & Optimization

Medical datasets suffer from severe class imbalance (background pixels vastly outnumber organ pixels). To counter this, the `loss/` module implements a highly modular suite:
* **Binary Cross-Entropy (BCE):** The standard pixel-wise baseline.
* **Dice Loss:** Directly optimizes the volumetric overlap, completely bypassing background imbalance.
* **BCE + Dice Hybrid:** The optimal standard—BCE stabilizes gradients while Dice forces boundary accuracy.
* **Focal & Tversky Loss:** Advanced formulations to down-weight easy negatives and control the recall-precision tradeoff.

![Segmentation Result](/Medical-Image_Segmentation.png)

## 🛠️ Infrastructure & Inference

* **Inference Engine (`segment.py`):** A streamlined script that loads models, processes raw scans, and generates side-by-side color-coded overlays (mirroring clinical annotation standards) for intuitive visual evaluation.
* **Experiment Runner (`Experiments.py`):** Automates multi-model and multi-loss training runs with automatic result logging.
* **Hyperparameter Sweeps (`HP.py`):** Systematic grid-search architecture over learning rates, weight decays, and loss combinations.