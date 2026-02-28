# Deploy

```bash
dnf install openresty luarocks lua-devel cmake
luarocks install toml
```

add such lua script to your nginx/openresty config:

```conf
http {
    # 如果有，增加 lua 模块搜索路径 (根据你的安装位置可能略有不同)
    lua_package_path "/usr/local/share/lua/5.1/?.lua;;";
    # 如果使用 openresty，可以直接从 https://github.com/jonstoler/lua-toml 下载 toml.lua 到 openresty 的 lualib 目录

    server {
        ....

        location / {
            default_type text/html;
            content_by_lua_block {
                -- 引入 toml 库
                local toml = require "toml"
              
                -- 定义读取文件的辅助函数
                local function read_file(path)
                    local file = io.open(path, "rb") 
                    if not file then return nil end
                    local content = file:read "*a" 
                    file:close()
                    return content
                end

                -- 1. 读取并解析 Config
                local config_content = read_file(ngx.var.document_dir .. "/config.toml")
                if not config_content then
                    ngx.say("Error: config.toml not found")
                    return
                end
              
                -- 解析 TOML
                local config = toml.parse(config_content)

                -- 2. 读取 Template
                local template = read_file(ngx.var.document_dir .. "/template.html")
                if not template then
                    ngx.say("Error: template.html not found")
                    return
                end

                -- 3. 简单的字符串替换 (渲染模板)
                -- Lua 的 string.gsub 类似于 Replace
                local html = template
              
                html = html:gsub("{{TITLE}}", config.meta.title)
                html = html:gsub("{{BEIAN_ICP}}", config.meta.beian_icp)
                html = html:gsub("{{BEIAN_POLICE}}", config.meta.beian_police)
              
                html = html:gsub("{{LINK_BLOG}}", config.links.blog)
                -- html = html:gsub("{{LINK_TWITTER}}", config.links.twitter)
                html = html:gsub("{{LINK_GITHUB}}", config.links.github)
              
                -- 这里直接注入 Iframe 字符串
                html = html:gsub("{{MUSIC_IFRAME}}", config.music.iframe)
              
                html = html:gsub("{{COLOR_BG}}", config.visual.bg_color)
                html = html:gsub("{{COLOR_CUBE}}", config.visual.cube_color)
                html = html:gsub("{{COLOR_HIGHLIGHT}}", config.visual.highlight_color)
                html = html:gsub("{{COLOR_AMBIENT}}", config.visual.ambient_color)

                -- 4. 输出最终 HTML
                ngx.say(html)
            }
        }
    }
}
```

When you need to use certbot to get ssl for a web dns hosted on cloudflare, need to install `certbot-dns-cloudflare` first:

- Follow: https://certbot-dns-cloudflare.readthedocs.io/en/stable/
- Use certbot to get ssl:

```bash
# can specify multiple domains
certbot certonly --dns-cloudflare --dns-cloudflare-credentials /path/to/cloudflare_credentials.ini -d xx.com

certbot certonly --expand --dns-cloudflare --dns-cloudflare-credentials /path/to/cloudflare_credentials.ini -d xx.com -d gray.xx.com
```
