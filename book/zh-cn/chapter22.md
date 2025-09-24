# 第 22 章 - 摄像机与画布
___
*我们会沿用上一章的代码*
___

## 摄像机

当关卡非常大、不能完全塞进屏幕时，就需要一个“摄像机”来跟着玩家移动。我们来给上一章写的游戏加上摄像机：玩家在场景里收集金币。

摄像机的作用是什么？本质上，它会在绘制时对所有内容做同样的位移，让玩家始终位于屏幕中央。要怎么实现呢？一种做法是准备一个 `camera_offset` 之类的变量，然后绘制任何东西时都把它减掉。

```lua
love.graphics.circle("line", player.x - camera.offset.x, player.y - camera.offset.y, player.size)
```

可是在大型项目里要画的东西非常多，这样做工作量太大。更简单的办法是使用 `love.graphics.translate()`。这个函数属于*坐标系（Coordinate System）*的一部分。就像我们能平移、旋转、缩放一张图片一样，也能平移、旋转、缩放绘制的目标表面，而这个目标表面就叫做*画布*（稍后会详细介绍）。

默认情况下，你在位置 (x=0, y=0) 绘制内容，它会出现在屏幕左上角。如果调用 `love.graphics.translate(400, 200)`，我们就把画布整体移动了。此时再在 (0,0) 位置绘制，结果会显示在屏幕上的 (400,200)。如果调用 `love.graphics.scale(2)`，则之后绘制的所有内容都会被放大。多尝试一下这些函数，你会更容易理解它们在做什么。

接下来用 `love.graphics.translate(x, y)` 来构建摄像机。关键是如何移动屏幕，才能让玩家出现在中央。先把玩家移到屏幕左上角：做法是把玩家位置取负值，当作新的 (0,0)。

在默认情况下，左上角就是 (0,0)，玩家会按自己的坐标 (100, 50) 被绘制出来。如果我们调用 `love.graphics.translate(-100, -50)`，就会把玩家搬到左上角。但我们想让它位于中央，所以再加上屏幕宽高的一半（假设是 400 和 300）。

*下面这张图演示了整个过程。首先用 `love.graphics.translate(-player.x, -player.y)` 把玩家移到左上角。接着用 `love.graphics.translate(-player.x + 400, -player.y + 300)` 把玩家移到屏幕中央。*

![](/images/book/22/camera_center.gif)

```lua
--code
function love.draw()
        love.graphics.translate(-player.x + 400, -player.y + 300)
        love.graphics.circle("line", player.x, player.y, player.size)
        love.graphics.draw(player.image, player.x, player.y,
                0, 1, 1, player.image:getWidth()/2, player.image:getHeight()/2)
        for i,v in ipairs(coins) do
                love.graphics.circle("line", v.x, v.y, v.size)
                love.graphics.draw(v.image, v.x, v.y,
                        0, 1, 1, v.image:getWidth()/2, v.image:getHeight()/2)
        end
end
```

![](/images/book/22/camera_center_moving.gif)

成功了！接下来我们想统计收集了多少金币。分数属于 HUD（抬头显示），也就是总是显示在屏幕上的内容，不受游戏场景的摄像机影响。先把分数变量加上：

```lua
-- In love.load()
score = 0
```
```lua
for i=#coins,1,-1 do
        if checkCollision(player, coins[i]) then
                table.remove(coins, i)
                player.size = player.size + 1
                score = score + 1
        end
end
```

```lua
function love.draw()
        love.graphics.translate(-player.x + 400, -player.y + 300)
        love.graphics.circle("line", player.x, player.y, player.size)
        love.graphics.draw(player.image, player.x, player.y,
                0, 1, 1, player.image:getWidth()/2, player.image:getHeight()/2)
        for i,v in ipairs(coins) do
                love.graphics.circle("line", v.x, v.y, v.size)
                love.graphics.draw(v.image, v.x, v.y,
                        0, 1, 1, v.image:getWidth()/2, v.image:getHeight()/2)
        end
        love.graphics.print(score, 10, 10)
end
```

运行一下游戏，现在屏幕上能看到一个数字。但如何让分数的位置不受摄像机影响呢？一种办法是把坐标系平移回初始状态：

