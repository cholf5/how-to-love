# 第 24 章 - 平台游戏

*我们使用上一章的代码*
___

## 下落

既然我们已经能够解决碰撞，就可以制作一个平台游戏了——一种角色会往下坠、也能向上跳的游戏。首先让我们创建一张地图，供角色四处行走。我们可以把之前添加的那堵孤零零的墙移除。

```lua
function love.load()
    Object = require "classic"
    require "entity"
    require "player"
    require "wall"
    require "box"

    player = Player(100, 100)
    box = Box(400, 150)

    objects = {}
    table.insert(objects, player)
    table.insert(objects, box)

    map = {
        {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
        {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
        {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
        {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
        {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
        {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
        {1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1},
        {1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1},
        {1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1},
        {1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1},
        {1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1},
        {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1}
    }

    for i,v in ipairs(map) do
        for j,w in ipairs(v) do
            if w == 1 then
                table.insert(objects, Wall((j-1)*50, (i-1)*50))
            end
        end
    end
end
```

![](/images/book/24/map.png)

根据你电脑的性能不同，你可能会注意到游戏变得很慢。这是因为我们添加的所有墙体都会彼此检查碰撞。这非常低效，因为没有必要这么做。墙体从不会移动，因此它们之间绝不会互相重叠。我们应该为所有墙体创建一张独立的表。`objects` 表需要和自身以及 `walls` 表检查碰撞，但 `walls` 表没有必要和自身做碰撞检测。

```lua
function love.load()
    Object = require "classic"
    require "entity"
    require "player"
    require "wall"
    require "box"

    player = Player(100, 100)
    box = Box(400, 150)

    objects = {}
    table.insert(objects, player)
    table.insert(objects, box)

    -- 创建墙体表
    ---- 在此添加
    walls = {}
    -------------

    map = {
        {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
        {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
        {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
        {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
        {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
        {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
        {1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1},
        {1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1},
        {1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1},
        {1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1},
        {1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1},
        {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1}
    }

    for i,v in ipairs(map) do
        for j,w in ipairs(v) do
            if w == 1 then
                -- 把所有墙体添加到 walls 表中
                ---- 将此处改为
                table.insert(walls, Wall((j-1)*50, (i-1)*50))
                -------------
            end
        end
    end
end

function love.update(dt)
    for i,v in ipairs(objects) do
    v:update(dt)
    end

    -- 更新墙体
    ---- 在此添加
    for i,v in ipairs(walls) do
    v:update(dt)
    end
    -------------

    local loop = true
    local limit = 0

    while loop do
    loop = false

    limit = limit + 1
    if limit > 100 then
        break
    end

    for i=1,#objects-1 do
        for j=i+1,#objects do
        local collision = objects[i]:resolveCollision(objects[j])
        if collision then
            loop = true
        end
        end
    end

    -- 让每个对象都与每一堵墙检查碰撞
    ---- 在此添加
    for i,wall in ipairs(walls) do
        for j,object in ipairs(objects) do
            local collision = object:resolveCollision(wall)
            if collision then
                loop = true
            end
        end
    end
        -------------
    end
end

function love.draw()
    for i,v in ipairs(objects) do
    v:draw()
    end

    -- 绘制墙体
    ---- 在此添加
    for i,v in ipairs(walls) do
    v:draw()
    end
    -------------
end
```

好了，现在我们可以开始添加平台物理了。先从下落开始。在 `player.lua` 中，我们已经在按下下方向键时让玩家向下移动。把那个 if 语句移除后，玩家就会自动往下掉。

```lua
--! file: player.lua
function Player:update(dt)
    Player.super.update(self, dt)

    if love.keyboard.isDown("left") then
    self.x = self.x - 200 * dt
    elseif love.keyboard.isDown("right") then
    self.x = self.x + 200 * dt
    end

    if love.keyboard.isDown("up") then
    self.y = self.y - 200 * dt
    end

    -- 移除 if 语句
    self.y = self.y + 200 * dt
end
```

