# 第 12 章 - 图像

在 LÖVE 中创建和使用图像非常简单。首先我们需要一张图片。我会使用这张图：

![](/images/book/12/sheep.png)

当然，你可以使用任何喜欢的图片，只要它是 *.png* 格式。请确保图片与 `main.lua` 位于同一个文件夹中。

我们先要加载图片，并把它存到一个变量里。为此可以使用 `love.graphics.newImage(path)`，把图片名称作为字符串传入第一个参数。如果你有：

```lua
function love.load()
    myImage = love.graphics.newImage("sheep.png")
end
```

也可以把图片放在子目录中，但要确保路径写完整。

```lua
myImage = love.graphics.newImage("path/to/sheep.png")
```

现在我们的图片存放在变量 `myImage` 中。可以用 `love.graphics.draw` 把它绘制出来。

```lua
function love.draw()
    love.graphics.draw(myImage, 100, 100)
end
```

这就是如何绘制一张图片。

___

## .draw() 的参数

我们来看一下 `love.graphics.draw()` 的全部参数。除了图像本身，其他参数都是可选的。

**image**

要绘制的图像。

**x** 和 **y**

希望绘制图像的水平和垂直位置。

**r**

旋转角度（或称角度）。在 LÖVE 中所有角度都使用弧度。关于弧度会在其他章节进一步说明。

**sx** 和 **sy**

在 **x** 轴和 **y** 轴方向上的缩放。如果想把图像放大到原来的两倍，可以这样写：

`love.graphics.draw(myImage, 100, 100, 0, 2, 2)`

也可以利用这一点来镜像图像：

`love.graphics.draw(myImage, 100, 100, 0, -1, 1)`

**ox** 和 **oy**

图像的 **x** 方向和 **y** 方向的原点。

默认情况下，缩放与旋转都是围绕图像的左上角进行的。

![](/images/book/12/origin1.png)

原点就是基准点。如果我们希望围绕图像中心进行缩放，就需要把原点放到图像的中心。

`love.graphics.draw(myImage, 100, 100, 0, 2, 2, 39, 50)`

![](/images/book/12/origin2.png)

**kx** 和 **ky**

用于剪切（shear）（虽然它们本身并没有 **k** 开头，我也不太清楚为什么会这样命名）。

通过它们可以让图像产生倾斜效果。

![](/images/book/12/shear.png)

我们之前用来绘制文本的 `love.graphics.print` 也有相同的参数。

x, y, r, sx, sy, ox, oy, kx, ky

再次强调，除了 **image** 之外，这些参数都可以省略。我们称它们为“可选参数”。

你可以通过阅读 [API 文档](https://love2d.org/wiki/love.graphics.draw) 来了解 LÖVE 的函数。

___

## 图像对象

`love.graphics.newImage` 返回的其实是一个对象，也就是 [Image](https://love2d.org/wiki/Image) 对象。它拥有一些函数，可以让我们修改图像或取得与图像相关的数据。

例如，我们可以通过 `:getWidth()` 和 `:getHeight()` 获得图像的宽度和高度，从而把原点放在图像中心。

```lua
function love.load()
    myImage = love.graphics.newImage("sheep.png")
    width = myImage:getWidth()
    height = myImage:getHeight()
end

function love.draw()
    love.graphics.draw(myImage, 100, 100, 0, 2, 2, width/2, height/2)
end
```

___

## 颜色

可以使用 `love.graphics.setColor(r, g, b)` 来改变绘制图像时所使用的颜色。它会影响之后绘制的所有内容，不仅仅是图像，还包括矩形、图形和线条。它使用的是 [RGB 模型](https://en.wikipedia.org/wiki/RGB_color_model)。虽然该模型的正式取值范围是 0 到 255，但在 LÖVE 中取值范围是 0 到 1。因此 (255, 200, 40) 在这里要写成 (1, 0.78, 0.15)。如果你只知道 0-255 范围内的颜色值，可以用 `number/255` 计算出需要的数值。还有第四个参数 `a` 表示 alpha，用来控制所有绘制内容的透明度。如果不希望其他绘制调用继续使用当前颜色，别忘了把颜色重置为白色。背景色可以用 `love.graphics.setBackgroundColor(r, g, b)` 设置。由于它只需要调用一次，所以可以放在 `love.load` 中。

```lua
function love.load()
    myImage = love.graphics.newImage("sheep.png")
    love.graphics.setBackgroundColor(1, 1, 1)
end

function love.draw()
    love.graphics.setColor(255/255, 200/255, 40/255, 127/255)
    love.graphics.setColor(1, 0.78, 0.15, 0.5)
    -- 或者……
    love.graphics.draw(myImage, 100, 100)
    -- 不传入 alpha 参数会自动把它恢复为 1。
    love.graphics.setColor(1, 1, 1)
    love.graphics.draw(myImage, 200, 100)
end
```

![](/images/book/12/color.png)

___

## 总结

我们使用 `myImage = love.graphics.newImage("path/to/image.png")` 加载图像，它会返回一个 Image 对象，可以存放在变量中。把这个变量传给 `love.graphics.draw(myImage)` 就能把图像画出来。这个函数还有一些可选参数，用于控制图像的位置、角度和缩放。Image 对象提供了方法，可以获取图像相关的数据。可以通过 `love.graphics.setColor(r, g, b)` 改变图像以及之后所有绘制内容的颜色。
