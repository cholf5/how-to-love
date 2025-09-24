___

*第 2 章和第 3 章其实不用安装任何软件。如果你暂时不想装程序，可以用 [repl.it](https://repl.it/languages/lua) 先练习。但请务必阅读本章末尾的「**还有几件事**」段落。*

___

## LÖVE

打开 [love2d.org](https://www.love2d.org/)。

根据你的系统类型下载 32 位或 64 位的**安装包**。如果不确定自己的系统是 32 位还是 64 位，选 32 位也没关系。

![](/images/book/1/download_love.png)

运行安装包。依次点击 *Next*、*I agree*。接下来你可以选择 LÖVE 的安装位置。安装在什么地方其实无所谓，但请记住路径，稍后我们会用到。这个文件夹下面我会称为「**安装目录**」。

我的安装目录是 `C:/Program Files/LOVE`。

继续点击 *Next*，然后点击 *Install*。

安装完成后点击 *Finish*。

___

## 代码编辑器

接下来需要安装一个文本编辑器。本教程使用 ZeroBrane Studio。

如果你更喜欢 **Visual Studio Code**，可以查看[附加章节](bonus/vscode)了解如何在 VS Code 中运行 LÖVE。

打开 [studio.zerobrane.com](https://studio.zerobrane.com/)，点击 “Download”。

![](/images/book/1/download_brane.png)

这一步会出现捐赠 ZeroBrane Studio 的提示。如果暂时不想捐，可以点击 [“Take me to the download page this time”](https://studio.zerobrane.com/download?not-this-time)。

运行安装包，把 ZeroBrane Studio 安装到你喜欢的任何位置。

![](/images/book/1/install_brane.png)

安装完成后启动 ZeroBrane Studio。

我们需要一个项目文件夹。打开文件管理器，在你喜欢的位置新建一个文件夹，名字随意。在 ZeroBrane Studio 中点击 “Select Project Folder” 图标，选择刚创建的文件夹。

![](/images/book/1/project_brane.png)

在 ZeroBrane Studio 中新建一个文件，可以点 `File -> New`，也可以按快捷键 `Ctrl + N`。

在文件里写下如下代码：
```lua
function love.draw()
        love.graphics.print("Hello World!", 100, 100)
end
```

通过 `File -> Save` 或 `Ctrl + S` 保存文件，文件名叫 `main.lua`。

然后在菜单里选择 `Project -> Lua Interpreter`，把解释器切换成 `LÖVE`。

现在按下 F6，就会弹出一个窗口，显示 “Hello World!”。恭喜你，已经可以开始学习 LÖVE 了。之后我说的「*运行游戏*」或「*运行代码*」，就是要你按 F6 来启动 LÖVE。

如果什么都没发生，反而看到提示 *Can't find love2d executable in any of the following folders*，说明 ZeroBrane Studio 找不到 LÖVE 的安装位置。打开 `Edit -> Preferences -> Settings: User`，写入以下配置：

```lua
path.love2d = 'C:/path/to/love.exe'
```

把 `'C:/path/to/love.exe'` 换成你实际安装 LÖVE 的路径，注意路径里的斜杠要用正斜杠 `/`。

___

## 还有几件事

你是不是复制粘贴了示例代码？我还是鼓励你自己动手敲一遍。虽然看起来多了一些工作量，但亲手输入能让你记得更牢。

唯一可以不用手敲的部分是注释。

```lua
-- 这行是注释，不会被执行。
-- 下一行才是代码：

print(123)

--Output: 123
```

只要一行以两个减号（`--`）开头，就是*注释*。计算机会忽略它，所以我们可以随便写一些说明文字而不会报错。我会用注释来解释某段代码的作用。当你自己抄代码时，可以不用把注释也抄上。

`print` 可以把信息输出到*输出控制台*，也就是编辑器底部那个窗口。**关闭游戏窗口**之后，那里应该显示 `123` 这段文字。我会写上 `--Output:` 提示这段代码应该输出什么，别把它和 `love.graphics.print` 搞混。

如果在 `main.lua` 最上方加上下面这一行，就能在游戏运行时立即看到输出。具体怎么工作的现在不用管，理解成“让程序不用等到关闭才显示打印内容”就好。

```lua
io.stdout:setvbuf("no")
```

___

## 其他可选的编辑器

* [Visual Studio Code](https://code.visualstudio.com/)
* [Sublime Text](https://love2d.org/wiki/Sublime_Text)
* [Atom](https://love2d.org/wiki/Atom)