![](/images/book/24/falling.gif)

效果出来了，物体会往下掉，但这并不像真实的重力。物体应当缓慢下落，并且越落越快。我们可以在 `Entity` 类中创建更像真实重力的东西。我们需要 `gravity` 和 `weight` 属性。用 `gravity` 属性增加实体的 y 位置，用 `weight` 属性增加重力，从而提高下落速度。

```lua
--! file: entity.lua
function Entity:new(x, y, image_path)
    self.x = x
    self.y = y
    self.image = love.graphics.newImage(image_path)
    self.width = self.image:getWidth()
    self.height = self.image:getHeight()

    self.last = {}
    self.last.x = self.x
    self.last.y = self.y

    self.strength = 0
    self.tempStrength = 0

    -- 添加 gravity 与 weight 属性
    self.gravity = 0
    self.weight = 400
end

function Entity:update(dt)
    self.last.x = self.x
    self.last.y = self.y

    self.tempStrength = self.strength

    -- 使用 weight 逐步增加重力
    self.gravity = self.gravity + self.weight * dt

    -- 增加 y 位置
    self.y = self.y + self.gravity * dt
end
```

由于墙体不需要下落，我们可以给它一个 0 的 `weight`。

```lua
--! file: wall.lua
Wall = Entity:extend()

function Wall:new(x, y)
    Wall.super.new(self, x, y, "wall.png", 1)
    self.strength = 100
    self.weight = 0
end
```

然后我们可以移除玩家身上让其自动下落的部分，也不再允许通过按上方向键向上移动。

```lua
--! file: player.lua
function Player:update(dt)
    -- 在改变位置之前先执行这一行非常重要
    Player.super.update(self, dt)

    if love.keyboard.isDown("left") then
    self.x = self.x - 200 * dt
    elseif love.keyboard.isDown("right") then
    self.x = self.x + 200 * dt
    end

    -- 移除垂直方向的移动
end
```

现在玩家和箱子都会下落，而且下落速度会逐渐增加。

![](/images/book/24/gravity.gif)

但如果你让游戏运行得足够久，会发现玩家和箱子会直接穿过地板。这是因为即使它们站在地面上，重力仍然在持续增加。我们需要在它们站在地面上时重置重力，可以在 `Entity:resolveCollision(e)` 中做到这一点。

```lua
--! file: entity.lua
function Entity:resolveCollision(e)
    if self.tempStrength > e.tempStrength then
    return e:resolveCollision(self)
    end

    if self:checkCollision(e) then
    self.tempStrength = e.tempStrength
    if self:wasVerticallyAligned(e) then
        if self.x + self.width/2 < e.x + e.width/2 then
        local pushback = self.x + self.width - e.x
        self.x = self.x - pushback
        else
        local pushback = e.x + e.width - self.x
        self.x = self.x + pushback
        end
    elseif self:wasHorizontallyAligned(e) then
        if self.y + self.height/2 < e.y + e.height/2 then
        local pushback = self.y + self.height - e.y
        self.y = self.y - pushback
        -- 我们从下方碰到了墙
        -- 这意味着我们站在地面上
        -- 重置重力
                ---- 在此添加
        self.gravity = 0
                -------------
        else
        local pushback = e.y + e.height - self.y
        self.y = self.y + pushback
        end
    end
    return true
    end
    return false
end
```

现在它们就不会再穿过墙了。

___

## 跳跃

是时候让玩家能够跳跃了。我们希望在按下上方向键时让角色跳起来。首先在 `main.lua` 中添加 `love.keypressed(key)` 回调，并让它调用玩家的 `jump()` 函数，稍后我们就会编写这个函数。

```lua
--! file: main.lua
function love.keypressed(key)
    -- 当按下上方向键时让玩家跳跃
    if key == "up" then
        player:jump()
    end
end
```

