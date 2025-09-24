# Visual Studio Code

Visual Studio Code 是微軟推出的一款功能非常豐富的代碼編輯器。本章將介紹一些擴展和技巧，幫助你優化編輯器來製作 LÖVE 遊戲。

[安裝 Visual Studio Code](https://code.visualstudio.com/)

## 模板

可以查看 Keyslam 的 [LÖVE VSCode Game Template](https://github.com/Keyslam/LOVE-VSCode-Game-Template)。本教程不會使用該模板，而是手動講解如何添加和配置你也能在模板中找到的擴展。

## 擴展

安裝下列擴展：

- [Lua（sumneko）](https://marketplace.visualstudio.com/items?itemName=sumneko.lua)
- [Local Lua Debugger（Tom Blind）](https://marketplace.visualstudio.com/items?itemName=tomblind.local-lua-debugger-vscode)

### Lua

正如擴展商店所說，它會提供大量有用功能。我們還可以讓它具備 LÖVE 的自動補全。

按下 `Ctrl + Shift + P`，搜索並打開 `Preferences: Open User Settings (JSON)`。

把下面的設置加入 JSON 中：

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

把存放 `love.exe` 的文件夾添加到系統的環境變量中。在 Windows 中搜索「編輯系統環境變量」，底部點擊「環境變量」。在「系統變量」區域找到並點擊「Path」，再點擊「編輯…」。點「新建」，輸入包含 `love.exe` 的文件夾路徑。

![指南](/images/book/bonus/vscode/lovepath.gif)

接下來要添加兩個啟動配置。需要注意，下面的方法未必是*最優*，更多的是一種個人偏好。

進入「運行和調試」（左側帶有小蟲子的播放按鈕）。點擊「create a launch.json file」。

把新文件的內容替換成下面這樣：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "lua-local",
      "request": "launch",
      "name": "調試",
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
      "name": "發布",
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

在 `main.lua` 頂部加入下列代碼：

```lua
if arg[2] == "debug" then
    require("lldebugger").start()
end
```

按 F5 即可啟動配置。你可以在「運行和調試」裡選擇要使用哪一個。現在就有兩種啟動 LÖVE 的方式：

- 使用 **調試** 配置可以調試遊戲。在 Lua 文件中點擊行號左側即可創建*斷點*（再次點擊可移除）。當代碼執行到該行時，調試器會暫停並允許你查看變量。![調試](/images/book/bonus/vscode/debugging.png)
- 使用 **發布** 配置則不會加載調試器。之所以要分開，是為了避免在要分發遊戲時還得記得刪掉 `lldebugger` 這一行。

我們可以改進調試體驗，讓它在出現錯誤時高亮顯示。為此需要修改 `love.errorhandler`。LÖVE 會捕獲錯誤以顯示漂亮的錯誤界面，而我們希望它真的拋出錯誤。

在 `main.lua` 底部加入以下代碼：

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

這樣在調試模式下出現錯誤時，Visual Studio Code 會跳轉到出錯的文件與行號，並突出顯示錯誤信息。

![錯誤](/images/book/bonus/vscode/error.png)

你可能會發現遊戲在調試模式下明顯變慢。只要存在斷點就會發生這種情況，所以不用時記得禁用斷點。

你也可以在此基礎上做更多擴展，比如當 `launch_type == "debug"` 時在屏幕上顯示調試信息。

## 構建

現在我們希望能輕鬆地構建項目。

### makelove

我們使用構建工具 [makelove](https://github.com/pfirsich/makelove/)。

1. 安裝 [Python](https://www.python.org/downloads/)（若自定義安裝，請確保勾選 `pip`）。
2. 打開終端（例如 Windows PowerShell），輸入 `pip3 install makelove`。
3. 在遊戲文件夾（放置 main.lua 的位置）創建名為 `make_all.toml` 的文件，並寫入：
   ```ini
   name = "遊戲"
   default_targets = ["win32", "win64", "macos"]
   build_directory = "bin"
   love_files = [
       "+*",
       "-*/.*",
   ]
   ```

### 任務

按下 `Ctrl + Shift + P`，搜索並打開 `Task: Configure Task`。選擇 `Create task.json file from template`。選擇 `Others`（或其他都行）。把文件內容替換為：

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "構建 LÖVE",
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

之後在 Visual Studio Code 中按 `Ctrl + Shift + B` 即可運行任務。它會創建一個 `bin` 文件夾，裡面的子文件夾包含 `.zip` 文件。
