---
title: Tailscale Derper Lighthouse 部署
date: 2026-3-10 19:57 +0800
categories: [运维]
tags: [运维, 配置记录]
---

由 CLAUDE 润色。

# 腾讯云 Lighthouse 部署

## 背景

国内服务器自建 DERP 作为数据平面流量中继，提升国内 tailscale 访问速度。

### 整体架构

```
你的设备 (Tailscale 客户端)
        ↕ 控制平面（注册/ACL）
   [Tailscale.com]  ←→  [Headscale 自建]  ← 二选一
        ↕ 数据平面（流量中继）
   [官方 DERP]  ←→  [自建 DERP]  ← 可叠加
```

---

## 一、准备工作

### 1. 新增子域名 DNS 解析

在域名服务商控制台（如 cloudflare），新增 A/AAAA 记录（不要走橙云代理流量）：

```
derp.yourdomain.com -> 服务器公网 IP
```

### 2. 放行端口

derp 服务不推荐运行在任何防火墙或负载均衡器（如 nginx）后，由于默认的 80/443 端口已经被我的 openresty 服务占用，因此更换并放行端口：

| 端口  | 协议 | 用途       |
| ----- | ---- | ---------- |
| 10443 | TCP  | DERP HTTPS |
| 10080 | TCP  | DERP HTTP  |
| 3478  | UDP  | STUN TCP   |

---

## 二、编译安装 derper

我的服务器的内存较小，为尽可能减少性能开销，直接使用二进制部署。需要依赖 golang version > 1.26。同时创建一个专用用户。

```bash
mkdir -p /opt/derper
useradd -r -s /sbin/nologin derper
# 加入 certbotdev 用户组，后续设置 letsencrypt 权限让 derper 能够访问证书
groupadd certbotdev
usermod -aG certbotdev derper
chown derper:derper -R /opt/derper
chmod g+rx,o-rwx -R /opt/derper
GOPATH=/opt/derper go install tailscale.com/cmd/derper@latest
# 二进制位于 /opt/derper/bin/derper
```

为保证兼容性，可以在 crontab 中定期执行 `go install` 命令更新软件。

---

## 三、生成证书

由于默认端口80/443被占用，使用了非标准端口，如果 derper certmode 直接使用 `letsencrypt` 模式会导致证书无法自动生成，手动生成证书并让 derper 使用。首先设置初始化和续签钩子，自动创建软链接、设置权限、重启 derper 服务：

```bash
cat > /etc/letsencrypt/renewal-hooks/post/restart-derper.sh << 'EOF'
#!/bin/bash

DOMAIN=derp.yourdomain.com
CERT_DIR=/etc/letsencrypt/live/${DOMAIN}

# 1. 创建软链接（-f 避免重复执行时报错）
ln -sf ${CERT_DIR}/fullchain.pem ${CERT_DIR}/${DOMAIN}.crt
ln -sf ${CERT_DIR}/privkey.pem   ${CERT_DIR}/${DOMAIN}.key

# 2. 设置证书目录权限，让 certbotdev 用户组可读
chgrp -R certbotdev /etc/letsencrypt/live /etc/letsencrypt/archive
chmod -R g+rx   /etc/letsencrypt/live /etc/letsencrypt/archive

# 3. 重启 derper 加载新证书
systemctl restart derper
EOF

chmod +x /etc/letsencrypt/renewal-hooks/post/restart-derper.sh
```

添加证书：

```bash
certbot certonly -d derp.yourdomain.com
```

## 四、配置 systemd 服务

derper 需要使用 `-c` 参数指定节点私钥存储目录。初次使用需要删除该目录旧的 `derper.conf` / `derper.key` 文件。

创建 `/etc/systemd/system/derper.service`：

```ini
[Unit]
Description=Tailscale DERP Server
After=network.target

[Service]
User=derper
ExecStart=/opt/derper/bin/derper \
  -c /opt/derper/derper.key \
  -hostname derp.yourdomain.com \
  -certmode manual \
  -certdir  /etc/letsencrypt/live/derp.yourdomain.com \
  -a :10443 \
  -http-port 10080 \
  -stun-port 3478 \
  -verify-clients
Restart=always
RestartSec=5
MemoryMax=64M

[Install]
WantedBy=multi-user.target
```

> **关于 `-verify-clients`**：开启后 derper 会验证连接者是否属于你的 tailnet，防止他人使用你的中继。开启此选项需要宿主机上运行 `tailscaled`。
> 腾讯云自家的 OpenCloudOS 可使用 [centos-stream-9 的 tailscale 仓库安装](https://tailscale.com/download/linux/centos-stream-9)

启动服务：

```bash
systemctl daemon-reload
systemctl enable --now derper
systemctl status derper
```

---

## 五、配置 Tailscale ACL

登录 [Tailscale Admin Console](https://login.tailscale.com/admin/acls)，在 ACL JSON Editor 中添加自定义 DERP 节点（预留了 region 900-999 为自己的服务区域）：

```json
"derpMap": {
  "Regions": {
    "900": {
      "RegionID":   900,
      "RegionCode": "yourregionname",
      "Nodes": [
        {
          "Name":     "nodename",
          "RegionID": 900,
          "HostName": "derp.yourdomain.com",
          // 由于使用了非标准的端口，因此需要额外指定，否则 https 协议默认走 443 端口
          "DERPPort": 10443,
          "STUNPort": 3478,
          // IPv4 and IPv6 are optional, but recommended, to reduce
          // potential DERP connectivity issues if DNS is unavailable
          // or having issues. Addresses must be publicly routable
          // and not in private IP ranges.
          "IPv4": "server.ipv4",
          "IPv6": "server.ipv6",
        },
      ],
    },
  },
},
```

> `OmitDefaultRegions: false` 保留官方节点作为备用，自建节点故障时不会断联。

---

## 六、验证

在任意 Tailscale 客户端执行：

```bash
# 检查节点延迟
tailscale netcheck

# 查看连接状态，不要报错自建 DERP 无法连接
tailscale status

# 查看设备是否真正走了自建 derp
## 比如输出：pong from 设备名 (xxx) via DERP(your derp nodename) in xxxms
tailscale ping <设备名>
```

---

## Ref

- [自定义 DERP 服务器官方文档](https://tailscale.com/docs/reference/derp-servers/custom-derp-servers)
- [Tailscale 内网穿透与 Derper 中继节点搭建](https://weixiang.github.io/posts/tailscale-intranet-penetration-and-derper-construction/)
