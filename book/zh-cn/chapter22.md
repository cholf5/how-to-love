# 第 22 章 - 摄像机与画布

## 摄像机（平移/缩放）

- 使用 `love.graphics.translate(-player.x + screenWidth/2, -player.y + screenHeight/2)` 让玩家保持在屏幕中央。
- `love.graphics.scale`、`rotate` 也可以配合使用，记得在绘制 HUD 之前恢复坐标系。
- `love.graphics.push()`/`pop()` 用来保存与恢复绘制状态：
  ```lua
  love.graphics.push()
      love.graphics.translate(...)
      -- 绘制游戏世界
  love.graphics.pop()
  -- 绘制 UI
  love.graphics.print(score, 10, 10)
  ```

## 画布（Canvas）

- `love.graphics.newCanvas()` 创建离屏缓冲；`love.graphics.setCanvas(canvas)` 把接下来的绘制输出到该画布。
- 再次调用 `setCanvas()`（不带参数）恢复默认屏幕，然后将画布作为纹理绘制，可用于后期特效、缩略图或分屏。

```lua
sceneCanvas = love.graphics.newCanvas()

function love.draw()
        love.graphics.setCanvas(sceneCanvas)
        love.graphics.clear()
        -- 绘制游戏场景
        love.graphics.setCanvas()

        love.graphics.draw(sceneCanvas, 0, 0)
        love.graphics.print(score, 10, 10)
end
```

___

## 总结

通过平移/缩放控制“摄像机”，利用 push/pop 管理绘制状态。Canvas 可以把场景绘制到离屏缓冲，再进行特效或复用。
