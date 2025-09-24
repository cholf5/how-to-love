# 第 11 章 - 类

使用 rxi 的 [classic](https://github.com/rxi/classic) 库可以方便地实现面向对象。先把 `classic.lua` 放到项目里，并在 `love.load` 中执行：

```lua
Object = require "classic"
```

定义一个矩形类：

```lua
Rectangle = Object:extend()

function Rectangle:new()
        self.x = 100
        self.y = 100
        self.width = 200
        self.height = 150
        self.speed = 100
end

function Rectangle:update(dt)
        self.x = self.x + self.speed * dt
end

function Rectangle:draw()
        love.graphics.rectangle("line", self.x, self.y, self.width, self.height)
end
```

在 `main.lua` 中实例化：

```lua
require "rectangle"

function love.load()
        r1 = Rectangle()
        r2 = Rectangle()
end

function love.update(dt)
        r1:update(dt)
        r2:update(dt)
end

function love.draw()
        r1:draw()
        r2:draw()
end
```

`Rectangle()` 会调用构造函数 `:new`，返回一个拥有自身属性的实例。冒号语法会自动把实例作为第一个参数（即 `self`）。

___

## 总结

通过类库可以把数据与行为封装到同一个对象里，多个实例互不影响，代码结构也更清晰。
