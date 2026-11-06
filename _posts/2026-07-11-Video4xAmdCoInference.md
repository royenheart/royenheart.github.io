---
title: "视频插帧与超分：原理、AMD 异构栈与 Windows 协同推理实践"
date: 2026-07-11 14:50 +0800
categories: [AI]
tags: [插帧, 超分, NPU]
---

> 最近在尝试 AI 动画生成，但主流剪辑软件内置的超分与插帧功能大多需要付费会员。手头恰好有一台搭载 AMD Ryzen 7 8845H 的 ThinkBook 14+，配备了 Radeon 780M 核显、Ryzen AI NPU 以及 14 GB 共享内存。由于常见的开源视频增强工具尚未原生支持 NPU 加速，我萌生了编写一套 **GPU + NPU 异构协同推理框架**的想法，借此压榨异构硬件潜力、加速视频增强流水线。
>
> **2026.07.12 更新**：遗憾的是，目前 Windows 与 WSL 环境下的底层原生支持与算子生态仍不够完善，实际端到端加速效果尚不尽如人意，但整个拆分与调优过程依然极具工程参考价值。

## 1. 视频插帧与超分基础

### 1.1 问题定义与流水线编排

**视频插帧（Video Frame Interpolation, VFI）** 的核心目标是：给定相邻视频帧 $I_0$ 与 $I_1$，合成任意中间时刻 $t \in (0,1)$ 的过渡帧 $I_t$，从而加密时间轴采样、提升画面运动连贯性。从数学形式上看，模型旨在学习以下非线性映射：

$$
f_\theta: (I_0, I_1, t) \mapsto I_t
$$

其中 $t = 0.5$ 对应最常见的“两帧之间插一帧”（即倍帧）场景；而支持任意连续 $t$ 的模型则可实现更高倍率的时间重采样或丝滑的可变慢动作。典型应用场景包括：

- **影视与动画帧率提升**：将传统的 24/30 fps 视频平滑提升至 48/60 fps 甚至更高帧率。
- **体育转播与安防监控**：基于常规采集帧率生成高时间分辨率的慢动作回放。
- **实时流媒体丢帧补偿**：在网络抖动或采集掉帧时实时合成缺失画面，改善观看体验。
- **静态图像序列过渡**：在近重复照片之间生成自然的“伪视频”平滑过渡效果。

**视频超分辨率（Video Super-Resolution, SR）** 的核心目标则是：从低分辨率帧 $I_{LR}$ 中恢复出具备丰富高频细节的高分辨率帧 $I_{HR}$。与仅关注空间域重建的单图超分（SISR）不同，视频超分还必须应对视频压缩伪影、传感器噪声以及至关重要的**帧间时序一致性**（即同一物体纹理在相邻帧之间不能出现抖动或闪烁）。常见的空间放大倍率为 $\times 2$ 或 $\times 4$，且二次元动漫内容通常需要针对线条与色块特化训练的专用权重。

在实际工程落地中，往往需要将插帧与超分串联成完整的视频增强流水线。根据两者的先后顺序，存在两种典型的架构权衡：

- **先插帧再超分（VFI $\rightarrow$ SR）**：中间帧在低分辨率空间生成，光流估计与运动补偿的算力及显存峰值相对可控；但后续超分模块需要处理的帧数翻倍，整体吞吐受限于超分耗时。
- **先超分再插帧（SR $\rightarrow$ VFI）**：超分仅需处理原始低帧率序列，且后续运动估计在高分辨率画面上进行，有助于捕捉更精细的运动边界；但高分辨率特征图会导致插帧阶段的显存占用与内存带宽压力成倍攀升。

### 1.2 系统负载特征对比

从底层计算机体系结构与异构调度的视角来看，视频插帧与视频超分展现出截然不同的计算与访存特征：

| 评估维度 | 视频插帧 (VFI) | 视频超分 (SR) |
| :--- | :--- | :--- |
| **输入形态** | 成对（或多帧滑动窗口）输入，强时序依赖 | 单帧独立输入为主（视频 SR 可引入时序对齐模块） |
| **核心算子形态** | 多尺度光流/运动估计 + 双线性网格重采样 (Warp) + 掩码融合 | 深层规则卷积 / RRDB 残差特征提取 + 像素重排/插值上采样 |
| **访存特征** | 高分辨率特征图频繁读写；`grid_sample` / Warp 带来不规则随机访存 | 卷积访存高度规则，但中间特征通道深；Tile 切分需处理边界重叠 |
| **张量形状约束** | 金字塔下采样要求宽高对齐至 32 或 64 的整数倍 | 部署至编译型 NPU 时通常要求固定 Tile 尺寸（如 $256^2$、$512^2$） |
| **并行与拆分粒度** | 帧对间流水线并行；前后端子图可跨 Execution Provider (EP) 拆分 | 帧内空间 Tile 数据并行；主干特征提取 (`body`) 与上采样 (`upsample`) 可跨 EP 拆分 |
| **画质敏感点** | 遮挡区域鬼影、大位移模糊、细小结构闪烁 | 虚假幻觉纹理、边缘振铃效应、压缩块效应放大 |
| **典型系统瓶颈** | 内存带宽受限 + 不规则采样导致的缓存未命中 | 峰值浮点/整型算力受限 + 深层激活值的显存占用 |

