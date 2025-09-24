# 第 13 章 - 检测碰撞

假设我们在制作一款可以向怪物射击的游戏。怪物被子弹击中时应该死亡。那么我们需要检查的是：怪物是否与子弹发生了碰撞？

我们将编写一个 *碰撞检测* 函数，用来判断两个矩形是否相交。这类检测叫作 AABB（Axis-Aligned Bounding Box，轴对齐包围盒）碰撞。那么问题来了：在什么情况下两个矩形会发生碰撞呢？

我准备了一张包含三个例子的图片：

![](/images/book/13/rectangles1.png)

是时候开启你的程序员大脑了。如果你还没这么做的话。第三个例子中发生了什么，而前两个例子中没有发生？

“它们发生了碰撞。”

没错，但还得更具体些。我们需要能够让计算机理解的信息。

看看两个矩形的位置。在第一个例子中，红色矩形没有与蓝色矩形碰撞，因为红色矩形太靠左了。如果红色矩形向右移动一点，它们就会接触。究竟要移动多远呢？只要 **红色矩形的右边** 比 **蓝色矩形的左边** 更靠 **右** 就行了。这个条件在例子 3 中成立。

不过在例子 2 中同样成立。要确保真正发生碰撞，我们还需要更多条件。例子 2 告诉我们不能移动得太靠右。那么需要向左移动多远？当 **红色矩形的左边** 比 **蓝色矩形的右边** 更靠 **左** 时，它们就会相交。

现在我们已经有两个条件了，这就足够了吗？

并没有。看看下面这张图：

![](/images/book/13/rectangles2.png)

这个场景满足我们目前的条件：红色矩形的右边比蓝色矩形的左边靠右，红色矩形的左边也比蓝色矩形的右边靠左。然而它们并没有碰撞，因为红色矩形太靠上了，它还需要继续向下移动。要移动到什么位置呢？直到 **红色矩形的下边** 比 **蓝色矩形的上边** 更靠 **下**。

但如果移动得太靠下，又不会碰撞了。红色矩形最多能向下移动多远，同时仍与蓝色矩形相交？只要 **红色矩形的上边** 比 **蓝色矩形的下边** 更靠 **上** 就可以。

现在我们已经得到了四个条件。这四个条件在下图的三个例子中都为真吗？

![](/images/book/13/rectangles3.png)

**红色矩形的右边** 比 **蓝色矩形的左边** 更靠 **右**。

**红色矩形的左边** 比 **蓝色矩形的右边** 更靠 **左**。

**红色矩形的下边** 比 **蓝色矩形的上边** 更靠 **下**。

**红色矩形的上边** 比 **蓝色矩形的下边** 更靠 **上**。

是的，全都满足！接下来我们要把这些信息写成函数。

先创建两个矩形：

```lua
function love.load()
        -- 创建两个矩形
        r1 = {
                x = 10,
                y = 100,
                width = 100,
                height = 100
        }

        r2 = {
                x = 250,
                y = 120,
                width = 150,
                height = 120
        }
end


function love.update(dt)
        -- 让其中一个矩形移动
        r1.x = r1.x + 100 * dt
end


function love.draw()
        love.graphics.rectangle("line", r1.x, r1.y, r1.width, r1.height)
        love.graphics.rectangle("line", r2.x, r2.y, r2.width, r2.height)
end
```

现在我们创建一个名为 `checkCollision()` 的新函数，并让它接收两个矩形作为参数。

```lua
function checkCollision(a, b)

end
```

首先我们需要得到矩形的四条边。左边就是 x 坐标，右边是 x 加上宽度。y 和高度同理。

```lua
function checkCollision(a, b)
        -- 在局部变量中，常见的写法是使用下划线而非驼峰命名
        local a_left = a.x
        local a_right = a.x + a.width
        local a_top = a.y
        local a_bottom = a.y + a.height

        local b_left = b.x
        local b_right = b.x + b.width
        local b_top = b.y
        local b_bottom = b.y + b.height
end
```

得到了两个矩形的四条边之后，就可以把这些条件写进 if 语句中。

```lua
function checkCollision(a, b)
        -- 在局部变量中，常见的写法是使用下划线而非驼峰命名
        local a_left = a.x
        local a_right = a.x + a.width
        local a_top = a.y
        local a_bottom = a.y + a.height

        local b_left = b.x
        local b_right = b.x + b.width
        local b_top = b.y
        local b_bottom = b.y + b.height

        -- 如果红色矩形的右边比蓝色矩形的左边更靠右
        if  a_right > b_left
        -- 并且红色矩形的左边比蓝色矩形的右边更靠左
        and a_left < b_right
        -- 并且红色矩形的下边比蓝色矩形的上边更靠下
        and a_bottom > b_top
        -- 并且红色矩形的上边比蓝色矩形的下边更靠上，那么……
        and a_top < b_bottom then
                -- 它们发生了碰撞！
                return true
        else
                -- 只要上述条件有任意一个不成立，就返回 false
                return false
        end
end
```

注意 if 条件本身就是一个布尔值。`checkCollision` 会在条件为 `true` 时返回 `true`，反之亦然。因此我们可以把 `checkCollision` 简化成下面的形式：

```lua
function checkCollision(a, b)
        -- 在局部变量中，常见的写法是使用下划线而非驼峰命名
        local a_left = a.x
        local a_right = a.x + a.width
        local a_top = a.y
        local a_bottom = a.y + a.height

        local b_left = b.x
        local b_right = b.x + b.width
        local b_top = b.y
        local b_bottom = b.y + b.height

        -- 直接返回这个布尔表达式，而无需 if 语句
        return  a_right > b_left
                and a_left < b_right
                and a_bottom > b_top
                and a_top < b_bottom
end
```

好了，函数写完了。现在来试一下吧！我们根据是否发生碰撞决定绘制填充矩形还是线框矩形。

```lua
function love.draw()
        -- 创建一个名为 mode 的局部变量
        local mode
        if checkCollision(r1, r2) then
                -- 如果发生碰撞，就填充绘制矩形
                mode = "fill"
        else
                -- 否则绘制线框
                mode = "line"
        end

        -- 将该变量作为第一个参数传入
    love.graphics.rectangle(mode, r1.x, r1.y, r1.width, r1.height)
    love.graphics.rectangle(mode, r2.x, r2.y, r2.width, r2.height)
end
```

成功了！现在你已经知道如何检测两个矩形之间的碰撞了。

___

## 总结

两个矩形之间的碰撞可以通过四个条件来判断。

设 A 和 B 为两个矩形：

A 的右边在 B 的左边右侧。

A 的左边在 B 的右边左侧。

A 的下边在 B 的上边下方。

A 的上边在 B 的下边上方。
