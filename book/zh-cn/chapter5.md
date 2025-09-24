# 第5章 - 移动一个矩形

现在我们可以开始我称之为“有趣的部分”了。我们要让东西动起来！

先来看 3 个主要的回调函数。

```lua
function love.load()

end


function love.update()


end


function love.draw()

end
```

接下来，我们绘制一个矩形。

```lua
function love.draw()
        love.graphics.rectangle("line", 100, 50, 200, 150)
end
```

![](/images/book/5/rectangle.png)

这个函数的第二个和第三个参数分别是 x 与 y 坐标。

x 表示“屏幕上的水平位置”。0 在屏幕的最左侧。

y 表示“屏幕上的垂直位置”。0 在屏幕的最上方。

![](/images/book/5/coordinates.png)

现在我们想让这个矩形动起来。是时候像程序员那样思考了。矩形要向右移动，究竟需要发生什么？x 坐标得不断增大：100、101、102、103、104，如此类推。但我们没法把 100 改成 101。100 就是 100。我们需要一个可以随意改变数值的东西。没错，就是**变量**！

在 love.load 中创建一个名为 `x` 的变量，并将 `love.graphics.rectangle` 里的 100 替换为 `x`。

```lua
function love.load()
        x = 100
end

function love.draw()
        love.graphics.rectangle("line", x, 50, 200, 150)
end
```

因此现在我们矩形的 x 坐标就是变量 `x` 的值。

注意变量名 `x` 只是一个名字。我们完全可以把它叫做 `icecream` 或者 `unicorn` 等任意名字。函数并不在乎变量叫什么，它只关心变量的值。

现在我们要让这个矩形动起来。这要在 love.update 中完成。每次更新我们都想让 `x` 增加 5。换句话说，`x` 必须等于 `x` 的当前值再加上 5。我们就是这么写的。

```lua
function love.update()
        x = x + 5
end
```

这样当 `x` 等于 100 时，它会把 `x` 改成 100 + 5。下一次更新时 `x` 就是 105，然后它会变成 105 + 5，如此往复。

运行游戏。矩形现在应该会移动了。

![](/images/book/5/rectangle_move.gif)

___

## Delta time

我们已经让矩形移动了，但还有一个小问题：如果在另一台电脑上运行游戏，矩形的速度可能不同。这是因为并不是所有电脑的更新频率都一样，这就可能导致问题。

举个例子，假设电脑 A 以 100 帧/秒（fps）运行，而电脑 B 以 200 帧/秒运行。

100 x 5 = 500

200 x 5 = 1000

因此，在 1 秒内，电脑 A 上的 `x` 增加了 500，而在电脑 B 上 `x` 增加了 1000。

幸运的是，我们有一个解决方案：delta time。

当 LÖVE 调用 love.update 时，它会传入一个参数。在 love.update 里添加参数 dt（delta time 的缩写），然后把它打印出来看看。

```lua
function love.update(dt)
        print(dt)
        x = x + 5
end
```

delta time 是前一次更新与当前更新之间经过的时间。因此，在以 100 fps 运行的电脑 A 上，delta time 平均是 1 / 100，也就是 0.01。

在电脑 B 上，delta time 是 1 / 200，也就是 0.005。

所以在 1 秒内，电脑 A 更新了 100 次，并把 `x` 增加了 `5 * 0.01`；电脑 B 更新了 200 次，并把 `x` 增加了 `5 * 0.005`。

`100 * 5 * 0.01 = 5`

`200 * 5 * 0.005 = 5`

通过使用 delta time，我们的矩形在所有电脑上都会以相同的速度移动。

```lua
function love.update(dt)
        x = x + 5 * dt
```

现在我们的矩形在所有电脑上都是每秒移动 5 像素。把 5 改成 100 就能让它移动得更快。

___

## 总结
我们使用一个在每次更新时递增的变量，让矩形移动。递增时，我们把要增加的数乘以 delta time。delta time 是前一次更新与当前更新之间经过的时间。通过使用 delta time，可以确保矩形在所有电脑上以相同的速度移动。
