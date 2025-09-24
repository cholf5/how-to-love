# 第 17 章 - 动画

## 帧序列

1. 将多张逐帧图片加载进表：
   ```lua
   frames = {}
   for i = 1, 5 do
           frames[i] = love.graphics.newImage("jump" .. i .. ".png")
   end
   ```
2. 使用 `currentFrame` 控制当前帧：
   ```lua
   currentFrame = 1

   function love.update(dt)
           currentFrame = currentFrame + 10 * dt
           if currentFrame >= 6 then currentFrame = 1 end
   end

   function love.draw()
           love.graphics.draw(frames[math.floor(currentFrame)], 100, 100)
   end
   ```

## 精灵图与 Quad

把多张帧合并成一张精灵图后，用 `love.graphics.newQuad` 指定要绘制的区域：

```lua
image = love.graphics.newImage("jump.png")
quads = {}
for i = 0, 4 do
        quads[i + 1] = love.graphics.newQuad(96 * i, 0, 96, 96, image:getDimensions())
end

function love.draw()
        love.graphics.draw(image, quads[math.floor(currentFrame)], 100, 100)
end
```

`newQuad` 的参数依次是：起点坐标、区域宽高、以及原图尺寸。

___

## 总结

动画的核心是按时间切换帧。可以直接切换多张图片，也可以通过 `Quad` 在一张精灵图中取出不同区域。