```lua
function love.draw()
        love.graphics.translate(-player.x + 400, -player.y + 300)
        love.graphics.circle("line", player.x, player.y, player.size)
        love.graphics.draw(player.image, player.x, player.y,
                0, 1, 1, player.image:getWidth()/2, player.image:getHeight()/2)
        for i,v in ipairs(coins) do
                love.graphics.circle("line", v.x, v.y, v.size)
                love.graphics.draw(v.image, v.x, v.y,
                        0, 1, 1, v.image:getWidth()/2, v.image:getHeight()/2)
        end
        love.graphics.translate(player.x - 400, player.y - 300)
        love.graphics.print(score, 10, 10)
end
```

我们还可以使用 `love.graphics.origin()`。它会重置所有坐标变换，对已经绘制的内容不会产生影响。

```lua
function love.draw()
        love.graphics.translate(-player.x + 400, -player.y + 300)
        love.graphics.circle("line", player.x, player.y, player.size)
        love.graphics.draw(player.image, player.x, player.y,
                0, 1, 1, player.image:getWidth()/2, player.image:getHeight()/2)
        for i,v in ipairs(coins) do
                love.graphics.circle("line", v.x, v.y, v.size)
                love.graphics.draw(v.image, v.x, v.y,
                        0, 1, 1, v.image:getWidth()/2, v.image:getHeight()/2)
        end
        love.graphics.origin()
        love.graphics.print(score, 10, 10)
end
```

不过有时候这并不是最佳做法。比如我们想让游戏整体保持放大，始终调用 `love.graphics.scale(2)`，而又不希望它被重置。此时可以使用 `love.graphics.push()` 和 `love.graphics.pop()`。`love.graphics.push()` 会把当前的坐标变换保存到一个*栈*里；`love.graphics.pop()` 则会取出栈顶保存的状态并恢复。用它们就能正确地绘制分数。

```lua
--- code
function love.draw()
        love.graphics.push() -- 复制当前状态并压入栈中。
                love.graphics.translate(-player.x + 400, -player.y + 300)
                love.graphics.circle("line", player.x, player.y, player.size)
                love.graphics.draw(player.image, player.x, player.y,
                        0, 1, 1, player.image:getWidth()/2, player.image:getHeight()/2)
                for i,v in ipairs(coins) do
                        love.graphics.circle("line", v.x, v.y, v.size)
                        love.graphics.draw(v.image, v.x, v.y,
                                0, 1, 1, v.image:getWidth()/2, v.image:getHeight()/2)
                end
        love.graphics.pop() -- 弹出栈顶状态并恢复。
        love.graphics.print(score, 10, 10)
end
```

太好了，我们已经有了一个摄像机，并且能把分数叠加在摄像机之上。接下来让画面摇起来。

___

## 屏幕震动

我们来给游戏加个屏幕震动效果。首先需要一个计时器表示震动持续的时间，并在 `update` 中让它递减。

```lua
-- In love.load()
shakeDuration = 0
```

```lua
-- In love.update(dt)
if shakeDuration > 0 then
        shakeDuration = shakeDuration - dt
end
```

然后在计时器大于 0 时，让画面在一个小范围内随机平移。

```lua
function love.draw()
        love.graphics.push() -- 复制当前状态并压入栈。
                love.graphics.translate(-player.x + 400, -player.y + 300)

                if shakeDuration > 0 then
                        -- 在 -5 到 5 之间随机平移。
                        -- 第二次 translate 会基于前一次的结果进行，不会清除之前的位移。
                        love.graphics.translate(love.math.random(-5,5), love.math.random(-5,5))
                end

                love.graphics.circle("line", player.x, player.y, player.size)
                love.graphics.draw(player.image, player.x, player.y,
                        0, 1, 1, player.image:getWidth()/2, player.image:getHeight()/2)
                for i,v in ipairs(coins) do
                        love.graphics.circle("line", v.x, v.y, v.size)
                        love.graphics.draw(v.image, v.x, v.y,
                                0, 1, 1, v.image:getWidth()/2, v.image:getHeight()/2)
                end
        love.graphics.pop() -- 弹出状态并恢复。
        love.graphics.print(score, 10, 10)
end
```

最后，每次捡到金币时把计时器设成一个固定值，比如 0.3 秒。

```
for i=#coins,1,-1 do
        if checkCollision(player, coins[i]) then
                table.remove(coins, i)
                player.size = player.size + 1
                score = score + 1
                shakeDuration = 0.3
        end
end
```

![](/images/book/22/shake.gif)

试试看。也许你会觉得屏幕震动得太快；即使你觉得合适，也可能在别人的电脑上过快。因此我们还是要使用 delta time。可以再添加一个计时器来解决，同时需要一个对象来保存平移的偏移量。

