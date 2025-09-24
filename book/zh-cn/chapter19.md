# 第 19 章 - 音频

- 使用 `love.audio.newSource(path, type)` 创建声音来源（Source）。短音效用 `"static"`，较长的音乐用 `"stream"`。
- `:play()` 或 `love.audio.play(source)` 都可以播放。通过 `source:setLooping(true)` 让音乐循环。
- 在 `love.keypressed` 中触发音效：
  ```lua
  function love.keypressed(key)
          if key == "space" then
                  sfx:play()
          end
  end
  ```
- 其他常见操作（调整音量、暂停、获取播放进度等）都能在 API 文档中找到。

___

## 总结

LÖVE 的音频接口非常直接，熟悉 `Source` 对象即可在游戏中轻松加入背景音乐与音效。
