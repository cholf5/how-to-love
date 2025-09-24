# 第 23 章 - 解决碰撞

在第 13 章我们讨论过如何检测碰撞。本章我们再进一步。想象你在一个可以四处移动的游戏里，场景中有一些无法穿过的墙。要实现这一点，我们不仅要检测碰撞，还得让玩家在撞到墙之后停止移动，并且不会卡在墙里。我们需要把玩家“推”出来。

在开始之前我想先说明，解决碰撞是件非常困难的事，甚至连专业人士都会经常在这上面栽跟头。去看看速通视频就知道了，里面有很多能穿墙之类的漏洞。我们要做的碰撞解决方式已经相当可靠，但绝称不上完美。如果你觉得难以理解，也别气馁。

在本教程中我们需要两样东西：一个能向四个方向移动的玩家，以及一些墙。先为它们创建一个基类 —— `Entity`。

我们会用到这些文件：

* main.lua
* player.lua
* wall.lua
* entity.lua
* classic.lua

先从 `Entity` 类开始。它有 `x`、`y`、`width` 和 `height`。我们给墙和玩家都使用一张图片，并把这张图片的宽高作为实体的宽高。

```lua
--! file: entity.lua
Entity = Object:extend()

function Entity:new(x, y, image_path)
    self.x = x
    self.y = y
    self.image = love.graphics.newImage(image_path)
    self.width = self.image:getWidth()
    self.height = self.image:getHeight()
end

function Entity:update(dt)
    -- 目前先留空
end

function Entity:draw()
    love.graphics.draw(self.image, self.x, self.y)
end
```

接着加上碰撞检测。你还记得为什么这么写能检测矩形碰撞吗？如果忘了，不妨回去重读第 13 章。

```lua
function Entity:checkCollision(e)
    -- e 是要和自身检测碰撞的另一个实体
    -- 这是第 13 章的精简版本
    return self.x + self.width > e.x
    and self.x < e.x + e.width
    and self.y + self.height > e.y
    and self.y < e.y + e.height
end
```

现在我们可以基于这个基类创建玩家和墙。下面是将要用到的图片（彩色边框能帮助我们观察碰撞情况）：

![](/images/book/23/player.png) 和 ![](/images/book/23/wall.png)

```lua
--! file: player.lua
Player = Entity:extend()

function Player:new(x, y)
    Player.super.new(self, x, y, "player.png")
end
```

```lua
--! file: wall.lua
Wall = Entity:extend()

function Wall:new(x, y)
    Wall.super.new(self, x, y, "wall.png")
end
```

让玩家可以用方向键移动。

```lua
--! file: player.lua
Player = Entity:extend()

function Player:new(x, y)
    Player.super.new(self, x, y, "player.png")
end

function Player:update(dt)
    if love.keyboard.isDown("left") then
        self.x = self.x - 200 * dt
    elseif love.keyboard.isDown("right") then
        self.x = self.x + 200 * dt
    end

    if love.keyboard.isDown("up") then
        self.y = self.y - 200 * dt
    elseif love.keyboard.isDown("down") then
        self.y = self.y + 200 * dt
    end
end
```

现在在 `main.lua` 中创建这些对象。

```lua
--! file: main.lua
function love.load()
    -- 先 require classic，因为我们用它来创建类
    Object = require "classic"
    -- 然后 require Entity，它是其他类的基类
    require "entity"
    require "player"
    require "wall"

    player = Player(100, 100)
    wall = Wall(200, 100)
end

function love.update(dt)
    player:update(dt)
    wall:update(dt)
end

function love.draw()
    player:draw()
    wall:draw()
end
```

现在我们可以自由移动，但当然也可以穿过墙。那么换个思路：如果我们记录之前的位置，一旦撞到墙就把玩家放回之前的位置，这样玩家就永远无法穿墙了。

为此需要修改 `Entity` 类。我们新增一个 `last` 对象来记录之前的位置，并新增一个函数，用来在发生碰撞时把玩家放回旧位置。

由于本章会对代码做许多小改动，我会在需要新增或修改的地方标注 `---- ADD THIS`。

