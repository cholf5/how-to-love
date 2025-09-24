# 第 19 章 - 音频

我们要为游戏加入音频。本章非常短，因为就像很多事情一样，LÖVE 的 API 让我们很容易就能把音频加进游戏里。

下载本教程会用到的两个文件：

[*sfx.ogg*](/images/book/19/sfx.ogg) 和 [*song.ogg*](/images/book/19/song.ogg)

我们先处理歌曲，让它能无限循环。
首先需要创建音频。我们把它称作 *source*（音频的来源）。我们可以用 `love.audio.newSource(path)` 来创建 source。这个函数接收两个参数：第一个是文件路径，第二个是 source 的类型。它可以是 `"static"` 或 `"stream"`。引用 LÖVE wiki 里的一句话：“一个不错的经验法则是：音乐文件用 stream，所有短的音效用 static。基本上，你会想避免一次把大文件全部加载进内存。”

所以在我们的例子中我们要用 `"stream"`，因为它是一首歌。

```lua
function love.load()
    song = love.audio.newSource("path/to/song.ogg", "stream")
end
```

接下来我们想播放它，有两种方式可以做到。

```lua
function love.load()
    song = love.audio.newSource("path/to/song.ogg", "stream")
    -- 方法 1
    love.audio.play(song)
    -- 方法 2
    song:play()
end
```

两者几乎没有差别，就算有也不会让你察觉到。所以随便选一种你喜欢的。我更喜欢第二种写法。

当你运行游戏时，歌曲现在应该会播放了。但它不会循环。怎么解决呢？我当然可以告诉你，不过你应该学会自己去找答案。首先，打开 [Source](http://love2d.org/wiki/Source) 对象的 wiki 页面。现在我们需要找一个能让音频循环的方法。也许按 Ctrl + F 搜索页面，然后输入“loop”。

Source:setLooping       设置 Source 是否应该循环。

找到了！

```lua
function love.load()
    song = love.audio.newSource("path/to/song.ogg", "stream")
    song:setLooping(true)
    song:play()
end
```

好极了，现在我们有循环播放的背景音乐了。接下来我们想添加一个音效，让它在你每次按下空格时播放。我们先创建新的 source。

```lua
function love.load()
    song = love.audio.newSource("path/to/song.ogg", "stream")
    song:setLooping(true)
    song:play()

    -- sfx 是 “sound effect”（音效）的缩写，至少我是这么用的。
    sfx = love.audio.newSource("sfx.ogg", "static")
end
```

然后我们添加 `love.keypressed` 回调，每次按下空格键时播放音效。

```lua
function love.keypressed(key)
    if key == "space" then
        sfx:play()
    end
end
```

搞定。就像我说的，关于音频其实没有太多要说的，而且你想学的任何东西都可以轻松地在 API 文档里查到。比如如何[设置音量](http://love2d.org/wiki/Source:setVolume)、如何让 source [暂停](http://love2d.org/wiki/Source:pause)，或者如何获取 source 的[播放位置](http://love2d.org/wiki/Source:tell)。

___

## 总结
LÖVE 的 API 让添加音频变得非常简单。我们把音频对象称为 Source。通常只要翻翻 API 文档，我们就能找到自己想要的功能。
