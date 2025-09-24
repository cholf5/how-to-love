# Visual Studio Code

Visual Studio Code 是微软推出的一款功能非常丰富的代码编辑器。本章将介绍一些扩展和技巧，帮助你优化编辑器来制作 LÖVE 游戏。

[安装 Visual Studio Code](https://code.visualstudio.com/)

## 模板

可以查看 Keyslam 的 [LÖVE VSCode Game Template](https://github.com/Keyslam/LOVE-VSCode-Game-Template)。本教程不会使用该模板，而是手动讲解如何添加和配置你也能在模板中找到的扩展。

## 扩展

安装下列扩展：

- [Lua（sumneko）](https://marketplace.visualstudio.com/items?itemName=sumneko.lua)
- [Local Lua Debugger（Tom Blind）](https://marketplace.visualstudio.com/items?itemName=tomblind.local-lua-debugger-vscode)

### Lua

正如扩展商店所说，它会提供大量有用功能。我们还可以让它具备 LÖVE 的自动补全。

按下 `Ctrl + Shift + P`，搜索并打开 `Preferences: Open User Settings (JSON)`。

把下面的设置加入 JSON 中：

```json
{
    "Lua.runtime.version": "LuaJIT",
    "Lua.diagnostics.globals": [
        "love",
    ],
    "Lua.workspace.library": [
        "${3rd}/love2d/library"
    ],
    "Lua.workspace.checkThirdParty": false,
}
```

### Local Lua Debugger

把存放 `love.exe` 的文件夹添加到系统的环境变量中。在 Windows 中搜索“编辑系统环境变量”，底部点击“环境变量”。在“系统变量”区域找到并点击“Path”，再点击“编辑…”。点“新建”，输入包含 `love.exe` 的文件夹路径。

![指南](/images/book/bonus/vscode/lovepath.gif)

接下来要添加两个启动配置。需要注意，下面的方法未必是*最优*，更多的是一种个人偏好。

进入“运行和调试”（左侧带有小虫子的播放按钮）。点击“create a launch.json file”。

把新文件的内容替换成下面这样：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "lua-local",
      "request": "launch",
      "name": "调试",
      "program": {
        "command": "love"
      },
      "args": [
        ".",
        "debug"
      ],
    },
    {
      "type": "lua-local",
      "request": "launch",
      "name": "发布",
      "program": {
        "command": "love"
      },
      "args": [
        ".",
      ],
    },
  ]
}
```

在 `main.lua` 顶部加入下列代码：

```lua
if arg[2] == "debug" then
    require("lldebugger").start()
end
```

按 F5 即可启动配置。你可以在“运行和调试”里选择要使用哪一个。现在就有两种启动 LÖVE 的方式：

- 使用 **调试** 配置可以调试游戏。在 Lua 文件中点击行号左侧即可创建*断点*（再次点击可移除）。当代码执行到该行时，调试器会暂停并允许你查看变量。![调试](/images/book/bonus/vscode/debugging.png)
- 使用 **发布** 配置则不会加载调试器。之所以要分开，是为了避免在要分发游戏时还得记得删掉 `lldebugger` 这一行。

我们可以改进调试体验，让它在出现错误时高亮显示。为此需要修改 `love.errorhandler`。LÖVE 会捕获错误以显示漂亮的错误界面，而我们希望它真的抛出错误。

在 `main.lua` 底部加入以下代码：

```lua
local love_errorhandler = love.errorhandler

function love.errorhandler(msg)
        if lldebugger then
                error(msg, 2)
        else
                return love_errorhandler(msg)
        end
end
```

这样在调试模式下出现错误时，Visual Studio Code 会跳转到出错的文件与行号，并突出显示错误信息。

![错误](/images/book/bonus/vscode/error.png)

你可能会发现游戏在调试模式下明显变慢。只要存在断点就会发生这种情况，所以不用时记得禁用断点。

你也可以在此基础上做更多扩展，比如当 `launch_type == "debug"` 时在屏幕上显示调试信息。

## 构建

现在我们希望能轻松地构建项目。

### makelove

我们使用构建工具 [makelove](https://github.com/pfirsich/makelove/)。

1. 安装 [Python](https://www.python.org/downloads/)（若自定义安装，请确保勾选 `pip`）。
2. 打开终端（例如 Windows PowerShell），输入 `pip3 install makelove`。
3. 在游戏文件夹（放置 main.lua 的位置）创建名为 `make_all.toml` 的文件，并写入：
   ```ini
   name = "游戏"
   default_targets = ["win32", "win64", "macos"]
   build_directory = "bin"
   love_files = [
       "+*",
       "-*/.*",
   ]
   ```

### 任务

按下 `Ctrl + Shift + P`，搜索并打开 `Task: Configure Task`。选择 `Create task.json file from template`。选择 `Others`（或其他都行）。把文件内容替换为：

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "构建 LÖVE",
            "type": "process",
            "command": "makelove",
            "args": [
                "--config",
                "make_all.toml"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            }
        },
    ]
}
```

之后在 Visual Studio Code 中按 `Ctrl + Shift + B` 即可运行任务。它会创建一个 `bin` 文件夹，里面的子文件夹包含 `.zip` 文件。
