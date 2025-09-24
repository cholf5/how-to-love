# 第 8 章 - 对象

在上一章中我们把表当作带编号的列表来使用，不过我们还可以用另一种方式存储值：使用字符串。

```lua
function love.load()
    --rect 是 rectangle（矩形）的缩写
    rect = {}
    rect["width"] = 100
end
```

在这个例子里，`"width"` 就是我们所说的*键*或*属性*。因此表 `rect` 现在有了一个名为 `"width"` 的属性，值为 100。创建属性时并不一定要写字符串形式，点号（`.`）是 `table_name["property_name"]` 的简写。

```lua
function love.load()
    rect = {}
    -- 下面两行是等价的
    rect["width"] = 100
    rect.width = 100
end
```

我们再添加一些其他属性。

```lua
function love.load()
    rect = {}
    rect.x = 100
    rect.y = 100
    rect.width = 70
    rect.height = 90
end
```

既然属性都准备好了，就可以把这个矩形画出来。

```lua
function love.draw()
    love.graphics.rectangle("line", rect.x, rect.y, rect.width, rect.height)
end
```

让它动起来吧！

```lua
function love.load()
    rect = {}
    rect.x = 100
    rect.y = 100
    rect.width = 70
    rect.height = 90

    -- 添加一个 speed 属性
    rect.speed = 100
end

function love.update(dt)
    -- 别忘了乘以 delta time，增加 x 的数值
    rect.x = rect.x + rect.speed * dt
end
```

我们再次得到一个会动的矩形，不过为了展示表的强大，我们想创建多个会移动的矩形。为此我们要把表当作列表使用，制作一个矩形列表。把 `love.load` 里的代码移到一个新函数里，并在 `love.load` 中创建一个新表。

```lua
function love.load()
    -- 记得使用 camelCase（驼峰式命名）！
    listOfRectangles = {}
end

function createRect()
    rect = {}
    rect.x = 100
    rect.y = 100
    rect.width = 70
    rect.height = 90
    rect.speed = 100

    -- 把新的矩形放进列表
    table.insert(listOfRectangles, rect)
end
```

现在每次调用 `createRect`，我们都会把一个新的矩形对象添加到列表中。没错，一个表里装着一堆表。让我们实现按下空格就调用 `createRect`。可以通过回调函数 `love.keypressed` 来完成。

```lua
function love.keypressed(key)
    -- 记住，比较时要用两个等号（==）！
    if key == "space" then
        createRect()
    end
end
```

每当我们按下一个按键，LÖVE 就会调用 `love.keypressed`，并把按下的键作为参数传进来。如果这个键是 `"space"`，就会调用 `createRect`。

最后要做的是修改我们的更新和绘制函数。我们需要遍历矩形列表。

```lua
function love.update(dt)
    for i,v in ipairs(listOfRectangles) do
        v.x = v.x + v.speed * dt
    end
end

function love.draw(dt)
    for i,v in ipairs(listOfRectangles) do
        love.graphics.rectangle("line", v.x, v.y, v.width, v.height)
    end
end
```

现在运行游戏时，每按一次空格，屏幕上就会出现一个移动的矩形。

![](/images/book/8/moving_rectangles.gif)

___

## 再来一遍？

这一章用很短的篇幅写了不少代码，难免让人感到困惑，所以我们再把整个流程过一遍：

在 `love.load` 里，我们创建了一个名为 `listOfRectangles` 的表。

按下空格时，LÖVE 会调用 `love.keypressed`，在这个函数里我们检查按下的键是不是 `"space"`。如果是，就调用函数 `createRect`。

在 `createRect` 中我们创建了一个新表，给它添加了 `x`、`y` 等属性，然后把这个新表放进列表 `listOfRectangles` 里。

在 `love.update` 和 `love.draw` 中，我们遍历这个矩形列表，以更新和绘制每一个矩形。

___

## 函数

对象也可以拥有函数。为对象创建函数的方法如下：

```lua
tableName.functionName = function ()
end

-- 或者更常见的写法
function tableName.functionName()
end
```

___

## 总结

我们不仅可以用数字，也可以用字符串来为表存储值。这样的表被称为*对象*。利用对象可以避免创建大量的独立变量。