结合上述特征，在进行 GPU + NPU 异构映射时需要重点考量以下四个工程维度：

1. **运动估计与深度特征提取**：此类模块主要由规则卷积构成，算术强度（Arithmetic Intensity）高，天然契合高吞吐矩阵/向量加速器；但由于编译型 NPU 强依赖静态张量形状（Static Shape）进行离线图编译，若输入视频分辨率多变，直接部署会面临频繁重编译或大面积 Padding 的开销。
2. **空间重采样（Warp / `grid_sample`）**：本质属于典型的 Gather 型随机访存操作，空间局部性差、缓存命中率低。GPU 凭借专用纹理采样单元（Texture Units）和高带宽缓存体系能够高效应对，而采用静态数据流架构的 NPU 处理此类不规则算子往往得不偿失，甚至会触发频繁的主机端回退（Fallback）。
3. **视频编解码与色彩空间转换**：视频流的解复用、解码、YUV/RGB 色彩转换及重编码应尽量卸载至 CPU 多线程或专用媒体硬件引擎（如 AMD AMF），避免挤占推理加速器的计算与带宽资源。
4. **时间局部性与流水线并发模式**：插帧必须严格沿时间轴按帧对推进（或维护多帧滑动窗口），因此其异构协同主要体现为**跨帧对的阶段流水线重叠（Pipeline Overlapping）**；而单帧超分的各个空间切片（Tile）彼此独立，更容易在单帧内部或相邻帧之间通过 **Tile 级任务队列**实现 GPU 与 NPU 的协同并行。

### 1.3 视频插帧核心原理

在深度学习普及之前，传统视频插帧主要依赖经典变分光流法（Optical Flow）估计像素级运动矢量，再沿流场进行前向或反向重采样。经典光流将“亮度恒定假设”与“空间平滑先验”建模为能量最小化优化问题，优势在于数学可解释性强，但在剧烈运动（大位移）、物体遮挡以及弱纹理区域极易出现流场破碎与撕裂伪影。

