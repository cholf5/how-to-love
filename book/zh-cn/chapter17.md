# 第 17 章 - 动画

## 帧序列

让我们来制作一张动画图像。

首先，你需要一些图片：

![](/images/book/17/jump1.png)、![](/images/book/17/jump2.png)、![](/images/book/17/jump3.png)、![](/images/book/17/jump4.png) 和 ![](/images/book/17/jump5.png)

你也可以在[这里](https://drive.google.com/file/d/1bMVMUv-B0XF9nBJfw_7ek781cmUjrdgn/view?usp=sharing)下载它们的压缩包。

加载这些图片并把它们放进一个表中。

```lua
function love.load()
    frames = {}

    table.insert(frames, love.graphics.newImage("jump1.png"))
    table.insert(frames, love.graphics.newImage("jump2.png"))
    table.insert(frames, love.graphics.newImage("jump3.png"))
    table.insert(frames, love.graphics.newImage("jump4.png"))
    table.insert(frames, love.graphics.newImage("jump5.png"))
end
```

等等，我们可以更高效地完成这件事。

```lua
function love.load()
    frames = {}

    for i=1,5 do
        table.insert(frames, love.graphics.newImage("jump" .. i .. ".png"))
    end
end
```

好多了！现在我们需要创建一个动画。要怎么做呢？

*用 for 循环？*

不行。for 循环会让我们在同一时间绘制所有帧，而我们想要的是每秒绘制不同的帧。我们需要一个每秒增加 1 的变量。这个很简单！

```lua
function love.load()
    frames = {}

    for i=1,5 do
        table.insert(frames, love.graphics.newImage("jump" .. i .. ".png"))
    end

    -- 我用一个长一点的名字，免得和名为 frames 的变量混淆
    currentFrame = 1
end


function love.update(dt)
    currentFrame = currentFrame + dt
end
```

现在我们有了每秒增加 1 的变量 `currentFrame`，让我们用它来绘制帧。

```lua
function love.draw()
    love.graphics.draw(frames[currentFrame])
end
```

如果你运行游戏，会得到一个错误：*bad argument #1 to 'draw' (Drawable expected, got nil)*

这是因为我们的变量 `currentFrame` 带有小数。第一次更新之后，`currentFrame` 会变成类似 1.016 的值，而表里在位置 1 和 2 有元素，却没有位置 1.016 的元素。

为了解决这个问题，我们用 `math.floor` 将数字向下取整。这样 1.016 就会变成 1。

```lua
function love.draw()
    love.graphics.draw(frames[math.floor(currentFrame)])
end
```

运行游戏你会看到动画正常播放，但最终仍然会出现错误。这是因为 currentFrame 变得大于（或等于）6，而我们只有 5 帧。为了解决这个问题，我们在它大于（或等于）6 时重置 `currentFrame`。趁这个机会，让我们顺便把动画加速一点。

```lua
function love.update(dt)
    currentFrame = currentFrame + 10 * dt
    if currentFrame >= 6 then
        currentFrame = 1
    end
end
```

看他跳得多欢！

![](/images/book/17/jump.gif)

___

## Quad

这种方式能用，但效率不高。对于大型动画，我们会需要很多图片。如果把所有帧放进一张图里，再只绘制其中的一部分呢？我们可以用 quad 来做到这一点。

首先，下载这张图片：

![](/images/book/17/jump.png)

我们将重写函数 `love.load`（可以保持 `love.update` 和 `love.draw` 不变）。

```lua
function love.load()
    image = love.graphics.newImage("jump.png")
end
```

把 quad 想象成我们从图片上剪下来的一块矩形。我们告诉游戏“我们想要图片里的这部分”。我们将制作第一帧的 quad。可以使用 `love.graphics.newQuad` [(wiki)](https://love2d.org/wiki/love.graphics.newQuad)。

前两个参数是 quad 的 x 和 y 位置。因为我们想要第一帧，所以取图片的左上角，也就是 0,0。

```lua
function love.load()
    image = love.graphics.newImage("jump.png")
    frames = {}
    table.insert(frames, love.graphics.newQuad(0, 0))
end
```

再强调一次，quad 就像在纸上剪出一块。我们最终把图片绘制在哪里与 quad 无关。

![](/images/book/17/quad_position.png)

接下来的两个参数是 quad 的宽和高。图片中每帧的宽度是 117，高度是 233。最后两个参数是整张图片的宽和高。我们可以通过 `image:getWidth()` 和 `image:getHeight()` 获取。

```lua
function love.load()
    image = love.graphics.newImage("jump.png")
    frames = {}
    local frame_width = 117
    local frame_height = 233
    table.insert(frames, love.graphics.newQuad(0, 0, frame_width, frame_height, image:getWidth(), image:getHeight()))

    currentFrame = 1
end
```

现在让我们通过绘制来测试这个 quad。绘制 quad 时，需要把它作为 `love.graphics.draw` 的第二个参数传入。

```lua
function love.draw()
    love.graphics.draw(image, frames[1], 100, 100)
end
```

可以看到，它绘制出了第一帧。很好，现在让我们创建第二个 quad。

要绘制第二帧，我们只需要把矩形向右移动。由于每帧的宽度是 117，所以只需要把 x 向右移动 117。

```lua
function love.load()
    image = love.graphics.newImage("jump.png")
    frames = {}
    local frame_width = 117
    local frame_height = 233
    table.insert(frames, love.graphics.newQuad(0, 0, frame_width, frame_height, image:getWidth(), image:getHeight()))
    table.insert(frames, love.graphics.newQuad(frame_width, 0, frame_width, frame_height, image:getWidth(), image:getHeight()))
end
```

第三个 quad 也可以同样处理。

![](/images/book/17/jump_help.png)

等等，我们是不是在重复同样的操作？我们不是有专门处理重复的工具吗？for 循环！另外，我们还能把 :getWidth 和 :getHeight 的调用结果存到变量里，避免多次调用。

```lua
function love.load()
    image = love.graphics.newImage("jump.png")
    local width = image:getWidth()
    local height = image:getHeight()

    frames = {}

    local frame_width = 117
    local frame_height = 233

    for i=0,4 do
        table.insert(frames, love.graphics.newQuad(i * frame_width, 0, frame_width, frame_height, width, height))
    end

    currentFrame = 1
end
```

注意我们这次的 for 循环从 0 开始到 4 结束，而不是从 1 到 5。这是因为我们的第一个 quad 位于位置 0，而 0 * 177 等于 0。

现在剩下要做的就是使用 currentFrame 来决定要绘制的 quad。

```lua
function love.draw()
    love.graphics.draw(image, frames[math.floor(currentFrame)], 100, 100)
end
```

___

## 多行帧

现在我们可以把一行帧做成动画了，但如果有多行怎么办？

![](/images/book/17/jump_2.png)

很简单，我们只需要用不同的 y 值重复同样的事情。

```lua
function love.load()
    image = love.graphics.newImage("jump_2.png")
    local width = image:getWidth()
    local height = image:getHeight()

    frames = {}

    local frame_width = 117
    local frame_height = 233

    for i=0,2 do
        table.insert(frames, love.graphics.newQuad(i * frame_width, 0, frame_width, frame_height, width, height))
    end

    for i=0,1 do
        table.insert(frames, love.graphics.newQuad(i * frame_width, frame_height, frame_width, frame_height, width, height))
    end

    currentFrame = 1
end
```

但是等等，我们又看到了重复！碰到重复我们该怎么办？用 for 循环。

*所以，比如说，在 for 循环里面再套一个 for 循环？*

没错！不过我们得做一些调整。

```lua
function love.load()
    image = love.graphics.newImage("jump_2.png")
    local width = image:getWidth()
    local height = image:getHeight()

    frames = {}

    local frame_width = 117
    local frame_height = 233

    for i=0,1 do
        -- 我把内层 for 循环里的 i 改成了 j
        for j=0,2 do
            -- 所以这里也要改成 j
            table.insert(frames, love.graphics.newQuad(j * frame_width, i * frame_height, frame_width, frame_height, width, height))
        end
    end

    currentFrame = 1
end
```

在外层 for 循环的第一次迭代中，i 等于 0，而 j 依次等于 0、1、2。
在第二次迭代中，i 等于 1，而 j 又依次等于 0、1、2。

你可能会注意到我们多了一个空的 quad。虽然我们只绘制前 5 个 quad，这不是什么大问题，但我们可以像这样避免它：

```lua
maxFrames = 5
for i=0,1 do
    for j=0,2 do
        table.insert(frames, love.graphics.newQuad(j * frame_width, i * frame_height, frame_width, frame_height, width, height))
        if #frames == maxFrames then
            break
        end
    end
    print("I don't break!")
end
```

使用 `break` 可以结束一个 for 循环。这样就能防止添加最后那个 quad。

注意 *"I don't break"* 仍然会被打印出来。这是因为 `break` 只会跳出使用它的那一层循环，外层循环仍然会继续。我们可以在外层循环里加上相同的 if 语句来解决，但在这里没必要，因为那时外层循环已经处于最后一次迭代了。

___

## 边缘溢出

当我们在使用 quad 时旋转和/或缩放图片，可能会出现一种叫作 *边缘溢出（bleeding）* 的现象。问题在于 quad 外部的部分也被绘制了出来。

假设我们的精灵图是这样的：

![](/images/book/17/rectangles1.png)

第一帧可能就会变成这样：

![](/images/book/17/bleeding.png)

造成这种现象的原因比较技术性，但事实就是它会发生。幸运的是，我们可以通过在帧的周围增加 1 像素的边框来解决这个问题。边框可以使用和实际边框相同的颜色，也可以使用透明像素。

![](/images/book/17/bleeding_fix.png)

然后我们在 quad 中不包含那圈边框。

我给我们的跳跃角色加了一圈边框。我把它做成紫色而不是透明，这样如果不小心绘制到了边框就能看得出来。

![](/images/book/17/jump_3.png)

让我们一步一步完成这件事。

首先，我们不想绘制第一列像素，所以我们的 quad 从 1 开始（而不是 0）。

```lua
newQuad(1, 1, frame_width, frame_height, width, height)
```

好吧，这对第一帧有效，但下一帧我们该绘制哪部分呢？简单地加上帧宽/帧高吗？

```lua
newQuad(1 + j * frame_width, 1 + i * frame_height, frame_width, frame_height, width, height)
```

差不多。我们还少了点什么。

![](/images/book/17/almost.png)

蓝色的线条是我们的 quad。可以看到，quad 比应该的位置向左偏了 2 个像素。所以让我们在每次迭代时额外加上 2。

```lua
newQuad(1 + j * (frame_width + 2), 1 + i * (frame_height + 2), frame_width, frame_height, width, height)
```

现在我们的 quad 就在正确的位置了。下面这张图展示了我们是如何定位 quad 的：我们先加 1，然后加上 `frame_width` + 2，并乘以 `i`。这样就能为每一帧准确地定位 quad。

![](/images/book/17/whatisgoingon.png)

___

## 总结

通过 quad 我们可以绘制图像的一部分，用它来把精灵图转换成动画。如果有多行帧，我们可以使用嵌套的 for 循环来遍历整个图集。我们可以使用 `break` 来结束一个循环。为了避免 *边缘溢出*，可以在精灵图上为每帧添加 1 像素的边框。
