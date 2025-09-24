# 第 13 章 - 检测碰撞

要判断两个轴对齐矩形是否相交（AABB），需要同时满足四个条件：

1. A 的右边在 B 的左边右侧。
2. A 的左边在 B 的右边左侧。
3. A 的下边在 B 的上边下方。
4. A 的上边在 B 的下边上方。

转换成代码如下：

```lua
function checkCollision(a, b)
        local a_left   = a.x
        local a_right  = a.x + a.width
        local a_top    = a.y
        local a_bottom = a.y + a.height

        local b_left   = b.x
        local b_right  = b.x + b.width
        local b_top    = b.y
        local b_bottom = b.y + b.height

        return  a_right > b_left
            and a_left < b_right
            and a_bottom > b_top
            and a_top < b_bottom
end
```

然后在 `love.update` 中让一个矩形移动、在 `love.draw` 中改变绘制方式，就能在两者重叠时得到碰撞结果。

___

## 总结

AABB 碰撞检测只需比较矩形四条边的位置，用布尔条件组合即可得到结果。
