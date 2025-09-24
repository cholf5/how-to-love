# 第 6 章 - 条件语句

*本章延续上一章的代码。*

`if` 语句可以让某段代码只在条件满足时执行。

```lua
if condition then
        -- 条件为真时才会执行
end
```

条件要么为真要么为假，例如 `5 < 9` 返回 `true`，`5 > 9` 返回 `false`。结合上一章的矩形例子，我们可以写：

```lua
if x < 600 then
        x = x + 100 * dt
end
```

这样矩形会一直向右移动，直到 `x` 达到 600。

比较时要记得使用两个等号 `==`，`>=`、`<=` 分别表示“大于等于”和“小于等于”，`~=` 表示“不等于”。

布尔变量可以储存 `true` 或 `false`。例如：

```lua
move = true

if move then
        x = x + 100 * dt
end
```

在条件前加 `not` 可以取反。

使用 LÖVE 自带的 `love.keyboard.isDown` 可以检测键盘输入：

```lua
if love.keyboard.isDown("right") then
        x = x + 100 * dt
elseif love.keyboard.isDown("left") then
        x = x - 100 * dt
else
        -- 按键都没按时执行的逻辑
end
```

___

## 总结

`if / elseif / else` 结合比较运算符和布尔变量，可以根据输入与状态控制游戏行为。
