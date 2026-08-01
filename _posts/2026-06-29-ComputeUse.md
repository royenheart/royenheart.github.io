---
title: Compute/Browser Use
date: 2026-6-29 10:42 +0800
categories: [运维]
tags: [运维, 配置记录]
---

> 如何让 AI 高效地直接操控任何 OS、应用，而不止限于终端。
> “工具是人类器官的延伸”

本文持续更新中。。。

一个综述/研究汇总：https://github.com/trycua/acu

## Compute Use

历史遗留问题 / 操作难度、性能导致目前即使单一系统上也没有完全统一的 UI API 进行操作，因此需要一个路由。

### CUA

- https://github.com/trycua/cua

跨平台的操控技术路由器：

整合各个 OS 的 `Accessibility API`、macOS SkyLight 私有框架、Windows 的 `UI Automation` / SendInput、Linux 的 DBus 等多种协议，并根据情况路由操纵方式。

1. macOS

使用 Swift 实现，通过 Apple Accessibility API (AX) 进行 UI 元素发现和操作：

- AXUIElementCopyAttributeValue - 读取元素属性
- AXUIElementPerformAction - 执行操作
- CGEvent.postToPid - 定向发送输入事件

2. Linux

使用 Go/Python 实现，通过 AT-SPI2 via D-Bus 进行桌面自动化：

- Python bridge 使用 GNOME/GObject Introspection
- AT-SPI2 接口进行 app/window discovery 和 semantic action

3. Windows

使用 Go/PowerShell 实现，通过 UI Automation (UIA) 进行自动化：

- PowerShell bridge 使用 System.Windows.Automation
- UIA pattern action 和 Win32 message fallback

该项目集成了：

1. CUA-Driver，基础驱动，提供操控平面和接口，暴露 MCP、CLI 接口。
2. Cua，Python 包，但只提供了虚拟环境的控制（官方说明是用来直接构造 Agent 的）。

    远程使用云 cua.ai / 本地用 qemu

## Browser Use

在文章 https://www.ifuryst.com/en/blog/2026/open-browser-use/ 中介绍了三种方式的使用方法。

- 浏览器扩展：安装浏览器扩展 + CLI 通信
- 内置浏览器：应用内嵌入浏览器（对于 electron 应用会比较简单）。无法直接复用用户已有的浏览器界面、部分插件    。
- CDP 协议（Chrome DevTools Protocol）：通过 CDP 协议直接与 Chrome 浏览器通信。

Chrome 本身也在做内置 AI 功能，相关讨论：https://groups.google.com/a/chromium.org/g/chrome-ai-dev-preview-discuss

### open-codex-compute-use

- https://github.com/iFurySt/open-codex-computer-use

也是整合了多种协议，包括 `Accessibility API`、Windows `UI Automation 等`。

目前通过 MCP 暴露给智能 Agent，本身只是个操控平面。

## Agent

agent（行动者，one who acts）：能感知环境并自主采取行动、具有特定意图的实体：

1. 记忆
2. 推理
3. 规划
4. 行动
    - 使用工具

## 互联

目前根据上述理念整了个[小玩意](https://github.com/royenheart/MaintainAll/tree/main/deploy/compute-browser-use)，来帮我自动化更多事。

```
┌──────────────────────────────────────────────────────────────────────┐
│                          本地 PC (Windows)                           │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Client Control Plane (cua-control-plane)         │   │
│  │                                                               │   │
│  │  ┌──────────┐ ┌───────────────┐ ┌────────────────────────┐   │   │
│  │  │ CUA Core │ │ Deterministic │ │  REST API Server       │   │   │
│  │  │ (截图/点击│ │  Ops          │ │  (FastAPI :9111)       │   │   │
│  │  │ /键盘)   │ │ (list_apps/   │ │                        │   │   │
│  │  │          │ │  open_app/    │ │  POST /api/v1/cua/*    │   │   │
│  │  │          │ │  app_info...) │ │  POST /api/v1/dops/*   │   │   │
│  │  └──────────┘ └───────────────┘ └───────────┬────────────┘   │   │
│  │                                              │                │   │
│  │  ┌────────────────────────────┐              │                │   │
│  │  │  System Tray (pystray)     │              │                │   │
│  │  │  - 连接状态                │              │                │   │
│  │  │  - 操作开关 (ON/OFF)       │              │                │   │
│  │  │  - 权限级别 (readonly/     │              │                │   │
│  │  │    full/strict)           │              │                │   │
│  │  └────────────────────────────┘              │                │   │
│  └──────────────────────────────────────────────┼────────────────┘   │
│                                                  │                   │
└──────────────────────────────────────────────────┼───────────────────┘
                                                   │ HTTPS + Token
                                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                           云端服务器                                  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     docker-compose  (cua-net)                 │   │
│  │                                                               │   │
│  │  ┌──────────┐         ┌────────────────┐    ┌──────────────┐ │   │
│  │  │ AstrBot  │──┐      │  Hermes Hub    │    │   cuactl     │ │   │
│  │  │(最小部署)│  │      │  (hermes-api)  │    │  HTTP 服务    │ │   │
│  │  │          │  │      │                │    │  FastAPI:8000│ │   │
│  │  │ 消息平台 │  ├─────▶│ Hermes Agent   │    │  独立容器     │ │   │
│  │  │ Pipeline │  │      │ (headless mode)│    │              │ │   │
│  │  │          │  │      │                │    │ /cuactl/*    │ │   │
│  │  │ LLM +    │  │      │ terminal_tool  │    │ /health      │ │   │
│  │  │ shell    │  │      │   curl ...     │    │              │ │   │
│  │  └─────┬────┘  │      └───────┬────────┘    └──────┬───────┘ │   │
│  │        │       │              │                    │         │   │
│  │        │       │              │  curl http://      │         │   │
│  │        │       │              │  cuactl:8000/      │         │   │
│  │        │       └─────────────►│────────────────────►│         │   │
│  │        │                      │                    │         │   │
│  │        └────────────────────────────────────────────►         │   │
│  │           curl http://cuactl:8000/                │         │   │
│  │                                                   │         │   │
│  │  ┌────────────────────────────────────────────────┼───────┐ │   │
│  │  │    Hermes Bridge (可选, --profile bridge)      │       │ │   │
│  │  │    AstrBot → Hermes 备用转发通道               │       │ │   │
│  │  └────────────────────────────────────────────────┼───────┘ │   │
│  └───────────────────────────────────────────────────┼─────────┘   │
│                                                      │             │
└──────────────────────────────────────────────────────┼─────────────┘
                                                       │
                                                       ▼
                                              Client Control Plane
```

## ref

- [Show HN: Drive any macOS app in the background without stealing the cursor](https://hn.algolia.com/?query=Screen%20recording%20of%20working%20with%20Cursor&type=story&dateRange=all&sort=byDate&storyText=false&prefix&page=0)
- [Browser Use Deep Dive](https://www.ifuryst.com/en/blog/2026/open-browser-use/#open-browser-use)