那么要让玩家跳起来需要发生什么呢？其实非常简单，只要把重力设成一个负值即可。数值越低（换句话说越负），玩家跳得就越高。

```lua
--! file: player.lua
function Player:jump()
    self.gravity = -300
end
```

当玩家的重力发生变化时，它会跳到空中，随后随着重力不断增加慢慢落下。

![](/images/book/24/jumping.gif)

不过你会发现我们可以跳好几次。我们并不想这样。只有站在地面上的时候才能跳。我们可以给玩家添加一个 `canJump` 属性。当你落地时，它会变成 `true`；当你起跳（只有在 `canJump` 为 `true` 时才能起跳）后，它会变成 `false`。

```lua
function Player:new(x, y)
    Player.super.new(self, x, y, "player.png")
    self.strength = 10

    self.canJump = false
end

function Player:update(dt)
    Player.super.update(self, dt)

    if love.keyboard.isDown("left") then
    self.x = self.x - 200 * dt
    elseif love.keyboard.isDown("right") then
    self.x = self.x + 200 * dt
    end

    -- 移除该 if 语句
    -- self.y = self.y + 200 * dt
end


function Player:jump()
    if self.canJump then
    self.gravity = -300
    self.canJump = false
    end
end
```

但是现在如果我们想在落地时执行某些动作（在这里是把 `canJump` 设为 `true`），就不得不在 `Entity` 类里处理。我们当然可以这么做，但这个跳跃代码是玩家特有的。让我们添加一个在碰撞解决时会被调用的函数，这样我们就能在 `Player` 类中覆写这些函数。

```lua
--! file: entity.lua
function Entity:resolveCollision(e)
    if self.tempStrength > e.tempStrength then
    return e:resolveCollision(self)
    end

    if self:checkCollision(e) then
    self.tempStrength = e.tempStrength
    if self:wasVerticallyAligned(e) then
        if self.x + self.width/2 < e.x + e.width/2 then
        -- 用函数替换这些逻辑
        self:collide(e, "right")
        else
        self:collide(e, "left")
        end
    elseif self:wasHorizontallyAligned(e) then
        if self.y + self.height/2 < e.y + e.height/2 then
        self:collide(e, "bottom")
        else
        self:collide(e, "top")
        end
    end
    return true
    end
    return false
end

-- 当实体的某个方向与某物发生碰撞时
function Entity:collide(e, direction)
    if direction == "right" then
        local pushback = self.x + self.width - e.x
        self.x = self.x - pushback
    elseif direction == "left" then
        local pushback = e.x + e.width - self.x
        self.x = self.x + pushback
    elseif direction == "bottom" then
        local pushback = self.y + self.height - e.y
        self.y = self.y - pushback
        self.gravity = 0
    elseif direction == "top" then
        local pushback = e.y + e.height - self.y
        self.y = self.y + pushback
    end
end
```

现在我们就可以覆写 `collide(e)` 函数，在 `direction` 为 `"bottom"` 时把 `canJump` 设为 `true`。

```lua
--! file: player.lua
function Player:collide(e, direction)
    Player.super.collide(self, e, direction)
    if direction == "bottom" then
        self.canJump = true
    end
end
```

现在我们只能跳一次了。但当你从平台边缘走下去时仍然可以在半空中跳。

![](/images/book/24/midair.gif)

我们可以通过检查之前的 y 位置是否等于当前的 y 位置来解决这个问题。当你站在地面上时，你在垂直方向上不应该移动。如果你在移动，就意味着你没有站在地面上。

```lua
function Player:update(dt)
    Player.super.update(self, dt)

    if love.keyboard.isDown("left") then
    self.x = self.x - 200 * dt
    elseif love.keyboard.isDown("right") then
    self.x = self.x + 200 * dt
    end

    if self.last.y ~= self.y then
    self.canJump = false
    end
end
```

