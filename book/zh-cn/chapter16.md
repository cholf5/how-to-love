# 第 16 章 - 角度与距离

## 角度

让我们创建一个会朝鼠标光标方向移动的圆。

先从创建一个圆开始。

```lua
function love.load()
        -- 创建一个名为 circle 的对象
        circle = {}

        -- 为它设置 x、y、radius 和 speed 属性
        circle.x = 100
        circle.y = 100
        circle.radius = 25
        circle.speed = 200
end


function love.draw()
        -- 绘制圆
        love.graphics.circle("line", circle.x, circle.y, circle.radius)
end
```

为了让圆朝着光标移动，我们需要知道角度。我们可以通过 `math.atan2` 函数获取角度。第一个参数是目标的 y 坐标减去对象的 y 坐标，第二个参数同理，不过用于 x 坐标。这是少数几个 y 在前、x 在后的情况之一。

基本上，atan2 所做的就是接受一个竖直向量和一个水平向量（距离 + 方向），并利用这些信息返回一个角度。

![](/images/book/16/atan2.png)

要得到所需的速度，我们把圆的位置从目标位置中减去。

```lua
function love.update(dt)
        -- love.mouse.getPosition 返回光标的 x 和 y 位置。
        mouse_x, mouse_y = love.mouse.getPosition()

        angle = math.atan2(mouse_y - circle.y, mouse_x - circle.x)
end


function love.draw()
        love.graphics.circle("line", circle.x, circle.y, circle.radius)

        -- 输出角度
        love.graphics.print("angle: " .. angle, 10, 10)

        -- 这些线用来可视化水平和垂直方向的速度
        love.graphics.line(circle.x, circle.y, mouse_x, circle.y)
        love.graphics.line(circle.x, circle.y, circle.x, mouse_y)

        -- 角度线
        love.graphics.line(circle.x, circle.y, mouse_x, mouse_y)
end
```

![](/images/book/16/angle.gif)

如果 atan2 让你摸不着头脑，也不用担心。你只需要记住：`math.atan2(target_y - object_y, target_x - object_x)` 会给出角度。在我们的例子里，对象是圆，目标是光标。

接下来会出现一些数学内容，但别被吓到。这并不难，就算不太理解，在入门阶段也完全没关系。

运行游戏时你可能会注意到角度不会高于 3.14（圆周率 π）。这是因为 atan2 返回的不是角度制，而是弧度制。

下面这个 gif 演示了什么是弧度。

![](/images/book/16/radian.gif)

