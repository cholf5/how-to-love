# 第 15 章 - 发布你的游戏

___
*我们使用上一章的代码*
___

**提示：查看[附加章节](bonus/vscode)，了解如何使用 makelove 更顺畅地构建游戏。**
___

你已经做出了一款游戏，并且想把它分享给其他人。当然你可以让他们在电脑上安装 LÖVE，但其实没有这个必要。

首先，我们需要更改窗口标题和图标。我们会使用一个配置文件来完成这一点。

创建一个名为 `conf.lua` 的新文件，并写入以下代码：

```lua
function love.conf(t)
    t.window.title = "Panda Shooter!"
    t.window.icon = "panda.png"
end
```

保存文件。现在当你运行游戏时，就会看到窗口标题变成了 "Panda Shooter!"，图标也换成了那只熊猫。

配置文件的作用正是如此。LÖVE 会在启动游戏之前加载 `conf.lua` 并应用其中的设置。完整的可配置选项请参阅[官方 Wiki](https://love2d.org/wiki/Config_Files)。

既然游戏已经拥有合适的标题和图标，接下来就把它打包成可执行程序。

首先需要把游戏打包成一个 zip 压缩文件。进入你的游戏文件夹，选中其中所有文件。右键点击，选择 **发送到**，再点击 **压缩 (zip) 文件夹**。文件名无所谓，但我们需要把扩展名从默认的 `.zip` 改为 `.love`。

*注意：这一部分仅适用于 Windows。想了解如何在其他平台上构建游戏，请参阅[这里](https://www.love2d.org/wiki/Game_Distribution)。*

![](/images/book/15/compress.png)

**如果你看不到文件扩展名**

按下 ***Windows + Pause/Break***。在新窗口的左上角点击 ***控制面板***。接着依次进入 ***外观和个性化***。

![](/images/book/15/control_panel.png)

点击 ***文件资源管理器选项***。

![](/images/book/15/personalization.png)

会弹出一个新窗口。切换到 ***查看*** 选项卡，在 ***高级设置*** 中确保 ***隐藏已知文件类型的扩展名*** 处于未勾选状态。

![](/images/book/15/folder_options.png)

我写了一个用于打包游戏的 bat 脚本。下载[这个压缩包](https://drive.google.com/file/d/1xX49nDCI0UxjnwY3-h0f-kpdmHVmNqvz/view?usp=sharing)，并将所有文件解压到某个文件夹。

然后把你的 `.love` 文件拖到 `build.bat` 上。这会在同一目录下生成一个 `.zip` 文件。把它分享给别人就可以了。玩家只需把压缩包中的所有文件解压到同一个文件夹，然后打开其中的 `.exe` 文件就能游玩。

接下来你需要找一个发布游戏的平台。可以去看看 [itch.io](https://itch.io/)。

想了解更多游戏打包的信息，请参阅 [LÖVE Wiki 页面](https://www.love2d.org/wiki/Game_Distribution)，其中也介绍了如何为其他平台构建你的游戏。

___

## 总结

借助 [conf.lua](https://love2d.org/wiki/Config_Files) 你可以配置游戏的标题和图标。选中游戏文件夹中的所有文件并压缩成 zip，将扩展名从 `.zip` 改为 `.love`。下载[这个压缩包](https://drive.google.com/file/d/1xX49nDCI0UxjnwY3-h0f-kpdmHVmNqvz/view?usp=sharing)，把 `.love` 拖到 `build.bat` 上即可生成 `.zip`。玩家需要把压缩包解开到同一个文件夹，并运行 `.exe` 文件来体验你的游戏。
