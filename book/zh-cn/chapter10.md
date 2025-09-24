# 第 10 章 - 库

库是一段任何人都可以用来为自己的项目添加特定功能的代码。

我们来试试一个库。我们要使用 *rxi* 编写的 *tick*。你可以在 [GitHub](https://github.com/rxi/tick) 上找到这个库。

点击 `tick.lua` 然后再点击 Raw，接着[复制全部代码](https://raw.githubusercontent.com/rxi/tick/master/tick.lua)。

回到你的文本编辑器，新建一个名为 `tick.lua` 的文件并粘贴这段代码。

现在我们需要遵循 GitHub 页面上的指引。首先，用 `require` 把它加载进来。

```lua
function love.load()
    tick = require "tick"
end
```

注意 `require` 后面没有括号 ()。这是因为在只传入一个参数时，可以省略它们。当然，我还是建议在其他函数调用中加上括号，不过对于 `require` 来说，省略括号是很常见的写法。只是话说回来，这其实并不会带来什么区别。

接着我们要在更新函数里放入 `tick.update(dt)`。

```lua
function love.update(dt)
    tick.update(dt)
end
```

现在我们已经准备好使用这个库了。让我们设置一个效果：在 2 秒之后绘制一个矩形。

```lua
function love.load()
    tick = require "tick"

    -- 创建一个布尔值
    drawRectangle = false

    -- 第一个参数是函数
    -- 第二个参数是等待多久调用这个函数
    tick.delay(function () drawRectangle = true end ,       2)
end

function love.draw()
    -- 如果 drawRectangle 为真，就绘制一个矩形
    if drawRectangle then
        love.graphics.rectangle("fill", 100, 100, 300, 200)
    end
end
```

我们刚刚把一个函数当作参数传进去了？当然可以呀。函数本来就是一种变量。

运行游戏你就会看到，有了这个库我们可以给函数调用加上延迟。而像这样提供各种功能的库还有很多。

不要因为使用库而感到愧疚。为什么要重新发明轮子呢？除非你对自己动手实现很感兴趣。我个人在项目里大概会用到 10 个库。它们提供的功能是我不懂得如何自己实现的，而且我也不打算去研究。

库并不是魔法。它们都是 Lua 代码，只要我们掌握了相关知识，你我都写得出来。我们会在之后的章节自己做一个库，从而更好地理解它们的运作方式。

___

## 标准库

Lua 自带了一些库，称为 *标准库*。它们就是 Lua 内置的函数。比如 `print` 就是标准库的一部分，`table.insert` 和 `table.remove` 也是。

有一个重要但我们尚未接触的标准库叫作 *math 库*。它提供了数学相关的函数，在制作游戏时会非常有用。

例如，`math.random` 会给我们一个随机数。我们来用它在你按下空格时，把矩形放到一个随机的位置。

```lua
function love.load()
    x = 30
    y = 50
end

function love.draw()
    love.graphics.rectangle("line", x, y, 100, 100)
end

function love.keypressed(key)
    -- 如果按下空格，就……
    if key == "space" then
        -- 让 x 和 y 变成 100 到 500 之间的随机数
        x = math.random(100, 500)
        y = math.random(100, 500)
    end
end
```

现在我们理解了什么是库，就可以开始使用一个类库了。

___

## 总结

库是用来提供功能的代码，任何人都可以编写。Lua 也自带了我们称之为标准库的内置库。
