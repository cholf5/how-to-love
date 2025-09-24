# 第 14 章 - 游戏：射击敌人

让我们把目前学到的所有内容用在一个简单的游戏上。你可以尽情阅读关于编程和做游戏的资料，但真正想学会，就必须亲自动手。

游戏本质上就是一堆需要解决的问题。当你让经验丰富的程序员去做《PONG》时，他不会去搜索“如何制作 PONG”。他们会把 PONG 拆成几个独立的问题，并且知道怎么逐一解决。本章就是教你如何把一个游戏拆分成多个任务。

我们要制作的游戏很简单：一名敌人会在墙壁之间弹来弹去，而我们要射中它。每次命中后敌人都会变快。只要打空一次，游戏就会结束，你得重新开始。

![](/images/book/14/demo.gif)

这个游戏会用到几张图片。你可以用自己的素材，但我会使用这三张：

![](/images/book/14/panda.png)
![](/images/book/14/snake.png)
![](/images/book/14/bullet.png)

这些图片来自 [Kenney](http://kenney.nl/assets)，他制作了很多免费素材供大家在游戏中使用。去看看他吧！

我们从 3 个主要的回调函数开始，并加载 *classic*，这就是我们用来模拟类的库。

```lua
function love.load()
    Object = require "classic"
end

function love.update(dt)
end

function love.draw()
end
```

我们从玩家开始。新建一个名为 `player.lua` 的文件。

我们可以为所有对象做一个基类，但因为这只是一个简单的小项目，就先不这么做。不过我鼓励你在章节结束后自行添加一个基类来改进代码。

___

## 任务：创建一个可以移动的玩家

创建一个 Player 类：

```lua
--! file: player.lua
Player = Object:extend()

function Player:new()

end
```

我准备把熊猫的图片给玩家使用。

```lua
function Player:new()
    self.image = love.graphics.newImage("panda.png")
end


function Player:draw()
    love.graphics.draw(self.image)
end
```

接下来让我们通过方向键控制玩家移动。

```lua
function Player:new()
    self.image = love.graphics.newImage("panda.png")
    self.x = 300
    self.y = 20
    self.speed = 500
    self.width = self.image:getWidth()
end

function Player:update(dt)
    if love.keyboard.isDown("left") then
        self.x = self.x - self.speed * dt
    elseif love.keyboard.isDown("right") then
        self.x = self.x + self.speed * dt
    end
end

function Player:draw()
    love.graphics.draw(self.image, self.x, self.y)
end
```

现在我们应该能移动玩家了。回到 `main.lua` 并加载玩家。

```lua
--! file: main.lua
function love.load()
    Object = require "classic"
    require "player"

    player = Player()
end

function love.update(dt)
    player:update(dt)
end

function love.draw()
    player:draw()
end
```

如你所见，我们能移动玩家。但玩家依然可以移动到窗口外。我们用 if 语句来修复它。

```lua
--! file: player.lua

function Player:update(dt)
    if love.keyboard.isDown("left") then
        self.x = self.x - self.speed * dt
    elseif love.keyboard.isDown("right") then
        self.x = self.x + self.speed * dt
    end

    --Get the width of the window
    local window_width = love.graphics.getWidth()

    --If the x is too far too the left then..
    if self.x < 0 then
        --Set x to 0
        self.x = 0

    --Else, if the x is too far to the right then..
    elseif self.x > window_width then
        --Set the x to the window's width.
        self.x = window_width
    end
end
```

糟糕，玩家还是能向右移得太远。我们在检测是否撞到右墙时，需要把宽度也考虑进去。

```lua
--If the left side is too far too the left then..
if self.x < 0 then
    --Set x to 0
    self.x = 0

--Else, if the right side is too far to the right then..
elseif self.x + self.width > window_width then
    --Set the right side to the window's width.
    self.x = window_width - self.width
end
```

现在修好了，玩家再也出不了窗口。

___

## 任务：创建一个会移动的敌人

现在来制作 Enemy 类。新建一个名为 `enemy.lua` 的文件，输入下面的代码：

```lua
--! file: enemy.lua
Enemy = Object:extend()

function Enemy:new()


end
```

我要把蛇的图片交给敌人，并让它自己移动起来。

```lua
function Enemy:new()
    self.image = love.graphics.newImage("snake.png")
    self.x = 325
    self.y = 450
    self.speed = 100
end

function Enemy:update(dt)
    self.x = self.x + self.speed * dt
end

function Enemy:draw()
    love.graphics.draw(self.image, self.x, self.y)
end
```

我们需要让敌人在墙壁上反弹，但先把它加载进来。

```lua
--! file: main.lua
function love.load()
    Object = require "classic"
    require "player"
    require "enemy"

    player = Player()
    enemy = Enemy()
end

function love.update(dt)
    player:update(dt)
    enemy:update(dt)
end

function love.draw()
    player:draw()
    enemy:draw()
end
```

现在可以看到敌人在移动，也会穿出窗口。就像处理玩家那样，确保它留在窗口内。

```lua
function Enemy:new()
    self.image = love.graphics.newImage("snake.png")
    self.x = 325
    self.y = 450
    self.speed = 100
    self.width = self.image:getWidth()
    self.height = self.image:getHeight()
end

function Enemy:update(dt)
    self.x = self.x + self.speed * dt

    local window_width = love.graphics.getWidth()

    if self.x < 0 then
        self.x = 0
    elseif self.x + self.width > window_width then
        self.x = window_width - self.width
    end
end
```

敌人会在墙边停下来，但我们想让它弹回去。该怎么做？当它撞到右墙时，接下来呢？它应该朝另一个方向移动。如何让它反向移动？我们只要改变 `speed` 的值即可。那这个值应该变成多少？不能再是 100，而应该是 -100。

那么我们是不是该写 `self.speed = -100` 呢？不行。因为我们说过敌人被击中时会加速，如果这么写，敌人一弹回就会把速度重置。所以我们应该把 `speed` 的值取反。`speed` 会变成 `-speed`。换句话说，如果速度增加到了 120，那它就会变成 -120。

如果撞到左墙呢？那时速度是个负数，我们应该把它变成正数。怎么做？[负负得正](https://www.khanacademy.org/math/algebra-basics/basic-alg-foundations/alg-basics-negative-numbers/v/why-a-negative-times-a-negative-is-a-positive)。所以如果我们让当时为负数的 `speed` 等于 `-speed`，它就会变回正数。

```lua
function Enemy:update(dt)
    self.x = self.x + self.speed * dt

    local window_width = love.graphics.getWidth()

    if self.x < 0 then
        self.x = 0
        self.speed = -self.speed
    elseif self.x + self.width > window_width then
        self.x = window_width - self.width
        self.speed = -self.speed
    end
end
```

好了，我们已经有了玩家和一个会移动的敌人，接下来就剩下子弹了。

___

## 任务：能够发射子弹

新建一个名为 `bullet.lua` 的文件，并写入以下代码：

```lua
--! file: bullet.lua

Bullet = Object:extend()

function Bullet:new()
    self.image = love.graphics.newImage("bullet.png")
end

function Bullet:draw()
    love.graphics.draw(self.image)
end
```

子弹应该沿着竖直方向移动，而不是水平。

```lua
--We pass the x and y of the player.
function Bullet:new(x, y)
    self.image = love.graphics.newImage("bullet.png")
    self.x = x
    self.y = y
    self.speed = 700
    --We'll need these for collision checking
    self.width = self.image:getWidth()
    self.height = self.image:getHeight()
end

function Bullet:update(dt)
    self.y = self.y + self.speed * dt
end

function Bullet:draw()
    love.graphics.draw(self.image, self.x, self.y)
end
```

现在我们得发射子弹。在 main.lua 里加载该文件并创建一个表。

```lua
--! file: main.lua
function love.load()
    Object = require "classic"
    require "player"
    require "enemy"
    require "bullet"

    player = Player()
    enemy = Enemy()
    listOfBullets = {}
end
```

接着给 Player 一个在按下空格时生成子弹的函数。

```lua
--! file: player.lua
function Player:keyPressed(key)
    --If the spacebar is pressed
    if key == "space" then
        --Put a new instance of Bullet inside listOfBullets.
        table.insert(listOfBullets, Bullet(self.x, self.y))
    end
end
```

我们需要在 `love.keypressed` 回调里调用这个函数。

```lua
--! file: main.lua
function love.keypressed(key)
    player:keyPressed(key)
end
```

接下来遍历表，更新/绘制所有子弹。

```
function love.load()
    Object = require "classic"
    require "player"
    require "enemy"
    require "bullet"

    player = Player()
    enemy = Enemy()
    listOfBullets = {}
end

function love.update(dt)
    player:update(dt)
    enemy:update(dt)

    for i,v in ipairs(listOfBullets) do
        v:update(dt)
    end
end

function love.draw()
    player:draw()
    enemy:draw()

    for i,v in ipairs(listOfBullets) do
        v:draw()
    end
end
```

太棒了，玩家现在能够发射子弹了。

___

## 任务：让子弹影响敌人的速度

现在我们需要让子弹能够击中蛇。给 Bullet 增加一个碰撞检测函数。

```lua
--! file: bullet.lua
function Bullet:checkCollision(obj)

end
```

你还记得怎么做吗？还记得要满足碰撞成立的四个条件吗？

这次不要返回 true 或 false，而是要增加敌人的速度。我们给子弹添加一个属性 `dead`，稍后会用它把子弹从列表中移除。

```lua
function Bullet:checkCollision(obj)
    local self_left = self.x
    local self_right = self.x + self.width
    local self_top = self.y
    local self_bottom = self.y + self.height

    local obj_left = obj.x
    local obj_right = obj.x + obj.width
    local obj_top = obj.y
    local obj_bottom = obj.y + obj.height

    if  self_right > obj_left
    and self_left < obj_right
    and self_bottom > obj_top
    and self_top < obj_bottom then
    self.dead = true

    --Increase enemy speed
    obj.speed = obj.speed + 50
    end
end
```

现在我们要在 main.lua 中调用 checkCollision。

```lua
function love.update(dt)
    player:update(dt)
    enemy:update(dt)

    for i,v in ipairs(listOfBullets) do
        v:update(dt)

        --Each bullets checks if there is collision with the enemy
        v:checkCollision(enemy)
    end
end
```

接着我们需要销毁已经死亡的子弹。

```lua
function love.update(dt)
    player:update(dt)
    enemy:update(dt)

    for i,v in ipairs(listOfBullets) do
        v:update(dt)
        v:checkCollision(enemy)

        --If the bullet has the property dead and it's true then..
        if v.dead then
            --Remove it from the list
            table.remove(listOfBullets, i)
        end
    end
end
```

最后一件事是当子弹没有打中敌人而飞出屏幕时，要重启游戏。我们得检查子弹是否离开屏幕。

```lua
--! file: bullet.lua
function Bullet:update(dt)
    self.y = self.y + self.speed * dt

    --If the bullet is out of the screen
    if self.y > love.graphics.getHeight() then
        --Restart the game
        love.load()
    end
end
```

测试一下吧。你可能会注意到，当敌人正向左移动时被击中，它反而会减速。这是因为那时敌人的速度是负数，所以增加数值反而会减慢它。为了解决这个问题，我们需要检测敌人的速度是否为负。

```lua
function Bullet:checkCollision(obj)
    local self_left = self.x
    local self_right = self.x + self.width
    local self_top = self.y
    local self_bottom = self.y + self.height

    local obj_left = obj.x
    local obj_right = obj.x + obj.width
    local obj_top = obj.y
    local obj_bottom = obj.y + obj.height

    if  self_right > obj_left
    and self_left < obj_right
    and self_bottom > obj_top
    and self_top < obj_bottom then
    self.dead = true

    --Increase enemy speed
    if obj.speed > 0 then
        obj.speed = obj.speed + 50
        else
        obj.speed = obj.speed - 50
        end
    end
end
```

这样游戏就完成了。真的结束了吗？你可以试着给游戏添加更多功能，或者干脆做一个全新的游戏。不管做什么，只要能持续学习、持续做游戏就好！

___

## 总结
游戏本质上就是一系列需要解决的问题。
