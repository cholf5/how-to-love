# Visual Studio Code

VS Code 是微软推出的多语言编辑器，通过安装扩展可以更方便地开发 LÖVE 游戏。

## 推荐扩展

- [Lua (sumneko)](https://marketplace.visualstudio.com/items?itemName=sumneko.lua)：提供语法高亮、智能提示等功能。将下列配置添加到用户设置（`Ctrl+Shift+P` → `Preferences: Open User Settings (JSON)`）：
  ```json
  {
      "Lua.runtime.version": "LuaJIT",
      "Lua.diagnostics.globals": ["love"],
      "Lua.workspace.library": ["${3rd}/love2d/library"],
      "Lua.workspace.checkThirdParty": false
  }
  ```
- [Local Lua Debugger (Tom Blind)](https://marketplace.visualstudio.com/items?itemName=tomblind.local-lua-debugger-vscode)：在 VS Code 内调试 LÖVE。

将 LÖVE 的安装目录加入系统 PATH，然后创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "lua-local",
      "request": "launch",
      "name": "Debug",
      "program": { "command": "love" },
      "args": [".", "debug"]
    },
    {
      "type": "lua-local",
      "request": "launch",
      "name": "Release",
      "program": { "command": "love" },
      "args": ["."]
    }
  ]
}
```

在 `main.lua` 顶部加上：

```lua
if arg[2] == "debug" then
    require("lldebugger").start()
end

local love_errorhandler = love.errorhandler
function love.errorhandler(msg)
        if lldebugger then
                error(msg, 2)
        else
                return love_errorhandler(msg)
        end
end
```

这样 F5 运行时就能选择 Debug/Release 模式，出现错误会自动跳转到对应行。

## 构建

使用 [makelove](https://github.com/pfirsich/makelove/) 自动打包：

1. 安装 Python 并执行 `pip3 install makelove`。
2. 在项目根目录创建 `make_all.toml`：
   ```ini
   name = "Game"
   default_targets = ["win32", "win64", "macos"]
   build_directory = "bin"
   love_files = ["+*", "-*/.*"]
   ```
3. 配置任务（`Ctrl+Shift+P` → `Tasks: Configure Task`），在 `.vscode/tasks.json` 写入：
   ```json
   {
       "version": "2.0.0",
       "tasks": [
           {
               "label": "Build LÖVE",
               "type": "process",
               "command": "makelove",
               "args": ["--config", "make_all.toml"],
               "group": {"kind": "build", "isDefault": true}
           }
       ]
   }
   ```

之后按 `Ctrl+Shift+B` 即可执行打包任务。

___

## 总结

通过 Lua 扩展、调试器和 makelove 构建脚本，VS Code 能成为一套完整的 Love2D 开发环境。
