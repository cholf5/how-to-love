*我們使用上一章的代碼*
___

## 下落

既然我們已經能夠解決碰撞，就可以製作一個平臺遊戲了——一種角色會往下墜、也能向上跳的遊戲。首先讓我們創建一張地圖，供角色四處行走。我們可以把之前添加的那堵孤零零的牆移除。

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

根據你電腦的性能不同，你可能會注意到遊戲變得很慢。這是因為我們添加的所有牆體都會彼此檢查碰撞。這非常低效，因為沒有必要這麼做。牆體從不會移動，因此它們之間絕不會互相重疊。我們應該為所有牆體創建一張獨立的表。`objects` 表需要和自身以及 `walls` 表檢查碰撞，但 `walls` 表沒有必要和自身做碰撞檢測。

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

    -- 創建牆體表
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
                -- 把所有牆體添加到 walls 表中
                ---- 將此處改為
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

    -- 更新牆體
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

    -- 讓每個對象都與每一堵牆檢查碰撞
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

    -- 繪製牆體
    ---- 在此添加
    for i,v in ipairs(walls) do
    v:draw()
    end
    -------------
end
```

好了，現在我們可以開始添加平臺物理了。先從下落開始。在 `player.lua` 中，我們已經在按下下方向鍵時讓玩家向下移動。把那個 if 語句移除後，玩家就會自動往下掉。

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

    -- 移除 if 語句
    self.y = self.y + 200 * dt
end
```

![](/images/book/24/falling.gif)

效果出來了，物體會往下掉，但這並不像真實的重力。物體應當緩慢下落，並且越落越快。我們可以在 `Entity` 類中創建更像真實重力的東西。我們需要 `gravity` 和 `weight` 屬性。用 `gravity` 屬性增加實體的 y 位置，用 `weight` 屬性增加重力，從而提高下落速度。

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

    -- 添加 gravity 與 weight 屬性
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

由於牆體不需要下落，我們可以給它一個 0 的 `weight`。

```lua
--! file: wall.lua
Wall = Entity:extend()

function Wall:new(x, y)
    Wall.super.new(self, x, y, "wall.png", 1)
    self.strength = 100
    self.weight = 0
end
```

然後我們可以移除玩家身上讓其自動下落的部分，也不再允許通過按上方向鍵向上移動。

```lua
--! file: player.lua
function Player:update(dt)
    -- 在改變位置之前先執行這一行非常重要
    Player.super.update(self, dt)

    if love.keyboard.isDown("left") then
    self.x = self.x - 200 * dt
    elseif love.keyboard.isDown("right") then
    self.x = self.x + 200 * dt
    end

    -- 移除垂直方向的移動
end
```

現在玩家和箱子都會下落，而且下落速度會逐漸增加。

![](/images/book/24/gravity.gif)

但如果你讓遊戲運行得足夠久，會發現玩家和箱子會直接穿過地板。這是因為即使它們站在地面上，重力仍然在持續增加。我們需要在它們站在地面上時重置重力，可以在 `Entity:resolveCollision(e)` 中做到這一點。

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
        -- 我們從下方碰到了牆
        -- 這意味著我們站在地面上
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

現在它們就不會再穿過牆了。

___

## 跳躍

是時候讓玩家能夠跳躍了。我們希望在按下上方向鍵時讓角色跳起來。首先在 `main.lua` 中添加 `love.keypressed(key)` 回調，並讓它調用玩家的 `jump()` 函數，稍後我們就會編寫這個函數。

```lua
--! file: main.lua
function love.keypressed(key)
    -- 當按下上方向鍵時讓玩家跳躍
    if key == "up" then
        player:jump()
    end
end
```

那麼要讓玩家跳起來需要發生什麼呢？其實非常簡單，只要把重力設成一個負值即可。數值越低（換句話說越負），玩家跳得就越高。

```lua
--! file: player.lua
function Player:jump()
    self.gravity = -300
end
```

當玩家的重力發生變化時，它會跳到空中，隨後隨著重力不斷增加慢慢落下。

![](/images/book/24/jumping.gif)

不過你會發現我們可以跳好幾次。我們並不想這樣。只有站在地面上的時候才能跳。我們可以給玩家添加一個 `canJump` 屬性。當你落地時，它會變成 `true`；當你起跳（只有在 `canJump` 為 `true` 時才能起跳）後，它會變成 `false`。

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

    -- 移除該 if 語句
    -- self.y = self.y + 200 * dt