```lua
-- In love.load()
shakeDuration = 0
shakeWait = 0
shakeOffset = {x = 0, y = 0}
```

```lua
-- In love.update(dt)
if shakeDuration > 0 then
        shakeDuration = shakeDuration - dt
        if shakeWait > 0 then
                shakeWait = shakeWait - dt
        else
                shakeOffset.x = love.math.random(-5,5)
                shakeOffset.y = love.math.random(-5,5)
                shakeWait = 0.05
        end
end
```

```lua
function love.draw()
        love.graphics.push()
                love.graphics.translate(-player.x + 400, -player.y + 300)
                if shakeDuration > 0 then
                        love.graphics.translate(shakeOffset.x, shakeOffset.y)
                end
                love.graphics.circle("line", player.x, player.y, player.size)
                love.graphics.draw(player.image, player.x, player.y,
                        0, 1, 1, player.image:getWidth()/2, player.image:getHeight()/2)
                for i,v in ipairs(coins) do
                        love.graphics.circle("line", v.x, v.y, v.size)
                        love.graphics.draw(v.image, v.x, v.y,
                                0, 1, 1, v.image:getWidth()/2, v.image:getHeight()/2)
                end
        love.graphics.pop()
        love.graphics.print(score, 10, 10)
end
```

现在震动速度就稳定了。

接着我们把游戏做成多人游戏，加入分屏效果怎么样？

___