```lua
--! file: entity.lua
Entity = Object:extend()

function Entity:new(x, y, image_path)
    self.x = x
    self.y = y
    self.image = love.graphics.newImage(image_path)
    self.width = self.image:getWidth()
    self.height = self.image:getHeight()

---- ADD THIS
    self.last = {}
    self.last.x = self.x
    self.last.y = self.y
-------------
end

-- 我习惯性地传入 dt，即使暂时用不到
---- ADD THIS
function Entity:update(dt)
    -- 把当前位置保存为上一帧的位置
    self.last.x = self.x
    self.last.y = self.y
end

function Entity:resolveCollision(e)
```

```lua
function Entity:resolveCollision(e)
    if self:checkCollision(e) then
        -- 重置到旧位置
        self.x = self.last.x
        self.y = self.last.y
    end
end
-------------
```

要让这段逻辑生效，我们需要在 `Player` 类中调用基类的方法。

```lua
--! file: player.lua
function Player:update(dt)
    -- 在修改位置之前调用
    ---- ADD THIS
    Player.super.update(self, dt)
    -------------

    if love.keyboard.isDown("left") then
        self.x = self.x - 200 * dt
    elseif love.keyboard.isDown("right") then
        self.x = self.x + 200 * dt
    end

    if love.keyboard.isDown("up") then
        self.y = self.y - 200 * dt
    elseif love.keyboard.isDown("down") then
        self.y = self.y + 200 * dt
    end
end
```

同时在 `main.lua` 里调用 `resolveCollision()`。

```lua
--! file: main.lua
function love.update(dt)
    player:update(dt)
    wall:update(dt)
    player:resolveCollision(wall)
end
```

试试看。你会发现它“有点”奏效。如果仔细观察，会看到玩家和墙之间偶尔会出现一条缝。这是因为玩家移动太快，越过了这段距离，与墙重叠后又被放回上一帧的位置。

![](/images/book/23/collision_to_previous.gif)

我们不应该把玩家放回上一帧的位置，而是应该沿着与墙重叠的方向把它推出去——也就是说只推到刚好不重叠（边缘相贴为止）。

为此我们需要解决两个问题：

* 要把玩家推开多远才不会再与墙重叠？
* 应该沿哪个方向把玩家推出墙外？

先假设玩家是从左侧撞上来的，之后再处理所有方向。

我们可以通过计算玩家与墙在 X 轴上的重叠长度来得到需要移动的距离：玩家右边缘减去墙左边缘。如果玩家右侧的 x 坐标为 225，而墙左侧的 x 坐标为 205，就需要把玩家向左推 20 像素。

```lua
--! file: entity.lua
function Entity:resolveCollision(e)
    if self:checkCollision(e) then
        -- 玩家右侧是 x + width
        -- 墙的左侧是 x
        -- 计算差值并从玩家位置中减去
        local pushback = self.x + self.width - e.x
        self.x = self.x - pushback
    end
end
```

现在缝隙消失了。由于我们只在水平方向推开玩家，玩家可以在贴着墙的同时垂直移动。

下面让它能适用于所有方向。为了判断玩家是从哪个方向撞上来的，我们可以利用之前记录的位置。除非玩家是从拐角撞上来的，否则上一帧的位置要么与墙在垂直方向对齐，要么在水平方向对齐。

![](/images/book/23/hor_ver_collision.gif)

如果是从左侧靠近墙，那么上一帧已经在垂直方向对齐——也就是在垂直方向上已经发生碰撞。还记得第 13 章的四个条件吗？在真正接触墙之前，其中有两个条件已经满足：

* A 的底边比 B 的顶边更靠下。
* A 的顶边比 B 的底边更靠上。

既然我们需要沿水平方向移动才能撞上墙，就能判断玩家是从左侧或右侧过来的。

因此我们检查上一帧的位置是否已经与墙在垂直方向或水平方向对齐，据此决定要沿哪个轴把玩家推出去。

```lua
function Entity:wasVerticallyAligned(e)
    -- 基本上就是碰撞检测函数，只是去掉了 x 和 width 的部分
    -- 使用 last.y，因为我们要看上一帧的位置
    return self.last.y < e.last.y + e.height and self.last.y + self.height > e.last.y
end

function Entity:wasHorizontallyAligned(e)
    -- 同理，去掉 y 和 height 的部分
    -- 使用 last.x，因为我们要看上一帧的位置
    return self.last.x < e.last.x + e.width and self.last.x + self.width > e.last.x
end

function Entity:resolveCollision(e)
    if self:checkCollision(e) then
        if self:wasVerticallyAligned(e) then

        elseif self:wasHorizontallyAligned(e) then

        end
    end
end
```

