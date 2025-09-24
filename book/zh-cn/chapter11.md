# 第 11 章 - 类

类就像蓝图。用一张蓝图可以建造很多房子，同样地，我们也能从一个类创建多个对象。

![](/images/book/11/blueprint.png)

为了使用类，我们需要一个库：[classic](https://github.com/rxi/classic)。

点击 `classic.lua`，再点击 Raw，然后[复制源码](https://raw.githubusercontent.com/rxi/classic/master/classic.lua)。

回到你的文本编辑器，新建一个叫做 `classic.lua` 的文件，并把代码粘贴进去。

接下来我们要在程序里引用它。

```lua
function love.load()
    Object = require "classic"
end
```

现在我们已经准备好来创建一个类了。新建文件 `rectangle.lua`，把下面的代码放进去：

```lua
--! file: rectangle.lua

-- 把 Object 作为第一个参数传入。
Rectangle = Object.extend(Object)

function Rectangle.new(self)
    self.test = math.random(1, 1000)
end
```

稍后我们会解释所有内容，但先把这段代码放进你的 `main.lua`。

```lua
--! file: main.lua
function love.load()
    Object = require "classic"
    -- 别忘了加载文件
    require "rectangle"

    r1 = Rectangle()
    r2 = Rectangle()
    print(r1.test, r2.test)
end
```

运行游戏时，你会看到打印出了两个随机数。

接下来我们逐行分析这段代码。首先通过 `Rectangle = Object.extend(Object)` 创建了一个新类。这样 `Rectangle` 就成为一个类，这是我们的蓝图。与普通属性不同，类名通常首字母大写（也就是 UpperCamelCase 或 PascalCase）。

在 `main.lua` 中我们写了 `r1 = Rectangle()`。虽然 `Rectangle` 是一个表，但我们仍然可以像调用函数那样去调用它。这个机制留到以后再讲。调用 `Rectangle()` 会创建一个新的实例，这意味着它会基于我们的蓝图构造一个具有类全部特性的对象。每个实例都是独立的。

为了证明 `r1` 是独立的，我们又创建了一个名为 `r2` 的实例。它们都有 `test` 属性，但值不同。

当我们调用 `Rectangle()` 时，会执行 `Rectangle.new`。这就是所谓的“构造函数”。

参数 `self` 表示我们正在修改的实例。如果我们写 `Rectangle.test = math.random(0, 1000)`，就会把属性赋给蓝图本身，而不是由蓝图创建的实例。

让我们对这个类做一些修改：

```lua
--! file: rectangle.lua
Rectangle = Object.extend(Object)

function Rectangle.new(self)
    self.x = 100
    self.y = 100
    self.width = 200
    self.height = 150
    self.speed = 100
end


function Rectangle.update(self, dt)
    self.x = self.x + self.speed * dt
end


function Rectangle.draw(self)
    love.graphics.rectangle("line", self.x, self.y, self.width, self.height)
end
```

这和我们在[第 8 章](/learn/book/8)里制作的移动矩形对象很相似，只不过这次我们把移动和绘制的代码放进了对象内部。现在在 `main.lua` 中只需要调用它的更新和绘制函数即可。

```lua
--! file: main.lua

function love.load()
    Object = require "classic"
    require "rectangle"
    r1 = Rectangle()
    r2 = Rectangle()
end


function love.update(dt)
    r1.update(r1, dt)
end


function love.draw()
    r1.draw(r1)
end
```

运行游戏时你会看到一个移动的矩形。

我们创建了一个名为 `Rectangle` 的类，并实例化为 `r1`。现在 `r1` 拥有 `update` 和 `draw` 这两个函数。我们调用它们，并且把实例自身 `r1` 作为第一个参数传进去，这个参数在函数里就变成了 `self`。

不过每次调用函数都要手动传入 `r1` 有点烦人。幸运的是，Lua 提供了一个简写。使用冒号（:）调用函数时，Lua 会自动把冒号左侧的对象作为第一个参数传入。

```lua
--! file: main.lua
function love.update(dt)
    -- Lua 会把它转换为：r1.update(r1, dt)
    r1:update(dt)
end


function love.draw()
    -- Lua 会把它转换为：r1.draw(r1)
    r1:draw()
end
```

在定义函数时也可以使用同样的写法。

```lua
--! file: rectangle.lua

-- Lua 会把它转换为：Object.extend(Object)
Rectangle = Object:extend()

-- Lua 会把它转换为：Rectangle.new(self)
function Rectangle:new()
    self.x = 100
    self.y = 100
    self.width = 200
    self.height = 150
    self.speed = 100
end


-- Lua 会把它转换为：Rectangle.update(self, dt)
function Rectangle:update(dt)
    self.x = self.x + self.speed * dt
end


-- Lua 会把它转换为：Rectangle.draw(self)
function Rectangle:draw()
    love.graphics.rectangle("line", self.x, self.y, self.width, self.height)
end
```

我们把这种写法称为[*语法糖*](https://zh.wikipedia.org/wiki/%E8%AF%AD%E6%B3%95%E7%B3%96)。

让我们给 `Rectangle:new()` 添加一些参数。

```lua
--! file: rectangle.lua
function Rectangle:new(x, y, width, height)
    self.x = x
    self.y = y
    self.width = width
    self.height = height
    self.speed = 100
end
```

这样我们就能分别给 `r1` 和 `r2` 指定它们自己的位置和尺寸。

```lua
--! file: main.lua

function love.load()
    Object = require "classic"
    require "rectangle"
    r1 = Rectangle(100, 100, 200, 50)
    r2 = Rectangle(350, 80, 25, 140)
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

现在我们拥有两个移动的矩形，这就是类的强大之处。`r1` 和 `r2` 拥有相同的结构，但彼此独立。

![](/images/book/11/moving_rectangles_classes.gif)

类的另一个优势是“继承”。

___

## 继承

通过继承，我们可以扩展类。换句话说，我们复制蓝图并给它添加功能，而不用修改原始蓝图。

![](/images/book/11/extension.png)

假设你的游戏里有多种怪物。每个怪物都有自己的攻击方式和移动方式，但它们都可以受到伤害，也都可能死亡。这些共同的特性应该放在所谓的*超类*或*基类*中。基类提供所有怪物共有的功能，然后每个怪物的类再继承这个基类并添加自己的特性。

我们来创建另一个移动的形状——圆形。移动矩形和圆形有哪些共同点？它们都会移动。所以我们为这些形状创建一个基类。

新建文件 `shape.lua`，并写入以下代码：

```lua
--! file: shape.lua
Shape = Object:extend()

function Shape:new(x, y)
    self.x = x
    self.y = y
    self.speed = 100
end


function Shape:update(dt)
    self.x = self.x + self.speed * dt
end
```

现在我们的基类 `Shape` 负责移动逻辑。需要说明的是，“基类”只是一个术语，比如“X 是 Y 的基类”。基类和其他类本质上没有区别，只是使用方式不同。

既然我们已有处理移动的基类，就可以让 `Rectangle` 继承 `Shape`，并移除它自己的更新函数。别忘了在使用前先 `require "shape"`。

```lua
--! file: main.lua

function love.load()
    Object = require "classic"
    require "shape"
    require "rectangle"
    r1 = Rectangle()
    r2 = Rectangle()
end
```

```lua
--! file: rectangle.lua
Rectangle = Shape:extend()

function Rectangle:new(x, y, width, height)
    Rectangle.super.new(self, x, y)
    self.width = width
    self.height = height
end

function Rectangle:draw()
    love.graphics.rectangle("line", self.x, self.y, self.width, self.height)
end
```

通过 `Rectangle = Shape:extend()`，我们让 `Rectangle` 成为了 `Shape` 的子类。

`Shape` 自己也有一个 `:new()` 函数。当我们定义 `Rectangle:new()` 时，就覆盖了原本的函数。也就是说，当调用 `Rectangle()` 时，将执行 `Rectangle:new()`，而不是 `Shape:new()`。

不过 `Rectangle` 拥有名为 `super` 的属性，它指向 `Rectangle` 继承的那个类。通过 `Rectangle.super` 我们可以访问基类的函数，并用它来调用 `Shape:new()`。

因为我们不是以实例的方式调用该函数，所以需要手动把 `self` 作为第一个参数传入，不能让 Lua 用冒号（:）帮我们处理。

接下来我们需要制作一个圆形类。新建文件 `circle.lua`，写入下面的代码。

```lua
--! file: circle.lua
Circle = Shape:extend()

function Circle:new(x, y, radius)
    Circle.super.new(self, x, y)
    -- 圆形没有宽度或高度，只有半径。
    self.radius = radius
end


function Circle:draw()
    love.graphics.circle("line", self.x, self.y, self.radius)
end
```

我们让 `Circle` 继承 `Shape`，并通过 `Circle.super.new(self, x, y)` 把 `x` 与 `y` 传给 `Shape` 的 `new()` 函数。

然后给 `Circle` 类提供自己的绘制函数。这就是绘制圆形的方式。圆没有宽和高，而是半径。

现在在 `main.lua` 中加载 `shape.lua` 和 `circle.lua`，并把 `r2` 改成圆。

```lua
--! file: main.lua

function love.load()
    Object = require "classic"
    -- 别忘了加载文件
    require "shape"

    require "rectangle"

    -- 别忘了加载文件
    require "circle"

    r1 = Rectangle(100, 100, 200, 50)

    -- 把 r2 变成 Circle，而不是 Rectangle
    r2 = Circle(350, 80, 40)
end
```

现在运行游戏，你会看到一个移动的矩形和一个移动的圆。

![](/images/book/11/moving_rectangle_circle.gif)

___

## 再来一遍

我们再把所有代码过一遍。

首先用 `require "classic"` 加载 classic 库。加载这个库会返回一个表，我们把它存进 `Object`。它提供了模拟类所需的最基础功能。因为 Lua 自身没有类，借助 `classic` 可以非常好地模拟类。

接着加载 `shape.lua`。在那个文件里我们创建了一个名为 `Shape` 的新类。这个类将作为 `Rectangle` 和 `Circle` 的*基类*。这两个类都拥有 `x` 和 `y` 属性，并且会水平移动，这些共同点都放进 `Shape`。

然后我们创建 `Rectangle` 类，让它继承基类 `Shape`。在 `:new()` 函数（也就是构造函数）里，我们通过 `Rectangle.super.new(self, x, y)` 调用基类的构造函数。我们把 `self` 作为第一个参数传入，以便 `Shape` 使用实例本身，而不是蓝图本身。之后再给矩形添加 `width` 和 `height` 属性，并实现它的绘制函数。

接下来对圆形做同样的事情，只不过它用的是 `radius` 属性，而不是宽和高。

当类准备好之后，我们就可以实例化它们。`r1 = Rectangle(100, 100, 200, 50)` 会创建一个 `Rectangle` 类的实例。它是根据蓝图构造出来的对象，而不是蓝图本身，对这个实例的修改不会影响类。我们更新并绘制这个实例时使用冒号语法，因为需要把实例作为第一个参数传入，冒号会帮我们自动完成这一步。

最后我们对 `r2` 做相同的事情，只不过它是 `Circle`。

___

## 迷惑了吗？

这一章包含了大量信息，如果你暂时觉得难以理解也是很正常的。我的建议是继续跟着教程练习。如果你是编程新手，掌握这些新概念需要一些时间，但最终你会习惯它们。在讲解新内容的同时，我也会不断回顾旧概念。

___

## 做得更规范

在这个教程里我为了方便使用了全局变量。但更规范的做法是使用局部变量。

我们需要对类做两点修改：

1. 在文件中把类声明为局部变量。
2. 在文件末尾返回这个变量。

下面是 `shape.lua` 的改法：

```lua
--! file: shape.lua
local Shape = Object:extend()

function Shape:new(x, y)
    self.x = x
    self.y = y
    self.speed = 100
end


function Shape:update(dt)
    self.x = self.x + self.speed * dt
end

return Shape
```

然后在其他类的文件里，我们通过 `require` 载入 shape 文件，并把它的返回值赋给一个变量，就像处理 classic 那样。

```lua
--! file: rectangle.lua
-- 这里的变量名随便取什么都可以，不过保持一致会更好。
local Shape = require "shape"

-- 也把 Rectangle 设为局部变量。
local Rectangle = Shape:extend()

function Rectangle:new(x, y, width, height)
    Rectangle.super.new(self, x, y)
    self.width = width
    self.height = height
end

function Rectangle:draw()
    love.graphics.rectangle("line", self.x, self.y, self.width, self.height)
end

-- 最后把它返回。
return Rectangle
```

最后，在 `main.lua` 里我们同样可以创建局部变量。

```lua
--! file: main.lua

function love.load()
    Object = require "classic"
    -- 不再需要在这里 require shape。

    local Rectangle = require "rectangle"

    local Circle = require "circle"

    r1 = Rectangle(100, 100, 200, 50)

    r2 = Circle(350, 80, 40)
end
```

我们也可以把 `Object = require "classic"` 移到 `shape.lua` 中，并将其设为局部变量。`r1` 和 `r2` 也可以设为局部变量，但需要在 `love.load` 外部声明。

```lua
--! file: main.lua

-- 把变量设为局部后，r1 和 r2 就不再是全局变量。
local r1, r2

function love.load()
    Object = require "classic"

    local Rectangle = require "rectangle"

    local Circle = require "circle"

    r1 = Rectangle(100, 100, 200, 50)

    r2 = Circle(350, 80, 40)
end
```

这些额外的步骤看起来似乎只是重复劳动，但能让代码更加整洁。想象一下，如果你的游戏里有一个全局变量 `score`，而游戏中还有一个带自己得分系统的小游戏，就可能会意外覆盖全局的 `score`，结果你会困惑为什么分数不对。全局变量可以使用，但请谨慎使用。

___

## 总结

类就像蓝图。我们可以从一个类创建多个对象。为了模拟类，我们使用 classic 库。可以通过 `ClassName = Object:extend()` 创建类，通过 `instanceName = ClassName()` 创建实例，它会调用 `ClassName:new()` 函数，也就是构造函数。类的每个函数都应该以 `self` 作为第一个参数，这样在调用函数时就能把实例作为首个参数传入（`instanceName.functionName(instanceName)`）。我们可以使用冒号语法（:）让 Lua 自动完成这一步。

可以用 `ExtensionName = ClassName:extend()` 扩展一个类。这样 `ExtensionName` 就是 `ClassName` 的副本，我们可以在不修改 `ClassName` 的前提下为它添加属性。如果我们在 `ExtensionName` 中定义了与 `ClassName` 同名的函数，仍然可以通过 `ExtensionName.super.functionName(self)` 调用原函数。

通过使用局部变量，代码将更加整洁且易于维护。