深度学习方法并未抛弃光流这一物理先验，而是将“[运动估计](https://openaccess.thecvf.com/content_cvpr_2018/html/Jiang_Super_SloMo_High_CVPR_2018_paper.html) $\rightarrow$ [深度感知/软溅射重采样 (Warp)](https://openaccess.thecvf.com/content_CVPR_2019/html/Bao_Depth-Aware_Video_Frame_Interpolation_CVPR_2019_paper.html) $\rightarrow$ [残差融合](https://openaccess.thecvf.com/content_CVPR_2020/html/Niklaus_Softmax_Splatting_for_Video_Frame_Interpolation_CVPR_2020_paper.html)”全链路逐步替换为可端到端训练的神经网络模块，并在大规模视频数据集上直接以真实中间帧作为监督信号。典型的深度插帧管线可概括为三个核心阶段：

1. **双向/中间运动估计**：预测 $I_0 \leftrightarrow I_1$ 的双向光流，或直接回归从目标时刻 $t$ 指向前后帧的中间光流（Intermediate Flow）。
2. **运动补偿（Backward/Forward Warping）**：利用预测流场对输入帧或深度特征图进行网格重采样，将其对齐至中间时刻 $t$。
3. **遮挡感知融合与残差合成**：通过预测融合掩码（Mask）与上下文特征，消除遮挡引起的重影与多源冲突，输出最终插值帧 $I_t$。

在众多开源方案中，**[RIFE（Real-Time Intermediate Flow Estimation）](https://arxiv.org/abs/2011.06294)**（[ECCV 2022](https://doi.org/10.1007/978-3-031-19781-9_36)）凭借出色的速度与质量平衡成为实时工程部署的首选（相比之下，针对极大位移场景优化的 [FILM](https://arxiv.org/abs/2202.04901) 计算开销更大）。RIFE 提出了由粗到细的 **IFNet（Intermediate Flow Network）** 架构，绕过了传统“先求双向光流再做流场反转”的繁琐步骤，直接端到端估计中间光流与融合掩码。在训练阶段，RIFE 引入了特权蒸馏机制（Privileged Distillation）：教师网络（Teacher）可额外访问真实的中间帧 $I_t$ 以生成高质量的中间流监督信号；学生网络（Student）仅以 $(I_0, I_1, t)$ 为输入，在训练中对齐教师输出，而在实际推理部署时仅需运行轻量化学生网络。得益于全卷积无复杂自定义算子的结构设计，RIFE 成为诸如 [rife-ncnn-vulkan](https://github.com/nihui/rife-ncnn-vulkan) 等高性能推理工具的默认基座模型。

### 1.4 视频超分核心原理

深度学习超分辨率的演进经历了从浅层重建到感知生成对抗的跨越：

- **[SRCNN](http://mmlab.ie.cuhk.edu.hk/projects/SRCNN.html)**：作为深度学习超分的开山之作，将传统稀疏编码超分的“图像块特征提取—非线性映射—高分重建”三阶段理论完全等价映射为三层卷积神经网络，首次验证了端到端学习 $LR \rightarrow HR$ 映射的优越性。
- **[ESRGAN](https://openaccess.thecvf.com/content_ECCVW_2018/papers/11133/Wang_ESRGAN_Enhanced_Super-Resolution_Generative_Adversarial_Networks_ECCVW_2018_paper.pdf) 与 [Real-ESRGAN](https://openaccess.thecvf.com/content/ICCV2021W/RealAI/html/Wang_Real-ESRGAN_Training_Real-World_Blind_Super-Resolution_With_Pure_Synthetic_Data_ICCVW_2021_paper.html)**：早期超分模型大多在“理想双三次下采样（Bicubic Downsampling）”生成的合成数据对上训练，一旦面对真实世界中历经复杂退化的视频或图片，极易产生涂抹感或刺眼的伪影。[Real-ESRGAN](https://doi.org/10.1109/ICCVW54120.2021.00217) 的核心突破在于提出了**高阶退化建模（High-Order Degradation Modeling）**——在训练阶段通过多轮随机组合模糊、非对称噪声、缩放与 JPEG/视频重压缩操作，逼真模拟真实世界的复杂低清退化过程；其生成器沿用了 ESRGAN 强大的 **RRDB（Residual-in-Residual Dense Block）** 主干网络，并针对自然影像与二次元动漫分别开源了专用权重（详见 [Real-ESRGAN 官方仓库](https://github.com/xinntao/real-esrgan)）。

在工程推理落地上，Real-ESRGAN 的核心痛点在于**高分辨率显存爆炸与边界拼接**：当输入为 1080p 甚至 4K 视频帧时，深层 RRDB 特征图无法整图放入有限的显存或 NPU 片上缓存，必须采用 **Tile（分块推理）** 策略——将大图切分为固定大小的子块逐一推理后再拼接还原；同时为消除分块边界处的卷积截断伪影，相邻 Tile 之间必须保留一定宽度的重叠区（Overlap Padding），并在拼接时进行羽化或裁剪。

### 1.5 常见工程部署栈与开源生态

将 PyTorch / TensorFlow 中的算法原型转化为可分发的终端生产力工具，通常遵循三步工程链路：

1. **计算图导出与图优化**：将动态图固化并导出为 ONNX、ncnn `param/bin` 或 TensorRT Engine 等中间表示，完成算子融合与常量折叠。
2. **跨平台推理运行时（Runtime）**：调用 [ncnn](https://github.com/tencent/NCNN)、ONNX Runtime (ORT)、DirectML 或 Vulkan Compute 等底层执行引擎。
3. **多媒体全链路编排**：构建“视频硬件解码 $\rightarrow$ 色彩转换与 Padding 预处理 $\rightarrow$ 异步推理队列 $\rightarrow$ 裁剪融合后处理 $\rightarrow$ 硬件重编码”的高吞吐流水线。

目前社区中主流的相关开源工程如下表所示：

| 开源项目 | 核心定位与技术特点 |
| :--- | :--- |
| **[Video2X](https://github.com/k4yt3x/video2x)** | 集成了多种超分与插帧后端的统一视频增强框架，提供现代 C++/Qt6 界面与容器化部署 |
| **[ncnn](https://github.com/tencent/NCNN)** | 腾讯开源的针对移动端与跨平台深度优化的高性能神经网络推理框架，无第三方依赖，原生支持 Vulkan GPU 加速 |
| **[rife-ncnn-vulkan](https://github.com/nihui/rife-ncnn-vulkan)** | 基于 [ncnn](https://github.com/tencent/NCNN) 与 Vulkan 实现的跨平台 RIFE 实时视频插帧工具 |
| **[Real-ESRGAN](https://github.com/xinntao/real-esrgan)** | 官方训练与推理仓库，包含基础 PyTorch 脚本与 [Real-ESRGAN-ncnn-vulkan](https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan) 可执行实现 |
| **[Flowframes](https://github.com/n00mkrad/flowframes)** | 面向 Windows 用户的易用型插帧 GUI 工具，内部封装了 RIFE、DAIN 等多种 NCNN/CUDA 实现 |

## 2. AMD 异构软硬件软件栈

### 2.1 完整架构分层与三条部署路径

理解 AMD 平台的异构协同能力，首先需要梳理其从底层微架构到上层推理框架的完整软硬件映射关系：

- **自顶向下分层链路**：`上层应用 (Application)` $\rightarrow$ `深度学习框架 (PyTorch / ONNX)` $\rightarrow$ `推理引擎 (ONNX Runtime / MIGraphX)` $\rightarrow$ `平台抽象与执行提供者 (Execution Providers)` $\rightarrow$ `算子与图编译库` $\rightarrow$ `内核驱动 (Driver)` $\rightarrow$ `异构硬件单元 (Zen CPU / RDNA iGPU·dGPU / CDNA Instinct / XDNA NPU / Versal AIE)`。

针对不同形态的计算平台，AMD 提供了三条差异化的软件部署路径：

![三条部署](https://img.royenheart.com/2026/07/12/9edc23cb.jpg)

1. **Linux + [ROCm](https://www.amd.com/en/products/software/rocm.html)（数据中心与工作站）**：通过 PyTorch 或 ONNX Runtime 对接 HIP、[MIGraphX](https://github.com/ROCm/AMDMIGraphX) 与 ROCm EP，驱动基于 [CDNA 架构](https://www.amd.com/en/technologies/cdna.html) 的 Instinct 加速卡及部分 RDNA 显卡。
2. **Windows AI PC（消费级轻薄本与工作站，如 Ryzen 8845H）**：以 ONNX Runtime 为核心调度枢纽，向上承接业务管线，向下同时挂载 **DirectML EP**（驱动 RDNA3 架构 Radeon 780M 核显）与 **VitisAI EP**（驱动基于 [AMD XDNA 架构](https://www.amd.com/en/technologies/xdna.html) 的 [Ryzen AI NPU](https://doi.org/10.1109/mm.2024.3423692)）。
3. **Adaptive / Embedded（自适应与嵌入式计算）**：基于 [Vitis AI](https://github.com/xilinx/vitis-ai) 与 [mlir-aie](https://github.com/xilinx/mlir-aie) 编译工具链，直接面向 Versal AI Engine 进行底层数据流编程。

相关核心开源组件与官方文档入口汇总如下：

| 组件名称 | 核心职责与生态定位 |
| :--- | :--- |
| **[ROCm](https://www.amd.com/en/products/software/rocm.html)** | AMD 面向数据中心与 Radeon GPU 的开源异构计算软件栈总集 |
| **[MIGraphX](https://github.com/ROCm/AMDMIGraphX)** | AMD 官方图优化与高性能推理编译器，可独立或作为 ORT 后端运行 ONNX 模型 |
| **[Vitis-AI](https://github.com/xilinx/vitis-ai)** | 面向 AMD XDNA NPU、自适应 SoC 与 Alveo 加速卡的 AI 推理开发栈与示例库 |
| **[mlir-aie](https://github.com/xilinx/mlir-aie)** | 基于 MLIR 的 AI Engine 底层编译基础设施，提供贴近硬件的 Python/C++ 编程接口 |
| **[AMD Quark](https://quark.docs.amd.com/)** | AMD 新一代跨平台模型量化工具包，原生支持 PyTorch 与 ONNX 的 INT8/BF16/FP8 等量化校准并对接 [Ryzen AI NPU](https://quark.docs.amd.com/latest/supported_accelerators/ryzenai/index.html) |

### 2.2 Windows AI PC 下两类 EP 的工程特性对比

在搭载 Ryzen 7 8845H 的 Windows 环境中，通过 ONNX Runtime 调度 DirectML EP（iGPU）与 Vitis AI EP（NPU）时，两者在工程约束上存在显著互补与差异：

| 对比维度 | DirectML EP (Radeon 780M iGPU) | Vitis AI EP (Ryzen AI NPU) |
| :--- | :--- | :--- |
| **底层硬件架构** | RDNA3 图形与计算架构 | [AMD XDNA](https://www.amd.com/en/technologies/xdna.html) 空间数据流架构（AI Engine 阵列） |
| **动态 Shape 支持** | **良好**：原生支持运行时变长输入与动态分辨率切换 | **极受限**：强依赖静态固定张量形状（Static Shape），需提前针对固定尺寸编译与量化 |
| **算子覆盖率与兼容性** | **极高**：覆盖绝大多数 PyTorch 导出的标准 ONNX 算子及 `GridSample`/Warp | **有限**：专为规整的 `Conv2d`、矩阵乘与逐元素算子加速设计，复杂控制流或特殊采样需回退 |
| **共享内存与零拷贝** | **支持**：可通过 D3D12 资源绑定与 ORT `IOBinding` 减少主机内存往返拷贝 | **支持但有约束**：虽物理上共享 APU 统一内存，但跨 EP 传递时需显式管理 Pinned Memory 槽位 |

## 3. Windows 异构协同推理实践：`video4x`

为验证上述异构设计，我在个人工程实验包 `video4x`（位于仓库 `apps/video4xinterpolation` 目录下）中实现了一套面向 **Windows + Ryzen AI 软件栈**的协同推理管线。该项目的核心目标是将 **[RIFE](https://arxiv.org/abs/2011.06294) 视频插帧**与 **[Real-ESRGAN](https://github.com/xinntao/real-esrgan) 视频超分**封装为既可独立运行、又可串联编排的算子，默认利用 **GPU（DirectML）+ NPU（VitisAI）** 协同加速。

默认运行环境基于 Ryzen AI Software 构建的 Conda 环境 `ryzen-ai-1.7.1`（预装 VitisAI EP、DirectML EP 及定制版 ONNX Runtime），并通过离线导出与 [AMD Quark](https://quark.docs.amd.com/) 量化脚本将公开的 PyTorch 权重转换为适配异构拆分的 ONNX 模型组。

### 3.1 总体架构与模块划分

`video4x` 的端到端数据流与子图拆分架构如下图所示：

![video4x GPU+NPU 协同推理数据流](https://img.royenheart.com/2026/07/12/7f46c38b.jpg)

整个系统在架构设计上包含三大核心机制：

- **`EnhancePipeline` 灵活串联机制**：支持“先插帧后超分”（`Interpolate (RIFE) -> temp.mp4 -> Superresolve (Real-ESRGAN)`）或“先超分后插帧”（`Superresolve (Real-ESRGAN) -> temp.mp4 -> Interpolate (RIFE)`）两种流水线模式。
- **RIFE 阶段拆分流水线（基于 Practical-RIFE v4.26）**：将插帧网络拆分为前段 **Stage A**（编码器与早期 `block01`，运行于 DirectML GPU，向主机输出中间光流 `flow`、掩码 `mask` 与特征 `feat`）与后段 **Stage B**（后续细化 `block234` 与合成，优先运行于 VitisAI NPU，遇到编译或运行异常时支持平滑回退至 DirectML GPU）。
- **Real-ESRGAN 算子拆分流水线**：采用固定尺寸（$256 \times 256$ 或 $512 \times 512$）的重叠切片（Tile），将计算极其密集的残差主干 **`body.onnx`（RRDB）** 强制绑定至 VitisAI NPU 执行，而将涉及空间尺寸放大的 **`upsample.onnx`** 交由 DirectML GPU 完成，最后在主机侧完成高分辨率切片的羽化融合与拼接。

代码仓库的分层模块职责对应如下：

| 架构层次 | 核心代码模块 | 主要工程职责 |
| :--- | :--- | :--- |
| **任务编排层** | `video4x.job.pipeline` | 实现 `EnhancePipeline`，负责视频解码、临时文件管理与多算子串联调度 |
| **插帧算子层** | `ops.interpolate` $\rightarrow$ `RifeInferenceEngine` | 负责 $2\times$ 插帧调度、32 倍数对齐 Padding 与固定分辨率档位绑定 |
| **超分算子层** | `ops.superresolve` | 负责重叠 Tile 切分与羽化拼接、模型导出管理及超分 Backend 调度 |
| **运行时底座** | `runtime.backends`、`session`、`_ep_probe` | 封装 Execution Provider 可用性探测、子进程安全验证、Session 创建与注册表 |
| **模型量化层** | `quant.quark_quant` | 调用 [AMD Quark](https://quark.docs.amd.com/) 与 ORT 量化工具生成适配 NPU 的静态量化 ONNX 模型 |

### 3.2 视频插帧实现：RIFE v4.26 协同流水线

#### 3.2.1 子图拆分导出与固定档位对齐

在模型导出阶段，我们基于 Practical-RIFE v4.26 权重将计算图沿深度方向切分为两个独立的 ONNX 子图：

- **Stage A (`rife_stage_encode_block01.onnx`)**：涵盖输入帧特征编码器与前两个 IFBlock（`block0`、`block1`），负责估算粗粒度光流、融合掩码、上下文特征以及初步重采样（Warp）后的图像张量。
- **Stage B (`rife_stage_block234.onnx`)**：涵盖后续细化模块（`block2`、`block3`、`block4`）与最终融合层，负责精细化修正流场与掩码并输出合成帧。

为兼顾 NPU 对静态形状的要求与主流视频分辨率，导出脚本针对 720p 与 1080p 预先做 32 倍数向上对齐，生成 **`736x1280`** 与 **`1088x1920`** 两档固定输入形状的 ONNX 模型，存放于 `models/onnx/fixed/<HxW>/` 目录。在推理启动前，框架会自动将输入帧 Padding 至 32 的整数倍，并匹配绑定最接近的固定档位模型。

#### 3.2.2 `SplitPipelineBackend` 协同执行与回退机制

Windows 环境下插帧后端 `SplitPipelineBackend` 的完整执行逻辑如下图所示：

![RIFE split-pipeline 在 Windows 上的流程](https://img.royenheart.com/2026/07/12/3f2906f3.jpg)

**1. 初始化与子进程安全探测阶段**

- **环境探测**：调用 `probe_execution_providers()` 检测当前系统中 DirectML 与 VitisAI EP 的可用状态。
- **硬件偏好链配置**：根据两阶段算子特性，分别设定不同的执行提供者回退链（`->` 代表降级顺序）：

| 推理阶段 | EP 偏好与回退顺序 | 核心设计考量 |
| :--- | :--- | :--- |
| **Stage A** | `DirectML` $\rightarrow$ `CPU` | 包含多尺度特征编码与早期 Warp 准备，算子形态更契合 GPU 通用计算与纹理采样 |
| **Stage B** | `VitisAI` $\rightarrow$ `DirectML` $\rightarrow$ `CPU` | 后段卷积结构相对规整稠密，优先卸载至 NPU 分担负载；若编译/执行失败则平滑降级至 GPU |

- **量化模型优选与子进程隔离 Probe**：对于 Stage B，若检测到经 [AMD Quark](https://quark.docs.amd.com/) 或 ORT 静态量化生成的 `rife_stage_block234_quant.onnx`，则优先纳入候选列表，否则使用浮点模型。由于底层 VitisAI 驱动在遇到不支持的算子或编译异常时可能直接触发 C++ 层崩溃（Crash），框架会对每个候选模型启动独立的**子进程 VitisAI Probe** 进行试运行验证；若全部候选模型均探测失败，则自动从偏好链中剔除 `vitisai`，回退至 DirectML/CPU 执行，并将具体失败原因记录至 `fallback_reason` 统计字段以便排查。
- **会话实例化**：验证通过后，在同一主进程内分别创建 Stage A 与 Stage B 两个独立的 `OrtSession` 实例。

**2. 逐帧协同推理阶段**

对于每一对已完成 32 倍数对齐并绑定固定档位的相邻帧 $I_0, I_1$ 及目标时刻 $t$（默认为 $0.5$，扩展为与画面同高宽的 `timestep` 张量）：

1. **Stage A 前向计算（DirectML GPU）**：执行 IFNet 前段推理，初步估计双向中间流并完成第一轮特征重采样，输出四类核心中间张量：
   - `flow`：指向前后两帧的中间光流场；
   - `mask`：未归一化的融合权重 Logits；
   - `feat` / `f0` / `f1`：供后续细化模块使用的多尺度上下文特征；
   - `warped_img0` / `warped_img1`：基于粗光流初步重采样对齐后的前后帧。
2. **主机侧张量组装（Host Feed）**：将 Stage A 产出的中间张量与原始输入 `img0`、`img1`、`timestep` 在主机内存缓冲区中打包整合，作为 Stage B 的输入字典。
3. **Stage B 细化与融合（VitisAI NPU 优先）**：执行 IFNet 后段细化，残差更新光流与掩码并完成最终重采样，随后按照 Sigmoid 加权公式合成中间帧 `merged`（其中 $\sigma$ 表示 Sigmoid 激活函数）：

$$
I_t = I_0^{\mathrm{warp}} \cdot \sigma(m) + I_1^{\mathrm{warp}} \cdot \bigl(1 - \sigma(m)\bigr)
$$

> **工程权衡说明**：在 RIFE 管线中，我们特意设计了**允许 Stage B 动态离开 NPU** 的柔性契约。因为光流插帧图链路较长且夹杂多次双线性采样与拼接操作，若强行锁死 NPU 执行，一旦遭遇编译器兼容性问题就会导致整条视频处理任务硬中断；通过子进程预探测与自动降级机制，能够在保障任务鲁棒性的前提下尽可能压榨 NPU 算力。

#### 3.2.3 `dual-stream` 时间重叠与 `IOBinding` 空间零拷贝优化

在 Ryzen 7 8845H 这类具备 APU 统一物理内存架构的平台上，如果仅做简单的串行拆分，GPU 与 NPU 会处于“你跑我等”的交替空闲状态，且中间张量在应用层频繁触发 `numpy` 内存拷贝也会显著吃掉带宽收益。为此，我们在 `split-pipeline` 基础上进一步实现了两层正交优化：**跨帧对的时间流水重叠（`dual-stream`）**与**跨阶段的中间张量共享缓冲（`IOBinding` 零拷贝）**。

![RIFE dual-stream 与 IOBinding](https://img.royenheart.com/2026/07/12/72886537.jpg)

- **`dual-stream`（跨帧对时间重叠）**：利用多线程池打破帧对间的串行等待。当处理连续帧对序列时，让第 $N$ 对帧的后段推理 **Stage B($N$)（运行于 VitisAI NPU）** 与第 $N+1$ 对帧的前段推理 **Stage A($N+1$)（运行于 DirectML GPU）** 在时间轴上并发重叠执行，使 iGPU 与 NPU 硬件流水线同时保持满载。
- **`IOBinding + memory_mode=shared`（跨阶段空间零拷贝）**：
  1. **双缓冲槽位预分配**：在管线启动时按固定档位形状执行一次 Warm-up，并预先分配两个共享帧槽位 `SharedFrameSlot`（双槽设计天然适配潜在的 A $\parallel$ B 流水深度）。
  2. **锁页内存（Pinned Memory）常驻**：每个槽位预先持有分配在主机锁页内存上的 `OrtValue` 对象，涵盖输入张量（`img0`、`img1`、`timestep`）、Stage A 的全部中间输出张量以及 Stage B 的最终输出 `merged`。
  3. **底层指针直连绑定**：通过 ONNX Runtime 的 `bind_ortvalue_input` / `bind_ortvalue_output` 与 `run_with_iobinding` 接口，将 Stage A 输出的 `OrtValue` 内存地址（同一 `data_ptr`）**直接绑定**为 Stage B 的输入，彻底消除 Python 应用层在每帧之间对 `flow`、`mask`、`feat` 等大尺寸张量的 `numpy` 往返拷贝开销。
  4. **最小化边界拷贝**：整条链路仅在视频解码器将原始帧写入槽位缓冲区时发生一次写入，以及最终将合成帧 `merged` 取出送入编码器时执行一次 `np.copy`，将内存带宽消耗压降至理论下限。

### 3.3 视频超分实现：Real-ESRGAN 协同流水线

#### 3.3.1 模型三段式导出与重叠 Tile 切分

超分模块支持 `x2plus`、`x4plus` 与动漫专用的 `x4plus_anime` 等多种 [Real-ESRGAN](https://github.com/xinntao/real-esrgan) 预设权重。在导出阶段，脚本将生成器网络拆分为三个 ONNX 文件：

- **`realesrgan_body.onnx`**：包含输入预处理、`conv_first`、堆叠的 **RRDB 残差密集块主干**以及 `conv_body` 残差连接，输出高维深层特征图 `feat`。
- **`realesrgan_upsample.onnx`**：包含最近邻插值上采样（$\times 2$ 堆叠）与重建卷积层，将深层特征 `feat` 还原为高分辨率图像块 `hr`。
- **`realesrgan_full.onnx`**：未拆分的完整端到端模型，供单执行提供者（Single-EP）整图回退模式使用。

针对 NPU 静态形状约束，`realesrgan_body.onnx` 额外导出了 **`256x256`** 与 **`512x512`** 两档固定 Tile 尺寸模型。面对高分辨率视频帧时，推理引擎采用滑动窗口策略：核心有效区域按步长 `fixed_tile - 2 * tile_pad` 步进切分，每个切片四周通过镜像填充（`reflect pad`）精确补齐至目标固定宽高，送入模型推理后再裁剪掉填充边缘并按重叠区羽化融合。

#### 3.3.2 超分后端架构：`split-pipeline` 与 `single-ep`

与插帧模块相呼应，Windows 平台上的超分后端同样提供了“异构协同切分（`split-pipeline`）”与“整图单后端回退（`single-ep`）”两种运行模式：

![Real-ESRGAN 后端在 Windows 上的流程](https://img.royenheart.com/2026/07/12/a64ee8e6.jpg)

在默认的 **`SrSplitBackend`（`split-pipeline`）** 模式下，我们制定了比插帧更为严格的硬件执行契约：

| 推理阶段 | 绑定 ONNX 模型 | EP 执行契约 | 核心算子与计算内容 |
| :--- | :--- | :--- | :--- |
| **Body 阶段** | `realesrgan_body.onnx` | **强制绑定 VitisAI NPU**：若探测或绑定失败直接抛出 `RuntimeError`（禁止静默回退至 DirectML） | 输入归一化 $\rightarrow$ `conv_first` $\rightarrow$ 堆叠 **RRDB** 密集卷积主干 $\rightarrow$ 残差连接输出特征 `feat` |
| **Upsample 阶段** | `realesrgan_upsample.onnx` | **强制绑定 DirectML GPU** | 对特征 `feat` 执行最近邻 $\times 2$ 插值 + 卷积重建（按 $\times 2 / \times 4$ 倍率重复） $\rightarrow$ 输出高分块 `hr` |

> **为什么 Body 阶段禁止静默回退？** 因为 Real-ESRGAN 的绝大部分计算量集中在纯卷积构成的 RRDB Body 上，这部分结构高度规整且已对齐固定 Tile 尺寸，正是验证与发挥 NPU 算力的核心场域；若此处静默回退至 GPU，不仅失去了异构协同的实验意义，还会掩盖量化与编译配置问题。

单帧内逐 Tile 的协同推理流程如下：

1. **切片与对齐**：根据配置选取 $256$ 或 $512$ 档位，使用重叠滑动窗口将低分帧切分为多个子块，并对边界块执行 `reflect-pad` 以严格对齐 $H \times W$ 静态形状。
2. **NPU 特征提取（Body Session）**：将对齐后的低分辨率切片 `lr` 送入 VitisAI NPU，高吞吐完成 RRDB 主干计算并输出特征图 `feat`。
3. **GPU 上采样重建（Upsample Session）**：将 `feat` 传递至 DirectML GPU 执行上采样与细节重建，得到高分辨率切片 `hr`。
4. **加权融合与拼接**：按照重叠区（Overlap）空间权重将所有 `hr` 切片平滑拼回完整高分辨率视频帧，并将像素值截断（`clip`）至 $[0, 1]$ 合法区间。

此外，在工程细节上，由于不同倍率或不同权重的模型目录下均包含同名文件 `realesrgan_body.onnx`，框架专门基于模型文件的上级目录路径派生出唯一的 `cache_key` 传递给 VitisAI EP，从而彻底避免了多个不同结构的模型误共用同一份离线编译缓存导致的张量维度冲突。

## 4. 总结与思考

回顾本次在 ThinkBook 14+（Ryzen 7 8845H）上构建 `video4x` 异构视频增强管线的过程，可以得到以下几点核心工程经验：

- **按算子微架构亲和性做子图切分**：异构协同绝非简单地把整个模型丢给 NPU，而是要甄别计算图中的“规整高算术强度区”（如 Real-ESRGAN 的 RRDB Body、RIFE 的后段卷积）与“动态/不规则访存区”（如多尺度光流准备、GridSample Warp 与上采样），让 NPU 专注固定 Shape 的密集卷积，让 GPU 发挥高带宽与纹理采样优势。
- **跨设备通信与零拷贝是决定端到端收益的关键**：在 APU 统一内存架构下，只有配合 `dual-stream` 时间重叠与 `IOBinding` 锁页内存共享，才能掩盖跨 Execution Provider 调度的同步开销。
- **Windows 端 NPU 生态仍有提升空间**：目前 Windows / WSL 环境下 Vitis AI EP 对复杂视觉算子的覆盖度、编译耗时的透明度以及跨 EP 零拷贝的原语支持仍处于早期演进阶段。期待未来随着 [AMD ROCm](https://www.amd.com/en/products/software/rocm.html)、[Quark](https://quark.docs.amd.com/) 与 Ryzen AI 软件栈的持续迭代，能够在消费级 AI PC 上真正释放 GPU + NPU 异构推理的全部潜力。

## 参考文献

1. Huaizu Jiang, Deqing Sun, Varun Jampani, Ming-Hsuan Yang, Erik Learned-Miller, Jan Kautz. *Super SloMo: High Quality Estimation of Multiple Intermediate Frames for Video Interpolation*. CVPR 2018. [Paper Link](https://openaccess.thecvf.com/content_cvpr_2018/html/Jiang_Super_SloMo_High_CVPR_2018_paper.html)
2. Wenbo Bao, Wei-Sheng Lai, Chao Ma, Xiaoyun Zhang, Zhiyong Gao, Ming-Hsuan Yang. *Depth-Aware Video Frame Interpolation*. CVPR 2019. [Paper Link](https://openaccess.thecvf.com/content_CVPR_2019/html/Bao_Depth-Aware_Video_Frame_Interpolation_CVPR_2019_paper.html)
3. Simon Niklaus, Feng Liu. *Softmax Splatting for Video Frame Interpolation*. CVPR 2020. [Paper Link](https://openaccess.thecvf.com/content_CVPR_2020/html/Niklaus_Softmax_Splatting_for_Video_Frame_Interpolation_CVPR_2020_paper.html)
4. Zhewei Huang, Tianyuan Zhang, Wen Heng, Boxin Shi, Shuchang Zhou. *Real-Time Intermediate Flow Estimation for Video Frame Interpolation*. ECCV 2022. [DOI Link](https://doi.org/10.1007/978-3-031-19781-9_36) · [arXiv:2011.06294](https://arxiv.org/abs/2011.06294)
5. Fitsum Reda, Janne Kontkanen, Eric Tabellion, Deqing Sun, Caroline Pantofaru, Brian Curless. *FILM: Frame Interpolation for Large Motion*. ECCV 2022. [arXiv:2202.04901](https://arxiv.org/abs/2202.04901) · [Project Page](https://film-net.github.io/)
6. Chao Dong, Chen Change Loy, Kaiming He, Xiaoou Tang. *Learning a Deep Convolutional Network for Image Super-Resolution*. ECCV 2014. [Project Page](http://mmlab.ie.cuhk.edu.hk/projects/SRCNN.html)
7. Xintao Wang, Ke Yu, Shixiang Wu, Jinjin Gu, Yihao Liu, Chao Dong, Yu Qiao, Chen Change Loy. *ESRGAN: Enhanced Super-Resolution Generative Adversarial Networks*. ECCVW 2018. [PDF Link](https://openaccess.thecvf.com/content_ECCVW_2018/papers/11133/Wang_ESRGAN_Enhanced_Super-Resolution_Generative_Adversarial_Networks_ECCVW_2018_paper.pdf)
8. Xintao Wang, Liangbin Xie, Chao Dong, Ying Shan. *Real-ESRGAN: Training Real-World Blind Super-Resolution with Pure Synthetic Data*. ICCVW 2021. [CVF Link](https://openaccess.thecvf.com/content/ICCV2021W/RealAI/html/Wang_Real-ESRGAN_Training_Real-World_Blind_Super-Resolution_With_Pure_Synthetic_Data_ICCVW_2021_paper.html) · [DOI:10.1109/ICCVW54120.2021.00217](https://doi.org/10.1109/ICCVW54120.2021.00217)
9. Alejandro Rico et al. *AMD XDNA NPU in Ryzen AI Processors*. IEEE Micro, 44(6):73–82, 2024. [DOI Link](https://doi.org/10.1109/mm.2024.3423692)
10. AMD. *AMD XDNA Architecture*. [Official Page](https://www.amd.com/en/technologies/xdna.html)
11. AMD. *AMD CDNA Architecture*. [Official Page](https://www.amd.com/en/technologies/cdna.html)
12. AMD. *ROCm Open Software Stack*. [Official Page](https://www.amd.com/en/products/software/rocm.html)
