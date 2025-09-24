# 第 10 章 - 库

库（library）是一段可复用的代码，能帮我们快速获得某种功能。

以 rxi 的 [tick](https://github.com/rxi/tick) 为例：把 `tick.lua` 放到项目中，用 `tick = require "tick"` 加载，然后在 `love.update` 里调用 `tick.update(dt)`。

```lua
drawRectangle = false

tick.delay(function()
        drawRectangle = true
end, 2)
```

上面的例子会在 2 秒后把 `drawRectangle` 设为 `true`，我们再在 `love.draw` 中检查这个布尔值来决定是否画矩形。

库本质就是 Lua 代码，所以也能传入函数当作参数。

Lua 自带的 *标准库* 也很重要，比如 `math.random(100, 500)` 可以生成随机数，搭配 `love.keypressed` 就能在按空格时把矩形放到随机位置。

___

## 总结

善用开源库可以节省时间，Lua 也提供了丰富的标准库函数供我们直接调用。
