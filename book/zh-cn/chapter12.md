# 第 12 章 - 图像

把 PNG 图片放在与 `main.lua` 同目录下后，就能用 `love.graphics.newImage` 加载：

```lua
function love.load()
        myImage = love.graphics.newImage("sheep.png")
end
```

绘制图像的函数是 `love.graphics.draw`：

```lua
love.graphics.draw(myImage, 100, 100, rotation, scaleX, scaleY, originX, originY, shearX, shearY)
```

除了第一个参数外，其余都是可选：

- `x, y` 控制位置。
- `r` 控制旋转角度（单位为弧度）。
- `sx, sy` 控制缩放，也可通过负数实现镜像。
- `ox, oy` 决定旋转/缩放的基准点，配合 `myImage:getWidth()` 和 `myImage:getHeight()` 就能把中心当原点。
- `kx, ky` 用于剪切（shear）。

图像对象本身还提供方法，例如 `:getWidth()`、`:getHeight()`。

颜色通过 `love.graphics.setColor(r, g, b, a)` 设置，取值范围 0~1；背景色则是 `love.graphics.setBackgroundColor`。

___

## 总结

加载图片、绘制图片都很直观，善用可选参数与颜色设置即可灵活控制效果。