太棒了！在平台游戏中，常常需要从特定方向击中某个东西。比如马里奥，只有从下方撞击问号砖才会掉东西，只有跳到敌人头上才会把它消灭。更高级的例子是可穿透的平台：从下往上跳时可以穿过去，从上往下踩则会站在上面。

![](/images/book/24/platform.png)

让我们尝试创建这样的平台。

___

## 可穿透平台

我们打算用箱子来实现这个效果。我们希望玩家不要推开箱子，而是能直接穿过去；当他从上方跳到箱子上时，则能站在上面。为了实现这一点，我们还需要做一些修改。`collide(e, direction)` 函数负责在碰撞被解决后应该发生什么，但我们并不想解决这次碰撞，我们希望能够穿过箱子。

不如先检查碰撞双方是否都希望解决碰撞？我们创建一个叫作 `checkResolved` 的函数。如果 `self` 和 `e` 都返回 `true`，那我们就继续执行碰撞解决。

```lua
--! file: entity.lua
function Entity:resolveCollision(e)
    if self.tempStrength > e.tempStrength then
    return e:resolveCollision(self)
    end

    if self:checkCollision(e) then
    self.tempStrength = e.tempStrength
    if self:wasVerticallyAligned(e) then
        if self.x + self.width/2 < e.x + e.width/2 then
        -- 为双方调用 checkResolve
        local a = self:checkResolve(e, "right")
        local b = e:checkResolve(self, "left")
        -- 当 a 与 b 都为 true 时才解决碰撞
        if a and b then
            self:collide(e, "right")
        end
        else
        local a = self:checkResolve(e, "left")
        local b = e:checkResolve(self, "right")
        if a and b then
            self:collide(e, "left")
        end
        end
    elseif self:wasHorizontallyAligned(e) then
        if self.y + self.height/2 < e.y + e.height/2 then
        local a = self:checkResolve(e, "bottom")
        local b = e:checkResolve(self, "top")
        if a and b then
            self:collide(e, "bottom")
        end
        else
        local a = self:checkResolve(e, "top")
        local b = e:checkResolve(self, "bottom")
        if a and b then
            self:collide(e, "top")
        end
        end
    end
    return true
    end
    return false
end


function Entity:checkResolve(e, direction)
    return true
end
```

现在我们可以在 `player.lua` 中覆写 `checkResolve(e, direction)` 函数。我们使用的类库 classic 中的每个类都有 `is:(class)` 函数，可以用来判断某个实例是否属于某个类。因此我们可以用 `e:is(Box)` 检查 `e` 是否是 `Box` 类型。这同样适用于基类，所以如果 `e` 是一个箱子，那么 `e:is(Entity)` 也会返回 `true`，因为 `Box` 继承自基类 `Entity`。

我们先检查自己是否与 `Box` 碰撞；如果是，再检查 `direction` 是否为 `"bottom"`。若是，则返回 `true`（表示我们希望解决碰撞），否则返回 `false`。

```lua
--! file: player.lua
function Player:checkResolve(e, direction)
    if e:is(Box) then
    if direction == "bottom" then
        return true
    else
        return false
    end
    end
    return true
end
```

![](/images/book/24/through.gif)

___

## 总结

通过增加我们用来提升 y 位置的数值，就可以模拟重力。通过把重力设为负值，就可以让角色跳跃。通过添加函数并覆写它们，我们可以在碰撞发生时执行动作，或者阻止碰撞被解决。

___

## 结尾？

至此，我们来到了本章的结尾，也来到了本书（暂时）的终点！希望你喜欢这些章节，并且学到了很多。我仍然计划在未来撰写新的章节，但那是以后要做的事了。在此之前，祝你在成为更优秀的游戏程序员的道路上一帆风顺。如果你想继续学习，我推荐 [learn2love](https://rvagamejams.com/learn2love/)。它对我这里讲过的主题有更深入的讨论，还包括网络编程等章节。

记得多加练习。正如我在绪论里所说，你可以把绘画的知识读个遍，但想学会它就必须动手实践。编程也是如此。干杯！
