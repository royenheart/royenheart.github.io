---
title: Openresty + WebDav 配置记录
date: 2026-2-23 22:07 +0800
categories: [运维]
tags: [运维, 配置记录]
---

由 CLAUDE 润色。

# 使用 OpenResty + hacdias/webdav 搭建 WebDAV 服务

本文介绍如何在已有 OpenResty 的服务器上搭建带 HTTPS 和账号认证的 WebDAV 服务。核心思路是：用 `hacdias/webdav` 作为后端，OpenResty 通过反代转发请求。

---

## 一、下载 hacdias/webdav

前往 [hacdias/webdav Releases](https://github.com/hacdias/webdav/releases) 选择对应架构的二进制包，以 `linux-amd64` 为例：

```bash
wget https://github.com/hacdias/webdav/releases/latest/download/linux-amd64-webdav.tar.gz
tar -xzf linux-amd64-webdav.tar.gz && mv webdav /usr/local/bin/
```

---

## 二、创建存储目录和专用用户

为 WebDAV 服务创建独立的系统用户，避免使用 `nobody`：

```bash
# 创建无登录 shell 的专用用户
useradd -r -s /usr/sbin/nologin -d /opt/webdav webdav

# 创建存储目录并设置权限
mkdir -p /opt/webdav
chmod 750 /opt/webdav
chmod g+s /opt/webdav
chown -R webdav:webdav /opt/webdav
setfacl -R -d -m other::0 /opt/webdav
mkdir -p /opt/webdav/data
```

---

## 三、配置 hacdias/webdav

```bash
mkdir -p /etc/webdav
cat <<EOF > /usr/local/etc/webdav/config.yaml
address: 127.0.0.1
port: 6065

# 认证由 OpenResty 的 auth_basic 负责，这里关闭
auth: false

directory: /opt/webdav/data
permissions: CRUD
EOF
```

> `auth: false` 表示 WebDAV 后端本身不做认证，认证完全交给前面的 OpenResty 处理，外部无法直接访问 `127.0.0.1:6065`。

---

## 四、配置 systemd 服务

```bash
cat <<EOF > /etc/systemd/system/webdav.service
[Unit]
Description=WebDAV Server
After=network.target

[Service]
ExecStart=/usr/local/bin/webdav --config /usr/local/etc/webdav/config.yaml
Restart=on-failure
User=webdav
Group=webdav

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now webdav
systemctl status webdav
```

---

## 五、申请 SSL 证书

使用常用的 certbot 即可，

---

## 六、创建 Basic Auth 密码文件

```bash
dnf install -y httpd-tools

# 创建第一个用户（-c 新建文件）
htpasswd -c /usr/local/openresty/.htpasswd youruser

# 添加更多用户（去掉 -c）
# htpasswd /usr/local/openresty/.htpasswd anotheruser

# 设置权限
chmod 640 /usr/local/openresty/.htpasswd
```

---

## 七、配置 OpenResty

创建配置文件，这里只展示反代部分。

> 推荐使用 [Nginx 配置工具](https://www.digitalocean.com/community/tools/nginx?global.app.lang=zhCN)生成基础配置。

```bash
mkdir -p /usr/local/openresty/nginx/conf/conf.d
vi /usr/local/openresty/nginx/conf/conf.d/webdav.conf
```

```nginx
# HTTP → HTTPS 跳转
server {
    listen 80;
    server_name xxx;

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS WebDAV 主服务
server {
    listen 443 ssl;
    http2 on;
    server_name xxx;

    location / {
        # Basic Auth 认证
        auth_basic "WebDAV";
        auth_basic_user_file /usr/local/openresty/.htpasswd;

        # 反代到 hacdias/webdav 后端
        proxy_pass http://127.0.0.1:6065;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass_request_headers on;

        # 大文件支持，关闭请求缓冲直接流式转发
        client_max_body_size    0;
        client_body_timeout     600s;
        send_timeout            600s;
        proxy_request_buffering off;
    }
}
```

> 80 和 443 端口与博客共享，nginx 通过 `server_name` 自动区分流量，博客配置无需改动。

检查配置并重载：

```bash
openresty -t && openresty -s reload
```

---

## 八、验证

```bash
export WEBDAV_URL="https://xxx"
export WEBDAV_USER="youruser"
export WEBDAV_PASS="yourpassword"

# PROPFIND
curl -u $WEBDAV_USER:$WEBDAV_PASS -X PROPFIND "$WEBDAV_URL/" -H "Depth: 1" -v

# 上传文件，返回 Created
curl -u $WEBDAV_USER:$WEBDAV_PASS -T /etc/hostname "$WEBDAV_URL/test.txt"

# 下载文件
curl -u $WEBDAV_USER:$WEBDAV_PASS "$WEBDAV_URL/test.txt"

# 未认证访问
curl -I "$WEBDAV_URL/"
```