## 画布
每次你用 love.graphics 绘制内容时，实际上都是画到一块*画布*上。画布本身是一个对象，我们还可以创建自己的画布。这在做多人分屏时非常有用：可以为每名玩家各自绘制到一块独立的画布上，然后再把这些画布绘制回主画布。因为画布本身也是一种 [Drawable](https://love2d.org/wiki/Drawable)，也就是所有能被 `love.graphics.draw()` 绘制的对象的父类。

Canvas 的超类型按层级顺序是：

* Texture（纹理）
* Drawable（可绘制对象）
* Object（对象）

[Texture](http://love2d.org/wiki/Texture) 是 Drawable 的子类型。Image 和 Canvas 都是 Texture 的子类型，因此都可以配合 Quad 来绘制。
所有 LÖVE 对象的类型最终都是 [Object](http://love2d.org/wiki/Object)。不要和我们在代码里使用的 `Object` 类混淆，它们并没有任何关系，只是名字一样而已。

可以用 [`love.graphics.newCanvas`](http://love2d.org/wiki/love.graphics.newCanvas) 来创建画布。

让我们用画布在游戏里实现分屏。首先加上另一个使用 WASD 操作的玩家，并移除屏幕震动以及存档/读档系统。

```lua
function love.load()
        player1 = {
                x = 100,
                y = 100,
                size = 25,
                image = love.graphics.newImage("face.png")
        }

        player2 = {
                x = 300,
                y = 100,
                size = 25,
                image = love.graphics.newImage("face.png")
        }

        coins = {}

        for i=1,25 do
                table.insert(coins,
                        {
                                x = math.random(50, 650),
                                y = math.random(50, 450),
                                size = 10,
                                image = love.graphics.newImage("dollar.png")
                        }
                )
        end

        score1 = 0
        score2 = 0
end

function love.update(dt)
        if love.keyboard.isDown("left") then
                player1.x = player1.x - 200 * dt
        elseif love.keyboard.isDown("right") then
                player1.x = player1.x + 200 * dt
        end

        if love.keyboard.isDown("up") then
                player1.y = player1.y - 200 * dt
        elseif love.keyboard.isDown("down") then
                player1.y = player1.y + 200 * dt
        end

        if love.keyboard.isDown("a") then
                player2.x = player2.x - 200 * dt
        elseif love.keyboard.isDown("d") then
                player2.x = player2.x + 200 * dt
        end

        if love.keyboard.isDown("w") then
                player2.y = player2.y - 200 * dt
        elseif love.keyboard.isDown("s") then
                player2.y = player2.y + 200 * dt
        end

        for i=#coins,1,-1 do
                if checkCollision(player1, coins[i]) then
                        table.remove(coins, i)
                        player1.size = player1.size + 1
                        score1 = score1 + 1
                elseif checkCollision(player2, coins[i]) then
                        table.remove(coins, i)
                        player2.size = player2.size + 1
                        score2 = score2 + 1
                end
        end
end

function love.draw()
        love.graphics.push()
                love.graphics.translate(-player1.x + 400, -player1.y + 300)

                love.graphics.circle("line", player1.x, player1.y, player1.size)
                love.graphics.draw(player1.image, player1.x, player1.y,
                        0, 1, 1, player1.image:getWidth()/2, player1.image:getHeight()/2)

                love.graphics.circle("line", player2.x, player2.y, player2.size)
                love.graphics.draw(player2.image, player2.x, player2.y,
                        0, 1, 1, player2.image:getWidth()/2, player2.image:getHeight()/2)

                for i,v in ipairs(coins) do
                        love.graphics.circle("line", v.x, v.y, v.size)
                        love.graphics.draw(v.image, v.x, v.y,
                                0, 1, 1, v.image:getWidth()/2, v.image:getHeight()/2)
                end
        love.graphics.pop()
        love.graphics.print("Player 1 - " .. score1, 10, 10)
        love.graphics.print("Player 2 - " .. score2, 10, 30)
end

function checkCollision(p1, p2)
        -- 用一行算出距离。
        -- 计算 x、y 坐标的差，再平方、求和，最后取平方根。
        local distance = math.sqrt((p1.x - p2.x)^2 + (p1.y - p2.y)^2)
        -- 返回距离是否小于半径之和。
        return distance < p1.size + p2.size
end
```

接着需要一块画布来绘制场景。我们要把画布绘制在屏幕的左右两侧，所以画布尺寸设为 400x600。

```lua
-- In love.load()
screenCanvas = love.graphics.newCanvas(400, 600)
```

下一步是把游戏绘制到这块画布上。`love.graphics.setCanvas()` 可以指定接下来要绘制到哪块画布上；如果不传参数则会恢复成默认画布。

```lua
function love.draw()
        love.graphics.setCanvas(screenCanvas)
        love.graphics.push()
                love.graphics.translate(-player1.x + 400, -player1.y + 300)

                love.graphics.circle("line", player1.x, player1.y, player1.size)
                love.graphics.draw(player1.image, player1.x, player1.y,
                        0, 1, 1, player1.image:getWidth()/2, player1.image:getHeight()/2)

                love.graphics.circle("line", player2.x, player2.y, player2.size)
                love.graphics.draw(player2.image, player2.x, player2.y,
                        0, 1, 1, player2.image:getWidth()/2, player2.image:getHeight()/2)

                for i,v in ipairs(coins) do
                        love.graphics.circle("line", v.x, v.y, v.size)
                        love.graphics.draw(v.image, v.x, v.y,
                                0, 1, 1, v.image:getWidth()/2, v.image:getHeight()/2)
                end
        love.graphics.pop()
        love.graphics.setCanvas()

        love.graphics.print("Player 1 - " .. score1, 10, 10)
        love.graphics.print("Player 2 - " .. score2, 10, 30)
end
```

此时如果运行游戏，会发现屏幕是空的。因为我们确实把游戏画到了新画布上，但还没把这块画布绘制回默认画布。就像之前说的，Canvas 是 Drawable，而 Drawable 都可以用 `love.graphics.draw` 绘制。

```lua
function love.draw()
        love.graphics.setCanvas(screenCanvas)
        love.graphics.push()
                love.graphics.translate(-player1.x + 400, -player1.y + 300)

                love.graphics.circle("line", player1.x, player1.y, player1.size)
                love.graphics.draw(player1.image, player1.x, player1.y,
                        0, 1, 1, player1.image:getWidth()/2, player1.image:getHeight()/2)

                love.graphics.circle("line", player2.x, player2.y, player2.size)
                love.graphics.draw(player2.image, player2.x, player2.y,
                        0, 1, 1, player2.image:getWidth()/2, player2.image:getHeight()/2)

                for i,v in ipairs(coins) do
                        love.graphics.circle("line", v.x, v.y, v.size)
                        love.graphics.draw(v.image, v.x, v.y,
                                0, 1, 1, v.image:getWidth()/2, v.image:getHeight()/2)
                end
        love.graphics.pop()
        love.graphics.setCanvas()

        -- 绘制画布
        love.graphics.draw(screenCanvas)

        love.graphics.print("Player 1 - " .. score1, 10, 10)
        love.graphics.print("Player 2 - " .. score2, 10, 30)
end
```

现在应该能看到游戏画面了，但移动时会发现角色身后留下一条拖影。这是因为我们没有清空画布，导致之前绘制的内容一直保留。默认画布会自动清空，而自定义画布需要我们手动调用 `love.graphics.clear()`。应该在绘制游戏前调用它。另外，由于我们只使用屏幕的一半，摄像机的中心也要调整：此时屏幕宽度的一半是 200 而不是 400。

既然我们要绘制两次游戏画面，不妨把绘制逻辑封装成一个函数。

```lua
function love.draw()
        love.graphics.setCanvas(screenCanvas)
                love.graphics.clear()
                drawGame()
        love.graphics.setCanvas()
        love.graphics.draw(screenCanvas)

        love.graphics.setCanvas(screenCanvas)
                love.graphics.clear()
                drawGame()
        love.graphics.setCanvas()
        love.graphics.draw(screenCanvas, 400)

        -- 加一条线把两块屏幕分隔开
        love.graphics.line(400, 0, 400, 600)

        love.graphics.print("Player 1 - " .. score1, 10, 10)
        love.graphics.print("Player 2 - " .. score2, 10, 30)
end

function drawGame()
        love.graphics.push()
                love.graphics.translate(-player1.x + 200, -player1.y + 300)

                love.graphics.circle("line", player1.x, player1.y, player1.size)
                love.graphics.draw(player1.image, player1.x, player1.y,
                        0, 1, 1, player1.image:getWidth()/2, player1.image:getHeight()/2)

                love.graphics.circle("line", player2.x, player2.y, player2.size)
                love.graphics.draw(player2.image, player2.x, player2.y,
                        0, 1, 1, player2.image:getWidth()/2, player2.image:getHeight()/2)

                for i,v in ipairs(coins) do
                        love.graphics.circle("line", v.x, v.y, v.size)
                        love.graphics.draw(v.image, v.x, v.y,
                                0, 1, 1, v.image:getWidth()/2, v.image:getHeight()/2)
                end
        love.graphics.pop()
end
```

现在我们有了分屏。不过左右两侧都仍然聚焦在玩家 1 身上。我们需要让第二次绘制时摄像机聚焦玩家 2。可以为 `drawGame` 添加一个 `focus` 参数，让摄像机对准传入的对象（这里就是玩家）。

```lua
function love.draw()
        love.graphics.setCanvas(screenCanvas)
                love.graphics.clear()
                drawGame(player1)
        love.graphics.setCanvas()
        love.graphics.draw(screenCanvas)

        love.graphics.setCanvas(screenCanvas)
                love.graphics.clear()
                drawGame(player2)
        love.graphics.setCanvas()
        love.graphics.draw(screenCanvas, 400)

        love.graphics.line(400, 0, 400, 600)

        love.graphics.print("Player 1 - " .. score1, 10, 10)
        love.graphics.print("Player 2 - " .. score2, 10, 30)
end

function drawGame(focus)
        love.graphics.push()
                love.graphics.translate(-focus.x + 200, -focus.y + 300)

                love.graphics.circle("line", player1.x, player1.y, player1.size)
                love.graphics.draw(player1.image, player1.x, player1.y,
                        0, 1, 1, player1.image:getWidth()/2, player1.image:getHeight()/2)

                love.graphics.circle("line", player2.x, player2.y, player2.size)
                love.graphics.draw(player2.image, player2.x, player2.y,
                        0, 1, 1, player2.image:getWidth()/2, player2.image:getHeight()/2)

                for i,v in ipairs(coins) do
                        love.graphics.circle("line", v.x, v.y, v.size)
                        love.graphics.draw(v.image, v.x, v.y,
                                0, 1, 1, v.image:getWidth()/2, v.image:getHeight()/2)
                end
        love.graphics.pop()
end
```

![](/images/book/22/splitscreen.gif)

___

## 库

我们实现的摄像机还比较基础。其实还能加很多功能，比如缩放、边界限制等等。我推荐你看看这些提供高级摄像机功能的库：

* [Gamera](https://github.com/kikito/gamera)
* [Stalker-X](https://github.com/adnzzzzZ/STALKER-X)

___

## 总结

借助坐标系，我们可以改变屏幕上内容的绘制方式。`love.graphics.translate(x, y)` 能帮我们创建摄像机。所有绘制的内容都会落在*画布*上，我们可以自己创建画布，而且画布和图片一样都属于 LÖVE 的 *Texture* 类型，因此可以像绘制图像那样把画布绘制在屏幕上。利用画布，我们就能实现分屏等效果。
