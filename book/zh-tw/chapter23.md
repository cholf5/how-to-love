# 第 23 章 - 解決碰撞

在第 13 章我們討論過如何檢測碰撞。本章我們再進一步。想像你在一個可以四處移動的遊戲裡，場景中有一些無法穿過的牆。要實現這一點，我們不僅要檢測碰撞，還得讓玩家在撞到牆之後停止移動，並且不會卡在牆裡。我們需要把玩家「推」出來。

在開始之前我想先說明，解決碰撞是件非常困難的事，甚至連專業人士都會經常在這上面栽跟頭。去看看速通視頻就知道了，裡面有很多能穿牆之類的漏洞。我們要做的碰撞解決方式已經相當可靠，但絕稱不上完美。如果你覺得難以理解，也彆氣餒。

在本教程中我們需要兩樣東西：一個能向四個方向移動的玩家，以及一些牆。先為它們創建一個基類 —— `Entity`。

我們會用到這些文件：

* main.lua
* player.lua
* wall.lua
* entity.lua
* classic.lua

先從 `Entity` 類開始。它有 `x`、`y`、`width` 和 `height`。我們給牆和玩家都使用一張圖片，並把這張圖片的寬高作為實體的寬高。

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

接著加上碰撞檢測。你還記得為什麼這麼寫能檢測矩形碰撞嗎？如果忘了，不妨回去重讀第 13 章。

```lua
function Entity:checkCollision(e)
    -- e 是要和自身檢測碰撞的另一個實體
    -- 這是第 13 章的精簡版本
    return self.x + self.width > e.x
    and self.x < e.x + e.width
    and self.y + self.height > e.y
    and self.y < e.y + e.height
end
```

現在我們可以基於這個基類創建玩家和牆。下面是將要用到的圖片（彩色邊框能幫助我們觀察碰撞情況）：

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

讓玩家可以用方向鍵移動。

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

現在在 `main.lua` 中創建這些對象。

```lua
--! file: main.lua
function love.load()
    -- 先 require classic，因為我們用它來創建類
    Object = require "classic"
    -- 然後 require Entity，它是其他類的基類
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

現在我們可以自由移動，但當然也可以穿過牆。那麼換個思路：如果我們記錄之前的位置，一旦撞到牆就把玩家放回之前的位置，這樣玩家就永遠無法穿牆了。

為此需要修改 `Entity` 類。我們新增一個 `last` 對象來記錄之前的位置，並新增一個函數，用來在發生碰撞時把玩家放回舊位置。

由於本章會對代碼做許多小改動，我會在需要新增或修改的地方標註 `---- ADD THIS`。

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

-- 我習慣性地傳入 dt，即使暫時用不到
---- ADD THIS
function Entity:update(dt)
    -- 把當前位置保存為上一幀的位置
    self.last.x = self.x
    self.last.y = self.y
end

function Entity:resolveCollision(e)
```

```lua
function Entity:resolveCollision(e)
    if self:checkCollision(e) then
        -- 重置到舊位置
        self.x = self.last.x
        self.y = self.last.y
    end
end
-------------
```

要讓這段邏輯生效，我們需要在 `Player` 類中調用基類的方法。

```lua
--! file: player.lua
function Player:update(dt)
    -- 在修改位置之前調用
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

同時在 `main.lua` 裡調用 `resolveCollision()`。

```lua
--! file: main.lua
function love.update(dt)
    player:update(dt)
    wall:update(dt)
    player:resolveCollision(wall)
end
```

試試看。你會發現它「有點」奏效。如果仔細觀察，會看到玩家和牆之間偶爾會出現一條縫。這是因為玩家移動太快，越過了這段距離，與牆重疊後又被放回上一幀的位置。

![](/images/book/23/collision_to_previous.gif)

我們不應該把玩家放回上一幀的位置，而是應該沿著與牆重疊的方向把它推出去——也就是說只推到剛好不重疊（邊緣相貼為止）。

為此我們需要解決兩個問題：

* 要把玩家推開多遠才不會再與牆重疊？
* 應該沿哪個方向把玩家推出牆外？

先假設玩家是從左側撞上來的，之後再處理所有方向。

我們可以通過計算玩家與牆在 X 軸上的重疊長度來得到需要移動的距離：玩家右邊緣減去牆左邊緣。如果玩家右側的 x 坐標為 225，而牆左側的 x 坐標為 205，就需要把玩家向左推 20 像素。

```lua
--! file: entity.lua
function Entity:resolveCollision(e)
    if self:checkCollision(e) then
        -- 玩家右側是 x + width
        -- 牆的左側是 x
        -- 計算差值並從玩家位置中減去
        local pushback = self.x + self.width - e.x
        self.x = self.x - pushback
    end
