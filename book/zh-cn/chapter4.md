# 第 4 章 - LÖVE

LÖVE 是让我们更轻松开发游戏的工具包，它基于 Lua 编程语言。凡是以 `love.` 开头的都是 LÖVE 提供的 API，其余就是 Lua 本身。

比如以下函数都来自 LÖVE：

```lua
love.graphics.circle("fill", 10, 10, 100, 25)
love.graphics.rectangle("line", 200, 30, 120, 100)
```

而这个例子就是纯 Lua：

```lua
function test(a, b)
        return a + b
end
print(test(10, 20))
--Output: 30
```

___

## LÖVE 如何运作

*此处默认你已经安装了 LÖVE。如果还没有，请先回到[第 1 章](1)。*

LÖVE 会调用三个关键函数：

```lua
function love.load()
        -- 初始化变量
end

function love.update(dt)
        -- 每帧更新逻辑
end

function love.draw()
        -- 每帧绘制内容
end
```

执行顺序大致是 `love.load -> love.update -> love.draw -> love.update -> love.draw ...`，循环往复。这种由框架触发的函数叫作 *回调*。

LÖVE 由多个模块组成，例如 `love.graphics`、`love.audio`、`love.filesystem` 等。顾名思义，绘图相关的都在 `love.graphics`，声音相关的在 `love.audio`。

想知道函数怎么用，可以查阅 LÖVE 的 [Wiki](https://www.love2d.org/wiki/Main_Page)。例如要画矩形，先进入 [`love.graphics`](https://www.love2d.org/wiki/love.graphics)，搜索 `rectangle`，就能找到 [`love.graphics.rectangle`](https://www.love2d.org/wiki/love.graphics.rectangle) 的说明。

```lua
function love.draw()
        love.graphics.rectangle("fill", 100, 200, 50, 80)
end
```

运行后就能看到一个填充的矩形。所有这些函数都构成了 LÖVE 的 API（Application Programming Interface）。

___

## 总结

LÖVE 是一个使用 Lua 的游戏框架。我们通过编写 `love.load`、`love.update`、`love.draw` 等回调来控制游戏流程。只要善用官方 Wiki，就能找到各模块提供的全部功能。
