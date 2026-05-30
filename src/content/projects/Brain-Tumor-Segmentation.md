---
title: "Medical Image Segmentation: Brain Tumor"
description: "A systematic deep learning benchmark for automated brain tumor segmentation on BraTS20 MRI scans — comparing custom U-Net, pretrained encoder U-Nets, U-Net++, DeepLabV3+, and TransUNet across multiple loss functions and hyperparameter configurations."
date: 2024-10-18
category: "research"
banner: "/Brain-Tumor-Segmentation.gif"
github: "https://github.com/Se2007/Brain-Tumor-segmentation"
demo: "https://www.youtube.com/watch?v=g4hedxSF0Qk"
tags: ["Python", "PyTorch", "Medical Imaging", "Segmentation", "UNet", "TransUNet", "BraTS", "Computer Vision"]
---

## 🧠 Clinical Motivation

Brain tumor segmentation from MRI is one of the most consequential tasks in neuro-oncology. Precise delineation of the tumor core, the surrounding edema, and the enhancing rim directly informs surgical planning, radiation targeting, and longitudinal response monitoring. Manual segmentation by radiologists is slow, expensive, and subject to inter-observer variability — factors that become critical bottlenecks in time-sensitive treatment pathways.

This project automates that process. Given a multi-modal MRI scan, the model simultaneously delineates all three clinically relevant sub-regions with pixel-level accuracy, reducing a task that takes radiologists tens of minutes to a sub-second inference.

<br />

## 🎥 Project Demo

<div class="video-wrapper">
  <iframe
    src="https://www.youtube.com/embed/g4hedxSF0Qk"
    title="Brain Tumor Segmentation Demo"
    allowfullscreen
  ></iframe>
</div>

<br />

## 📊 Dataset

Trained and evaluated on the **BraTS20 (Brain Tumor Segmentation 2020)** challenge dataset — the standard clinical benchmark in neuro-oncology deep learning, featuring expert-annotated multi-institutional MRI scans of glioma patients.

**Why BraTS20 is challenging:**
* Each patient study contains **four MRI modalities**: T1, T1-contrast-enhanced (T1ce), T2, and FLAIR — all co-registered to the same anatomical space, providing complementary biological signals. The model receives all 4 channels as input.
* Tumors are highly **heterogeneous** in shape, size, location, and appearance, with no two cases presenting identically.
* Class imbalance is severe: background voxels vastly outnumber tumor voxels, requiring specialized loss functions rather than naive cross-entropy.

**Data Pipeline (`Benchmark/dataset.py` — `BraTS20` class):** The loader is invoked as a callable, returning a configured `DataLoader` in a single line (`dataset.BraTS20("./Benchmark", 'train', mini=True, memory=False)(batch_size=32)`). It supports a `mini` mode for rapid hyperparameter sweeps on a data subset, and a `memory` flag for RAM caching during full training runs.

## 🏗️ Benchmarked Architectures

The `methods/` directory implements five distinct segmentation topologies, all sharing the same training loop and evaluation harness to ensure fair comparison:

### 1. Custom U-Net (From Scratch)
A pure PyTorch implementation with 4-channel input (one per MRI modality) and 4-channel output (one per tumor sub-region + background). Serves as the interpretable baseline — its performance directly measures what can be achieved without pretrained weights.

### 2. U-Net with Pretrained Encoders (`pre_train_unet`)
The encoder is replaced with an **EfficientNet-B1** backbone pretrained on ImageNet, accessed via `segmentation_models_pytorch`. Transfer learning from natural images to MRI is non-trivial — the domain gap is significant — but pretrained encoders still provide meaningful low-level feature priors (edge detectors, texture filters) that accelerate convergence and improve boundary precision.

### 3. U-Net++ (`UnetPlusPlus`)
A nested, densely connected architecture that bridges the semantic gap between encoder and decoder. Intermediate nodes (`X^{i,j}`) re-aggregate multi-scale feature maps progressively before they reach the decoder, substantially improving performance on tumors with diffuse, irregular boundaries — a known weakness of standard U-Net.

### 4. DeepLabV3+ (`DeepLab`)
Replaces the U-Net decoder with **Atrous Spatial Pyramid Pooling (ASPP)**: parallel dilated convolutions at rates `{6, 12, 18}` expand the effective receptive field without any spatial downsampling. This allows the model to capture large-scale context (the full extent of a diffuse edema region) while retaining high-resolution detail at boundaries — critical for the FLAIR sub-region.

### 5. TransUNet
A hybrid CNN-Transformer architecture. A ResNet backbone extracts local CNN features, which are then flattened into a sequence and processed by Transformer encoder blocks to model long-range spatial dependencies across the full brain volume. Particularly advantageous for capturing symmetry-based spatial priors (e.g., recognizing that a structure on one hemisphere is anomalous relative to the other).

## ⚙️ Training Infrastructure

### Training Loop (`utils.py`)
The `train_one_epoch` and `evaluate` functions wrap the full forward-backward pass with `tqdm`-based progress tracking, `MeanMetric` loss accumulation (weighted by batch size), and Dice metric updates via `torchmetrics`. Checkpointing (`save` / `load`) persists the full training state — model weights, optimizer state, and learning rate scheduler — enabling seamless resume from any epoch.

Reproducibility is enforced by `set_seed`, which seeds `numpy`, `torch`, and `torch.cuda` from a single integer. The `optimizer_to` helper correctly migrates all Adam/SGD momentum buffers and gradient tensors to the target device after checkpoint restoration — a commonly missed implementation detail that causes silent performance degradation.

### Hyperparameter Search (`HP.py`)
A structured grid search across learning rates `[0.08, 0.1, 0.3]` × weight decays `[1e-2, 1e-4, 1e-6]`, producing a 3×3 result matrix per architecture. Results are rendered as a color-coded `PrettyTable` at runtime — the best configuration highlighted in **green**, the second-best in **yellow** — enabling immediate visual identification of the optimal `(lr, wd)` pair without post-processing. The optimizer is SGD with `momentum=0.9`, chosen for its stronger generalization properties over Adam on medical imaging tasks.

### Loss Function
`smp.losses.DiceLoss` in `multilabel` mode — optimizing volumetric overlap directly rather than per-pixel cross-entropy. This is the standard choice for class-imbalanced segmentation: Dice loss is inherently insensitive to the background class dominating the gradient signal.

### Accuracy Evaluation (`Accuracy.ipynb`)
Post-training evaluation notebook that loads saved checkpoints and computes the **Dice Similarity Coefficient (DSC)** across all tumor sub-regions, producing the comparative benchmark table across all five architectures.

## 🗂️ Codebase Structure

| Path | Role |
|---|---|
| `Benchmark/dataset.py` | BraTS20 loader — multi-modal NIfTI parsing, mini mode, RAM caching |
| `methods/unet.py` | Custom U-Net + `pre_train_unet` (EfficientNet-B1 encoder) |
| `methods/unetplusplus.py` | U-Net++ with dense nested skip connections |
| `methods/deeplab.py` | DeepLabV3+ with ASPP and EfficientNet-B1 backbone |
| `methods/transunet.py` | TransUNet — CNN feature extraction + Transformer encoder |
| `utils.py` | Training loop, evaluation, checkpointing, reproducibility |
| `HP.py` | Color-coded hyperparameter grid search (LR × WD) |
| `train.ipynb` | Full training notebook with epoch-level metric logging |
| `segment.ipynb` | Inference notebook — loads checkpoint, generates color-coded overlay masks |
| `Accuracy.ipynb` | Comparative benchmark — DSC across all architectures |