end
```

現在縫隙消失了。由於我們只在水平方向推開玩家，玩家可以在貼著牆的同時垂直移動。

下面讓它能適用於所有方向。為了判斷玩家是從哪個方向撞上來的，我們可以利用之前記錄的位置。除非玩家是從拐角撞上來的，否則上一幀的位置要麼與牆在垂直方向對齊，要麼在水平方向對齊。

![](/images/book/23/hor_ver_collision.gif)

如果是從左側靠近牆，那麼上一幀已經在垂直方向對齊——也就是在垂直方向上已經發生碰撞。還記得第 13 章的四個條件嗎？在真正接觸牆之前，其中有兩個條件已經滿足：

* A 的底邊比 B 的頂邊更靠下。
* A 的頂邊比 B 的底邊更靠上。

既然我們需要沿水平方向移動才能撞上牆，就能判斷玩家是從左側或右側過來的。

因此我們檢查上一幀的位置是否已經與牆在垂直方向或水平方向對齊，據此決定要沿哪個軸把玩家推出去。

```lua
function Entity:wasVerticallyAligned(e)
    -- 基本上就是碰撞檢測函數，只是去掉了 x 和 width 的部分
    -- 使用 last.y，因為我們要看上一幀的位置
    return self.last.y < e.last.y + e.height and self.last.y + self.height > e.last.y
end

function Entity:wasHorizontallyAligned(e)
    -- 同理，去掉 y 和 height 的部分
    -- 使用 last.x，因為我們要看上一幀的位置
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

現在我們知道了要沿哪個軸推開，接著判斷是從哪一側接觸的。一個簡單的方法是比較牆和玩家的中心點：如果上一幀已經在垂直方向對齊，那麼當玩家中心在牆中心左側，就把玩家向左推；否則向右推。試著實現一下。

```lua
function Entity:resolveCollision(e)
    if self:checkCollision(e) then
        if self:wasVerticallyAligned(e) then
            if self.x + self.width/2 < e.x + e.width/2  then
                -- pushback = 玩家右邊緣 - 牆左邊緣
                local pushback = self.x + self.width - e.x
                self.x = self.x - pushback
            else
                -- pushback = 牆右邊緣 - 玩家左邊緣
                local pushback = e.x + e.width - self.x
                self.x = self.x + pushback
            end
        elseif self:wasHorizontallyAligned(e) then
            if self.y + self.height/2 < e.y + e.height/2 then
                -- pushback = 玩家下邊緣 - 牆上邊緣
                local pushback = self.y + self.height - e.y
                self.y = self.y - pushback
            else
                -- pushback = 牆下邊緣 - 玩家上邊緣
                local pushback = e.y + e.height - self.y
                self.y = self.y + pushback
            end
        end
    end
end
```

成功了！信息量有點大，我們來回顧一下。

![](/images/book/23/loss.png)

1. 玩家和牆已經處在同一高度，這意味著玩家是沿水平方向移動後發生碰撞的。
2. 玩家中心比牆的中心更靠左，所以我們應該向左推。
3. 玩家右邊緣比牆左邊緣多出 5 個像素。換句話說，需要把玩家向左推 5 個像素才能不再重疊。
4. 玩家順利被推出來了！我們做到了！

這套邏輯奏效了，但還有一個問題。我們現在調用的是 `player:resolveCollision(wall)`，如果反過來調用 `wall:resolveCollision(player)` 就不起作用。當然在這個例子裡我們知道牆比玩家「強」，但假如我們並不知道呢？

為了解決這個問題，我們可以新增一個 `strength`（力量）變量，讓力量較小的對象被推開。

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

    -- 給變量一個默認值
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
    -- 讓牆的力量值為 100
    self.strength = 100
end
```

接著在 `Entity:resolveCollision(e)` 中比較力量值。如果 `self.strength` 大於 `e.strength`，就調用 `e:resolveCollision(self)`，也就是把角色互換。

```lua
--! file: entity.lua
function Entity:resolveCollision(e)
    ---- ADD THIS
    if self.strength > e.strength then
        e:resolveCollision(self)
        -- 返回，因為我們不想繼續執行本函數
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

這樣一來，就無論誰先調用都能正確處理了。

___

## 推箱子

