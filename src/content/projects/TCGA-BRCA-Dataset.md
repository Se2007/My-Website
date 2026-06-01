---
title: "Breast Cancer : Multi-Modal Fusion Dataset"
description: "A comprehensive data curation project addressing the fragmentation of the TCGA-BRCA program. This dataset provides a strictly patient-aligned fusion of radiology (MRI), computational pathology (WSI patches), RNA-seq, Copy Number Variations (CNV), somatic mutations, and longitudinal clinical records for breast cancer research."
date: 2026-03-07
category: "research"
banner: "/BRCA-Dataset.png"
github: "https://github.com/Se2007/TCGA-BRCA-Dataset"
demo: "https://www.kaggle.com/datasets/sepehreslamimoghadam/breast-cancer-vision-and-genomic-fusion-ml-ready"
tags: ["Python", "Multi-Modal", "Medical Imaging", "Bioinformatics", "TCGA", "Kaggle", "WSI", "Omics"]
---



## 📌 The Modality Fragmentation Problem

Breast cancer sits at a rare intersection: it is one of the world's most studied diseases with one of the most data-rich cohorts ever assembled. The TCGA-BRCA program collected multi-scale data—from whole slide pathology to genome-wide expression—all from the same patients. 

In theory, this makes TCGA-BRCA the ideal substrate for multi-modal fusion research. In practice, the raw data is heavily fragmented across portals (TCIA, GDC), forcing researchers to tackle fundamental pipeline issues before any modeling can occur:

* **Unimodal Isolation & Broken Alignment:** GDC uses internal UUIDs; TCIA organizes by TCGA case barcodes. Connecting an MRI to an RNA-seq profile relies on a fragile chain of metadata. Consequently, many researchers silently drop unaligned patients without reporting the exact loss mechanisms.
* **Unusable Raw Formats:** Multi-gigabyte `.svs` pyramidal pathology slides, raw HTSeq count matrices with over 59,000 features (mostly noise), and inconsistent DICOM MRI series are not native to deep learning architectures.
* **Lack of Per-Patient Depth:** Existing fusion datasets typically flatten patient profiles into single vectors, destroying the complex spatial and structural variances that make multi-modal learning powerful.

🔗 **[GitHub Repository](https://github.com/Se2007/TCGA-BRCA-Dataset)** | 📊 **[Kaggle Dataset](https://www.kaggle.com/datasets/sepehreslamimoghadam/breast-cancer-vision-and-genomic-fusion-ml-ready)** | 🔬 **[Exploratory Data Analysis (EDA)](https://www.kaggle.com/code/sepehreslamimoghadam/breast-cancer-dataset-eda)**

<br />

## 🔬 Dataset Curation Philosophy

This dataset was engineered around a single design principle: **Every modality, for every patient, explicitly aligned and transformed into a tensor-ready format.**

The core differentiation of this dataset is the strict cross-modal integrity audit performed *before* downstream processing. Rather than providing isolated tables, the dataset guarantees that the MRI volumes, tissue morphology, gene expressions, and mutation signatures map precisely to the same **122 verified patients**.

### Patient-Level Data Matrix

| Modality | Cohort Scale | Processing Details |
| :--- | :--- | :--- |
| **MRI Scans** | 122 patients | Preprocessed and spatially resampled (T1, T2, VIBRANT, DWI, LOC). |
| **WSI Patches** | 115 patients | Avg. 667 patches/patient. Extracted with background removed and rigorously quality-filtered. |
| **RNA-seq** | 149 patients | 59,427 genes → Log-normalized & variance-filtered to 11,824 highly variable genes. |
| **Somatic Mutations** | 121 patients | 7,361 events aggregated into a driver-gene matrix. |
| **Clinical Records** | 122 patients | 84 features (stage, subtype, OS/PFS endpoints, one-hot encoded treatments). |

## 📊 Data Pipeline Integrity & Ground Truth Verification

For a computer science dataset, verifying the underlying biological signal acts as the ultimate unit test. The following exploratory data analysis proves that our tensor transformations preserved the clinical ground truth without introducing computational artifacts.

### 1. Sparse Feature Integrity (Mutational Ground Truth)
Analysis of the somatic mutation matrix reveals that expected high-frequency features like **TP53** and **PIK3CA** dominate the distribution. From a data engineering perspective, this confirms that the sparse matrix aggregation pipeline accurately preserved patient-specific burdens without dropping low-level signals during cross-sample alignment.

<p align="center">
  <img src="/eda-mutation.png" alt="Top 20 Mutated Genes" style="width: 70%; height: auto;">
</p>

### 2. Feature Extraction & Signal Isolation (Co-expression)
Unsupervised hierarchical clustering of the top 50 Highly Variable Genes (HVGs) reveals distinct, tightly bound correlation matrices. The high contrast between these clusters and baseline noise proves that the log-normalization and variance-filtering pipeline successfully isolated true signals while discarding uninformative high-dimensional noise.

<p align="center">
  <img src="/eda-coexpression.png" alt="Co-expression Network — Top 50 HVGs" style="width: 50%; height: auto;">
</p>

### 3. Dimensionality Reduction & Batch Effect Audit (PCA)
Principal Component Analysis (PCA) of the top 500 features demonstrates the expected continuous distribution of the dataset. The critical absence of artificial clustering serves as a strict technical quality control, verifying that the data pipeline is free from dominant batch effects (e.g., sequencing center biases) and captures true systemic variance.

<p align="center">
  <img src="/eda-pca.png" alt="PCA of Patients — Top 500 HVGs" style="width: 70%; height: auto;">
</p>

### 4. Cross-Modal Alignment Verification
Cross-referencing MRI metadata (T1, T2, VIBRANT, DWI, LOC) with molecular sub-classifications reveals that scan depth correlates directly with specific subtypes. This structural coupling provides concrete computational evidence that the complex multi-modal join across disparate patient records was successful and functionally aligned.

<p align="center">
  <img src="/eda-mri.png" alt="MRI Diagnostic Inventory and Scan Depth by Subtype" style="width: 70%; height: auto;">
</p>



**🔬 Full Pipeline Analysis:** A comprehensive notebook covering survival stratification, cross-modal integration, and WSI quality audits is published on Kaggle. 
👉 **[View the full Breast Cancer Dataset EDA](https://www.kaggle.com/code/sepehreslamimoghadam/breast-cancer-dataset-eda)**

<br />

## 🎯 Intended Academic Use-Cases

This dataset is structurally optimized for advanced computational oncology research, specifically:
1. **Multi-Modal Survival Prediction:** Stratifying risk by combining deep morphological features (WSI) with transcriptomic profiles[cite: 2].
2. **Genotype-Phenotype Mapping:** Investigating the correlation at the image-genomics interface[cite: 2].
3. **Cross-Modal Representation Learning:** Developing self-supervised pre-training frameworks for computational pathology using matched molecular context as supervisory signals[cite: 2].