现在我们知道了要沿哪个轴推开，接着判断是从哪一侧接触的。一个简单的方法是比较墙和玩家的中心点：如果上一帧已经在垂直方向对齐，那么当玩家中心在墙中心左侧，就把玩家向左推；否则向右推。试着实现一下。

```lua
function Entity:resolveCollision(e)
    if self:checkCollision(e) then
        if self:wasVerticallyAligned(e) then
            if self.x + self.width/2 < e.x + e.width/2  then
                -- pushback = 玩家右边缘 - 墙左边缘
                local pushback = self.x + self.width - e.x
                self.x = self.x - pushback
            else
                -- pushback = 墙右边缘 - 玩家左边缘
                local pushback = e.x + e.width - self.x
                self.x = self.x + pushback
            end
        elseif self:wasHorizontallyAligned(e) then
            if self.y + self.height/2 < e.y + e.height/2 then
                -- pushback = 玩家下边缘 - 墙上边缘
                local pushback = self.y + self.height - e.y
                self.y = self.y - pushback
            else
                -- pushback = 墙下边缘 - 玩家上边缘
                local pushback = e.y + e.height - self.y
                self.y = self.y + pushback
            end
        end
    end
end
```

成功了！信息量有点大，我们来回顾一下。

![](/images/book/23/loss.png)

1. 玩家和墙已经处在同一高度，这意味着玩家是沿水平方向移动后发生碰撞的。
2. 玩家中心比墙的中心更靠左，所以我们应该向左推。
3. 玩家右边缘比墙左边缘多出 5 个像素。换句话说，需要把玩家向左推 5 个像素才能不再重叠。
4. 玩家顺利被推出来了！我们做到了！

这套逻辑奏效了，但还有一个问题。我们现在调用的是 `player:resolveCollision(wall)`，如果反过来调用 `wall:resolveCollision(player)` 就不起作用。当然在这个例子里我们知道墙比玩家“强”，但假如我们并不知道呢？

为了解决这个问题，我们可以新增一个 `strength`（力量）变量，让力量较小的对象被推开。

```lua
Entity = Object:extend()

function Entity:new(x, y, image_path)
    self.x = x
    self.y = y
    self.image = love.graphics.newImage(image_path)
    self.width = self.image:getWidth()
    self.height = self.image:getHeight()

    self.last = {}
    self.last.x = self.x
    self.last.y = self.y

    -- 给变量一个默认值
    ---- ADD THIS
    self.strength = 0
    -------------
end
```

```lua
--! file: wall.lua
Wall = Entity:extend()

function Wall:new(x, y)
    Wall.super.new(self, x, y, "wall.png")
    -- 让墙的力量值为 100
    self.strength = 100
end
```

接着在 `Entity:resolveCollision(e)` 中比较力量值。如果 `self.strength` 大于 `e.strength`，就调用 `e:resolveCollision(self)`，也就是把角色互换。

```lua
--! file: entity.lua
function Entity:resolveCollision(e)
    ---- ADD THIS
    if self.strength > e.strength then
        e:resolveCollision(self)
        -- 返回，因为我们不想继续执行本函数
        return
    end
    -------------
    if self:checkCollision(e) then
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
            else
                local pushback = e.y + e.height - self.y
                self.y = self.y + pushback
            end
        end
    end
end
```

这样一来，就无论谁先调用都能正确处理了。

___

## 推箱子

墙会把玩家推开，但如果我们想让玩家推动某个物体该怎么办？我们需要在现有逻辑上做一些修改。

先创建一个 `Box` 类。可以使用这张图片：

![](/images/book/23/box.png)

```lua
--! file: box.lua
Box = Entity:extend()

function Box:new(x, y)
    Box.super.new(self, x, y, "box.png")
end
```

然后把箱子加入场景，并顺便建立一个 `objects` 表。

```lua
--! file: main.lua
function love.load()
    Object = require "classic"
    require "entity"
    require "player"
    require "wall"
    -- 记得 require box！
    require "box"

    player = Player(100, 100)
    wall = Wall(200, 100)
    box = Box(400, 150)

    objects = {}
    table.insert(objects, player)
    table.insert(objects, wall)
    table.insert(objects, box)
end
```