牆會把玩家推開，但如果我們想讓玩家推動某個物體該怎麼辦？我們需要在現有邏輯上做一些修改。

先創建一個 `Box` 類。可以使用這張圖片：

![](/images/book/23/box.png)

```lua
--! file: box.lua
Box = Entity:extend()

function Box:new(x, y)
    Box.super.new(self, x, y, "box.png")
end
```

然後把箱子加入場景，並順便建立一個 `objects` 表。

```lua
--! file: main.lua
function love.load()
    Object = require "classic"
    require "entity"
    require "player"
    require "wall"
    -- 記得 require box！
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

現在可以用 `ipairs` 循環來更新和繪製對象，但碰撞要怎麼處理呢？我們希望所有對象都能與其他對象檢測碰撞。可以用兩個 for 循環，並且在循環裡判斷是否為同一個對象，例如：

```lua
-- 示例，無需抄寫
for i,v in ipairs(objects) do
    for j,w in ipairs(objects) do
        -- 確保不是同一個對象
        -- 否則會和自己解決碰撞
        if v ~= w then
            v:resolveCollision(w)
        end
    end
end
```

不過還有另一個問題：現在 `resolveCollision()` 會根據力量值互相推開，一旦牆推開玩家之後，如果玩家接著去推箱子、箱子再撞到牆，就會出現力量傳遞的問題。為此我們引入一個 `tempStrength`（臨時力量）來在一次碰撞循環內傳遞力量值。

```lua
---- ADD THIS
self.tempStrength = self.strength
-------------
end

function Entity:resolveCollision(e)
    -- 比較臨時力量
    ---- ADD THIS
    if self.tempStrength > e.tempStrength then
        e:resolveCollision(self)
        -- 返回，因為我們不想繼續執行本函數
        return
    end
    -------------

    if self:checkCollision(e) then
        -- 複製臨時力量
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

差不多了！現在的問題是：玩家把箱子推向牆時，牆把箱子推回玩家，但循環已經處理過這兩者的碰撞了，所以不會再重新解決一次。我們應該在有碰撞發生時持續重複檢測，直到沒有任何碰撞為止。

讓 `Entity:resolveCollision(e)` 返回 `true` 或 `false`，表示是否發生了碰撞。如果返回 `true`，我們就再遍歷一次對象列表。

```lua
function Entity:resolveCollision(e)
    -- 比較臨時力量
    if self.tempStrength > e.tempStrength then
        -- 需要返回這個調用的結果
        -- 否則 main.lua 永遠收不到返回值
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
        -- 發生了碰撞！解決後返回 true
        ---- ADD THIS
        return true
        -------------
    end
    -- 沒有碰撞，返回 false
    -- （其實不返回也行，返回 nil 也能起到類似作用）
    ---- ADD THIS
    return false
    -------------
end
```

接著我們希望只要還有碰撞未解決，就持續檢測。可以用 *while 循環*：只要條件為真就繼續循環。要小心，寫錯 while 循環很容易造成死循環，讓遊戲直接卡死。所以我們也加一個循環次數上限，以防出現意料之外的情況導致永遠解不開碰撞。如果 100 次循環後還沒處理完，就跳出循環。

```lua
--! file: main.lua
function love.update(dt)
    -- 更新所有對象
    for i,v in ipairs(objects) do
        v:update(dt)
    end

    local loop = true
    local limit = 0

    while loop do
        -- 先把 loop 設為 false，如果沒有碰撞就保持為 false
        loop = false

        limit = limit + 1
        if limit > 100 then
            -- 100 次循環後仍未完成
            -- 大概是陷入死循環了，直接跳出
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

成功了！真的成功了！就算有多個箱子也能正常運行！

![](/images/book/23/box_wall_good.gif)

___

## 庫

我們的碰撞系統已經相當不錯了，但仍算不上完美。想要更高級的碰撞處理，可以看看 **bump**。如果想處理矩形以外的形狀，可以看看 **HC**。

* [Bump](https://github.com/kikito/bump.lua)
* [HC](https://github.com/vrld/HC)

___

## 總結

我們可以通過把玩家推出與之碰撞的對象來解決碰撞問題。利用 `strength` 屬性可以決定哪一方把另一方推開；通過傳遞這個力量值，可以實現「玩家推箱子，箱子抵在牆上時又反過來推玩家」的效果。我們要持續解決對象之間的碰撞，直到完全沒有重疊為止。`while` 循環可以在條件為真時不斷重複，但使用時務必要小心，因為死循環會讓遊戲直接崩潰。
