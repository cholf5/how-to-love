# 第 16 章 - 角度与距离

## 指向鼠标

- `math.atan2(targetY - objectY, targetX - objectX)` 可以得到指向目标的角度（弧度制，范围 -π ~ π）。
- `math.cos(angle)` 与 `math.sin(angle)` 返回 -1 到 1 之间的值，用它们乘以速度即可让物体朝目标移动。

```lua
mouseX, mouseY = love.mouse.getPosition()
angle = math.atan2(mouseY - circle.y, mouseX - circle.x)

local cos = math.cos(angle)
local sin = math.sin(angle)

circle.x = circle.x + circle.speed * cos * dt
circle.y = circle.y + circle.speed * sin * dt
```

## 计算距离

使用勾股定理：

```lua
local dx = target.x - circle.x
local dy = target.y - circle.y
local distance = math.sqrt(dx * dx + dy * dy)
```

当 `distance` 小于某个阈值时，就可以判定靠近目标或停止移动。

## 角度转换

- Lua 中 `math.pi` 表示 π。
- 角度转弧度：`math.rad(degree)`；弧度转角度：`math.deg(radian)`。

___

## 总结

`atan2` 给出方向，`sin`/`cos` 让你沿该方向移动，`sqrt(dx*dx + dy*dy)` 则能求出两点间距离。这些数学工具在游戏中非常常用。
