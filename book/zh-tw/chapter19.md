# 第 19 章 - 音頻

我們要為遊戲加入音頻。本章非常短，因為就像很多事情一樣，LÖVE 的 API 讓我們很容易就能把音頻加進遊戲裡。

下載本教程會用到的兩個文件：

[*sfx.ogg*](/images/book/19/sfx.ogg) 和 [*song.ogg*](/images/book/19/song.ogg)

我們先處理歌曲，讓它能無限循環。
首先需要創建音頻。我們把它稱作 *source*（音頻的來源）。我們可以用 `love.audio.newSource(path)` 來創建 source。這個函數接收兩個參數：第一個是文件路徑，第二個是 source 的類型。它可以是 `"static"` 或 `"stream"`。引用 LÖVE wiki 裡的一句話：「一個不錯的經驗法則是：音樂文件用 stream，所有短的音效用 static。基本上，你會想避免一次把大文件全部加載進內存。」

所以在我們的例子中我們要用 `"stream"`，因為它是一首歌。

```lua
function love.load()
    song = love.audio.newSource("path/to/song.ogg", "stream")
end
```

接下來我們想播放它，有兩種方式可以做到。

```lua
function love.load()
    song = love.audio.newSource("path/to/song.ogg", "stream")
    -- 方法 1
    love.audio.play(song)
    -- 方法 2
    song:play()
end
```

兩者幾乎沒有差別，就算有也不會讓你察覺到。所以隨便選一種你喜歡的。我更喜歡第二種寫法。

當你運行遊戲時，歌曲現在應該會播放了。但它不會循環。怎麼解決呢？我當然可以告訴你，不過你應該學會自己去找答案。首先，打開 [Source](http://love2d.org/wiki/Source) 對象的 wiki 頁面。現在我們需要找一個能讓音頻循環的方法。也許按 Ctrl + F 搜索頁面，然後輸入「loop」。

Source:setLooping       設置 Source 是否應該循環。

找到了！

```lua
function love.load()
    song = love.audio.newSource("path/to/song.ogg", "stream")
    song:setLooping(true)
    song:play()
end
```

好極了，現在我們有循環播放的背景音樂了。接下來我們想添加一個音效，讓它在你每次按下空格時播放。我們先創建新的 source。

```lua
function love.load()
    song = love.audio.newSource("path/to/song.ogg", "stream")
    song:setLooping(true)
    song:play()

    -- sfx 是 「sound effect」（音效）的縮寫，至少我是這麼用的。
    sfx = love.audio.newSource("sfx.ogg", "static")
end
```

然後我們添加 `love.keypressed` 回調，每次按下空格鍵時播放音效。

```lua
function love.keypressed(key)
    if key == "space" then
        sfx:play()
    end
end
```

搞定。就像我說的，關於音頻其實沒有太多要說的，而且你想學的任何東西都可以輕鬆地在 API 文檔裡查到。比如如何[設置音量](http://love2d.org/wiki/Source:setVolume)、如何讓 source [暫停](http://love2d.org/wiki/Source:pause)，或者如何獲取 source 的[播放位置](http://love2d.org/wiki/Source:tell)。

___

## 總結
LÖVE 的 API 讓添加音頻變得非常簡單。我們把音頻對象稱為 Source。通常只要翻翻 API 文檔，我們就能找到自己想要的功能。
