# 第 23 章 - 解决碰撞

在 AABB 碰撞检测的基础上，还要将相交的对象“推出去”。示例代码建立了 `Entity` 基类，以及 `Player` 和 `Wall` 两个子类。

核心步骤：

1. 判断是否碰撞（复用上一章的矩形碰撞函数）。
2. 计算重叠量：
   ```lua
   local overlapX = math.min(self.x + self.width, wall.x + wall.width) - math.max(self.x, wall.x)
   local overlapY = math.min(self.y + self.height, wall.y + wall.height) - math.max(self.y, wall.y)
   ```
3. 根据重叠量较小的轴进行修正：
   - 如果 `overlapX < overlapY`，说明水平重叠更少，优先沿 X 轴纠正。
   - 根据玩家来自哪一侧调整位置：`self.x = wall.x - self.width` 或 `self.x = wall.x + wall.width`。
4. 若垂直方向更小，则沿 Y 轴处理，防止角色卡在墙里。

处理完位置后，还可以把速度设为 0，避免下一帧继续推入。

___

## 总结

碰撞解决的关键是计算重叠深度，并沿最小重叠轴把对象移出障碍物。虽然实现起来不易，但掌握这个思路就能构建更扎实的移动与阻挡系统。