如果你仍然感到困惑，推荐观看 [可汗学院的这段视频](https://www.youtube.com/watch?v=EnwWxMZVBeg) 来了解弧度。

一些要点：

* `math.atan2` 返回的角度单位是弧度。
* 返回的角度范围在 -3.14 到 3.14 之间。
* 360 度等于 π*2 弧度。因此 90 度等于 π/2 弧度。


数字 π（圆周率）是圆的周长与直径的比值。也就是说，如果我们取一个圆的直径并用它除以圆的周长，就会得到 π。

![](/images/book/16/pi.gif)

在 Lua 中我们可以通过 `math.pi` 获取 π。

暂时不理解也没关系。第一次没搞懂不要气馁。

___

## 正弦与余弦

现在我们需要让圆朝着鼠标移动。为此我们会使用 `math.cos` 和 `math.sin`。

这两个函数会根据我们传入的角度返回 -1 到 1 之间的值。

这里有一个 gif 可以帮助你想象正弦和余弦。

![](/images/book/16/sinecosine.gif)

下面这张图则展示了 gif 中究竟发生了什么。

![](/images/book/16/sinecosine2.png)

正弦和余弦是根据角度返回 -1 到 1 之间的值。

如果角度指向左侧，那么余弦会是 -1，而正弦会是 0。

![](/images/book/16/sinecosine3.png)

如果角度指向下方，那么余弦会是 0，而正弦会是 1。

![](/images/book/16/sinecosine4.png)

那么我们如何利用这些值让圆朝着鼠标移动呢？方法是把速度乘上它们。例如，如果鼠标位于一个对角角度，比方说右上方，正弦可能是 -0.7，而余弦可能是 0.7。

现在如果我们这样写：

```lua
circle.x = circle.x + circle.speed * dt
circle.y = circle.y + circle.speed * dt
```

圆会直接朝右下方移动。但如果我们像这样乘以正弦和余弦：

```lua
circle.x = circle.x + circle.speed * cos * dt
circle.y = circle.y + circle.speed * sin * dt
```

那么圆会以 `circle.speed * 0.7` 的速度在水平方向移动，

并以 `circle.speed * -0.7` 的速度在垂直方向移动。

这意味着它应该会笔直地朝着鼠标移动。来试试看吧！

```lua
function love.update(dt)
        -- love.mouse.getPosition 返回光标的 x 和 y 位置。
        mouse_x, mouse_y = love.mouse.getPosition()

        angle = math.atan2(mouse_y - circle.y, mouse_x - circle.x)

        cos = math.cos(angle)
        sin = math.sin(angle)

        -- 让圆朝着鼠标移动
        circle.x = circle.x + circle.speed * cos * dt
        circle.y = circle.y + circle.speed * sin * dt
end


function love.draw()
        love.graphics.circle("line", circle.x, circle.y, circle.radius)


        -- 角度线
        love.graphics.line(circle.x, circle.y, mouse_x, mouse_y)
        love.graphics.line(circle.x, circle.y, mouse_x, circle.y)
        love.graphics.line(circle.x, circle.y, circle.x, mouse_y)

end
```

![](/images/book/16/following_circle.gif)

___

## 距离

现在假设我们只想在圆靠近光标时才让它移动。为此我们需要计算它们之间的距离。我们会使用勾股定理。

利用勾股定理，你可以计算出直角三角形中最长的边。

![](/images/book/16/pythagorean.png)

基本的做法是，用较短的两条边构造两个正方形，把这两个正方形的面积相加，得到一个更大的正方形的面积，最后求这个正方形的平方根，你就得到了最长的边，也就是*斜边*的长度。

那么这对我们求距离有什么帮助呢？当你有两个点（在我们的例子中是圆和光标）时，它们之间也存在一个看不见的三角形。

看一看：

```lua
function love.draw()
        love.graphics.circle("line", circle.x, circle.y, circle.radius)
        love.graphics.line(circle.x, circle.y, mouse_x, mouse_y)
        love.graphics.line(circle.x, circle.y, mouse_x, circle.y)
        love.graphics.line(mouse_x, mouse_y, mouse_x, circle.y)
end
```

![](/images/book/16/triangle.png)

如果我们对这个三角形使用勾股定理，就能算出它的斜边，从而知道这两个点之间的距离。

我们来为此编写一个新函数。首先需要得到水平和垂直的边。

```lua
function getDistance(x1, y1, x2, y2)
        local horizontal_distance = x1 - x2
        local vertical_distance = y1 - y2
end
```

接着我们需要把这些数字平方。可以通过自身相乘或用 `^2` 来实现。

```lua
function getDistance(x1, y1, x2, y2)
        local horizontal_distance = x1 - x2
        local vertical_distance = y1 - y2

        -- 两种写法都可以
        local a = horizontal_distance * horizontal_distance
        local b = vertical_distance ^2
end
```

现在我们要把这两个数字相加并求平方根。如果我们把 5 平方（也就是 5*5 或 5^2），会得到 25，所以 25 的平方根是 5。我们可以使用 `math.sqrt` 求平方根。

```lua
function getDistance(x1, y1, x2, y2)
        local horizontal_distance = x1 - x2
        local vertical_distance = y1 - y2
        -- 两种写法都可以
        local a = horizontal_distance * horizontal_distance
        local b = vertical_distance ^2

        local c = a + b
        local distance = math.sqrt(c)
        return distance
end
```

为了验证它是否有效，我们来画一个半径等于距离的圆。

```lua
function love.draw()
        love.graphics.circle("line", circle.x, circle.y, circle.radius)
        love.graphics.line(circle.x, circle.y, mouse_x, mouse_y)
        love.graphics.line(circle.x, circle.y, mouse_x, circle.y)
        love.graphics.line(mouse_x, mouse_y, mouse_x, circle.y)

        local distance = getDistance(circle.x, circle.y, mouse_x, mouse_y)
        love.graphics.circle("line", circle.x, circle.y, distance)
end
```

![](/images/book/16/following_circle_distance.gif)

成功了！现在来玩点有意思的。我希望圆只在距离小于 400 像素时移动，而且越接近目标移动得越慢。

```lua
function love.update(dt)
        mouse_x, mouse_y = love.mouse.getPosition()
        angle = math.atan2(mouse_y - circle.y, mouse_x - circle.x)
        cos = math.cos(angle)
        sin = math.sin(angle)

        local distance = getDistance(circle.x, circle.y, mouse_x, mouse_y)

        if distance < 400 then
                circle.x = circle.x + circle.speed * cos * (distance/100) * dt
                circle.y = circle.y + circle.speed * sin * (distance/100) * dt
        end
end
```
![](/images/book/16/following_circle_distance_speed.gif)

___

## 图像
让我们使用一张图像，并让它朝向光标。

![](/images/book/16/arrow_right.png)

旋转参数默认是 0。

当角度为 0 时，余弦为 1，正弦为 0，这意味着对象会朝右移动。

因此当你使用图像时，应该让它默认朝向右方。

```lua
function love.load()
        arrow = {}
        arrow.x = 200
        arrow.y = 200
        arrow.speed = 300
        arrow.angle = 0
        arrow.image = love.graphics.newImage("arrow_right.png")
end

function love.update(dt)
        mouse_x, mouse_y = love.mouse.getPosition()
        arrow.angle = math.atan2(mouse_y - arrow.y, mouse_x - arrow.x)
        cos = math.cos(arrow.angle)
        sin = math.sin(arrow.angle)

        arrow.x = arrow.x + arrow.speed * cos * dt
        arrow.y = arrow.y + arrow.speed * sin * dt
end

function love.draw()
        love.graphics.draw(arrow.image, arrow.x, arrow.y, arrow.angle)
        love.graphics.circle("fill", mouse_x, mouse_y, 5)
end
```

运行游戏时你可能会注意到箭头有些偏移。

![](/images/book/16/arrow_off.png)

这是因为图像围绕其左上角旋转，而不是围绕中心。要修复它，我们需要把原点放在图像中心。


```lua
function love.load()
        arrow = {}
        arrow.x = 200
        arrow.y = 200
        arrow.speed = 300
        arrow.angle = 0
        arrow.image = love.graphics.newImage("arrow_right.png")
        arrow.origin_x = arrow.image:getWidth() / 2
        arrow.origin_y = arrow.image:getHeight() / 2
end
```

```lua
function love.draw()
        love.graphics.draw(arrow.image,
                arrow.x, arrow.y, arrow.angle, 1, 1,
                arrow.origin_x, arrow.origin_y)
        love.graphics.circle("fill", mouse_x, mouse_y, 5)
end
```

现在它就能正确指向光标了。

![](/images/book/16/following_arrow.gif)

___

## 总结

我们可以通过获取角度的余弦和正弦，让对象按照角度移动。然后用速度乘以余弦得到 x 方向的移动量，用速度乘以正弦得到 y 方向的移动量。我们可以使用勾股定理计算两点之间的距离。当你使用图像时，应让它默认指向右方，并别忘了把原点放在图像中心。