end


function Player:jump()
    if self.canJump then
    self.gravity = -300
    self.canJump = false
    end
end
```

但是現在如果我們想在落地時執行某些動作（在這裡是把 `canJump` 設為 `true`），就不得不在 `Entity` 類裡處理。我們當然可以這麼做，但這個跳躍代碼是玩家特有的。讓我們添加一個在碰撞解決時會被調用的函數，這樣我們就能在 `Player` 類中覆寫這些函數。

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
        -- 用函數替換這些邏輯
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

-- 當實體的某個方向與某物發生碰撞時
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

現在我們就可以覆寫 `collide(e)` 函數，在 `direction` 為 `"bottom"` 時把 `canJump` 設為 `true`。

```lua
--! file: player.lua
function Player:collide(e, direction)
    Player.super.collide(self, e, direction)
    if direction == "bottom" then
        self.canJump = true
    end
end
```

現在我們只能跳一次了。但當你從平臺邊緣走下去時仍然可以在半空中跳。

![](/images/book/24/midair.gif)

我們可以通過檢查之前的 y 位置是否等於當前的 y 位置來解決這個問題。當你站在地面上時，你在垂直方向上不應該移動。如果你在移動，就意味著你沒有站在地面上。

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

太棒了！在平臺遊戲中，常常需要從特定方向擊中某個東西。比如馬裡奧，只有從下方撞擊問號磚才會掉東西，只有跳到敵人頭上才會把它消滅。更高級的例子是可穿透的平臺：從下往上跳時可以穿過去，從上往下踩則會站在上面。

![](/images/book/24/platform.png)

讓我們嘗試創建這樣的平臺。

___

## 可穿透平臺

我們打算用箱子來實現這個效果。我們希望玩家不要推開箱子，而是能直接穿過去；當他從上方跳到箱子上時，則能站在上面。為了實現這一點，我們還需要做一些修改。`collide(e, direction)` 函數負責在碰撞被解決後應該發生什麼，但我們並不想解決這次碰撞，我們希望能夠穿過箱子。

不如先檢查碰撞雙方是否都希望解決碰撞？我們創建一個叫作 `checkResolved` 的函數。如果 `self` 和 `e` 都返回 `true`，那我們就繼續執行碰撞解決。

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
        -- 為雙方調用 checkResolve
        local a = self:checkResolve(e, "right")
        local b = e:checkResolve(self, "left")
        -- 當 a 與 b 都為 true 時才解決碰撞
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

現在我們可以在 `player.lua` 中覆寫 `checkResolve(e, direction)` 函數。我們使用的類庫 classic 中的每個類都有 `is:(class)` 函數，可以用來判斷某個實例是否屬於某個類。因此我們可以用 `e:is(Box)` 檢查 `e` 是否是 `Box` 類型。這同樣適用於基類，所以如果 `e` 是一個箱子，那麼 `e:is(Entity)` 也會返回 `true`，因為 `Box` 繼承自基類 `Entity`。

我們先檢查自己是否與 `Box` 碰撞；如果是，再檢查 `direction` 是否為 `"bottom"`。若是，則返回 `true`（表示我們希望解決碰撞），否則返回 `false`。

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

## 總結

通過增加我們用來提升 y 位置的數值，就可以模擬重力。通過把重力設為負值，就可以讓角色跳躍。通過添加函數並覆寫它們，我們可以在碰撞發生時執行動作，或者阻止碰撞被解決。

___

## 結尾？

至此，我們來到了本章的結尾，也來到了本書（暫時）的終點！希望你喜歡這些章節，並且學到了很多。我仍然計劃在未來撰寫新的章節，但那是以後要做的事了。在此之前，祝你在成為更優秀的遊戲程式設計師的道路上一帆風順。如果你想繼續學習，我推薦 [learn2love](https://rvagamejams.com/learn2love/)。它對我這裡講過的主題有更深入的討論，還包括網絡編程等章節。

記得多加練習。正如我在緒論裡所說，你可以把繪畫的知識讀個遍，但想學會它就必須動手實踐。編程也是如此。乾杯！
