---
title: AI 创作工作流记录（WIP）
date: 2026-2-16 13:53 +0800
categories: [随心记]
tags: [AI, 游戏, 视频, 故事]
---

# 故事/视频生成

感觉还是得自己先弄个草稿/参考才好约束（。想精确描绘出心中想好的画面比较难，解空间越大越好弄。

需要学会描述：

1. 场景、人物、片段分镜
2. 转场手段

## 歌曲短片

### 桑岛法子 - 《メールのうた》

<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="//music.163.com/outchain/player?type=2&id=32192402&auto=0&height=66"></iframe>

- [探索案例2](https://gemini.google.com/share/a7037dfb75cd)

1. 找好参考图，可以先丢到 nanobanana 优化一轮。
1. 描述歌曲（歌词，作者），不断修改、添加自己的理解，同时确定风格，让 AI 生成 prompt
2. 丢到 seedance 生成

- [原始镜头1](https://jimeng.jianying.com/s/r-Vs8-X5iBc/)

## 网文

## 电影、动画编剧

- [探索案例1](https://gemini.google.com/share/106e55a3a1db)

### 故事优化、发散

1. logline 让 AI 先补充大体的细节。
2. 不断描述人物的特征，添加自己感兴趣的场景；向 AI 提出问题疑问，让 AI 优化并解答，反复迭代。
3. 生图改图制作一些人物、场景细节：
   - 人物：seedream / nano banana 生成人物设定图解
   - 场景：seedream
4. 让 AI 制作一个简单的脚本，配合先前生成的参考图，生成一些初期的图片、视频看看效果

### 风格探索



## 史诗

# AI-Combined Game



# MC 建筑生成

## 1. 图片编辑

- 去除背景：gemini（使用 NanoBanana 模型）。提示词：

1. 建筑：

Use the provided architectural photo as reference. Generate a high-fidelity 3D building model in the look of a “3D-printed architecture model.” Preserve the building’s massing and key texture details, lightly stylized for a game. Render with realistic, physically-based lighting and shadows. Show a 45° top-down (isometric) view to emphasize depth. Define materials clearly—reflective glass, metallic surfaces, concrete—so it reads as a high-quality, game-engine-ready render. Pure white background.

- 编辑图片扩大：stable diffusion

### 1.1 精细化修改

## 2. 生成 3D 模型（导出为 glb、obj 等格式）

- 高精度（图生图）：https://hitem3d.ai/history
- 娱乐、雕塑（图生图）：https://hyper3d.ai/rodin?lang=zh

## 3. 转化为像素

网站： https://objtoschematic.com/editor

也可以直接下载一些公开可用的现有3D资产

## 4. 导入MC

- litematica，投影模组
- nbt，机械动力大炮、 结构方块
- （殖民地）：如果不能直接在生存模式使用上述两个，建造后用形状工具保存，参考 WIKI：https://minecolonies.com/wiki/tutorials/schematics/

此外也可以从一些公开网站上下载已有结构投影：

- [CMS 机械动力相关蓝图站](https://www.creativemechanicserver.com/)
- [MC 蓝图站](https://www.mcschematic.top/home/)

# 画图

目前主要几种类型：

1. 即梦等代表软件

这类软件都是提示词 + 已有的资产（参考图片、视频）去生成。没法直接画草稿，可以多生成一些作为灵感，实际用的话只通过文字说明很难描绘出自己已经想好的效果（多模态目标空间太大）。

2. krita + [VirtualTablet](https://www.sunnysidesoft.com/virtualtablet/)（可以把平板电脑作为数位板，如果 PC 使用 Linux，可以试试 https://github.com/H-M-H/Weylus）+ [krita-ai-diffusion](https://github.com/Acly/krita-ai-diffusion)

通过插件扩展已有的绘图软件，可以先画草稿再不断生成，适合已经想好具体效果、色彩、构图的。

krita-ai-diffusion 内置 ComfyUI，[Wiki](https://docs.interstice.cloud/installation/)，可选定图片区域根据提示词 AI 修改。提供了[在线](https://www.interstice.cloud/) 服务、本地模型（可直接插件界面下载）和自定义服务三种方式。

3. 自建：ComfyUI 提供节点编辑、前后端，再用 stable diffusion 等本地模型或者三方多模态 LLM API 提供服务。

# REF

1. [BV1FKWAzJE16](https://www.bilibili.com/video/BV1FKWAzJE16/)
2. [BV1ifqBYqEzk](https://www.bilibili.com/video/BV1ifqBYqEzk/)