现在可以用 `ipairs` 循环来更新和绘制对象，但碰撞要怎么处理呢？我们希望所有对象都能与其他对象检测碰撞。可以用两个 for 循环，并且在循环里判断是否为同一个对象，例如：

```lua
-- 示例，无需抄写
for i,v in ipairs(objects) do
    for j,w in ipairs(objects) do
        -- 确保不是同一个对象
        -- 否则会和自己解决碰撞
        if v ~= w then
            v:resolveCollision(w)
        end
    end
end
```

不过还有另一个问题：现在 `resolveCollision()` 会根据力量值互相推开，一旦墙推开玩家之后，如果玩家接着去推箱子、箱子再撞到墙，就会出现力量传递的问题。为此我们引入一个 `tempStrength`（临时力量）来在一次碰撞循环内传递力量值。

```lua
---- ADD THIS
self.tempStrength = self.strength
-------------
end

function Entity:resolveCollision(e)
    -- 比较临时力量
    ---- ADD THIS
    if self.tempStrength > e.tempStrength then
        e:resolveCollision(self)
        -- 返回，因为我们不想继续执行本函数
        return
    end
    -------------

    if self:checkCollision(e) then
        -- 复制临时力量
        ---- ADD THIS
        self.tempStrength = e.tempStrength
        -------------
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
            else
                local pushback = e.y + e.height - self.y
                self.y = self.y + pushback
            end
        end
    end
end
```

差不多了！现在的问题是：玩家把箱子推向墙时，墙把箱子推回玩家，但循环已经处理过这两者的碰撞了，所以不会再重新解决一次。我们应该在有碰撞发生时持续重复检测，直到没有任何碰撞为止。

让 `Entity:resolveCollision(e)` 返回 `true` 或 `false`，表示是否发生了碰撞。如果返回 `true`，我们就再遍历一次对象列表。

```lua
function Entity:resolveCollision(e)
    -- 比较临时力量
    if self.tempStrength > e.tempStrength then
        -- 需要返回这个调用的结果
        -- 否则 main.lua 永远收不到返回值
        ---- ADD THIS
        return e:resolveCollision(self)
        -------------
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
            else
                local pushback = e.y + e.height - self.y
                self.y = self.y + pushback
            end
        end
        -- 发生了碰撞！解决后返回 true
        ---- ADD THIS
        return true
        -------------
    end
    -- 没有碰撞，返回 false
    -- （其实不返回也行，返回 nil 也能起到类似作用）
    ---- ADD THIS
    return false
    -------------
end
```

接着我们希望只要还有碰撞未解决，就持续检测。可以用 *while 循环*：只要条件为真就继续循环。要小心，写错 while 循环很容易造成死循环，让游戏直接卡死。所以我们也加一个循环次数上限，以防出现意料之外的情况导致永远解不开碰撞。如果 100 次循环后还没处理完，就跳出循环。

```lua
--! file: main.lua
function love.update(dt)
    -- 更新所有对象
    for i,v in ipairs(objects) do
        v:update(dt)
    end

    local loop = true
    local limit = 0

    while loop do
        -- 先把 loop 设为 false，如果没有碰撞就保持为 false
        loop = false

        limit = limit + 1
        if limit > 100 then
            -- 100 次循环后仍未完成
            -- 大概是陷入死循环了，直接跳出
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
    end
end
```

成功了！真的成功了！就算有多个箱子也能正常运行！

![](/images/book/23/box_wall_good.gif)

___

## 库

我们的碰撞系统已经相当不错了，但仍算不上完美。想要更高级的碰撞处理，可以看看 **bump**。如果想处理矩形以外的形状，可以看看 **HC**。

* [Bump](https://github.com/kikito/bump.lua)
* [HC](https://github.com/vrld/HC)

___

## 总结

我们可以通过把玩家推出与之碰撞的对象来解决碰撞问题。利用 `strength` 属性可以决定哪一方把另一方推开；通过传递这个力量值，可以实现“玩家推箱子，箱子抵在墙上时又反过来推玩家”的效果。我们要持续解决对象之间的碰撞，直到完全没有重叠为止。`while` 循环可以在条件为真时不断重复，但使用时务必要小心，因为死循环会让游戏直接崩溃。
