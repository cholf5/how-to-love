讓我們把目前學到的所有內容用在一個簡單的遊戲上。你可以盡情閱讀關於編程和做遊戲的資料，但真正想學會，就必須親自動手。

遊戲本質上就是一堆需要解決的問題。當你讓經驗豐富的程式設計師去做《PONG》時，他不會去搜索「如何製作 PONG」。他們會把 PONG 拆成幾個獨立的問題，並且知道怎麼逐一解決。本章就是教你如何把一個遊戲拆分成多個任務。

我們要製作的遊戲很簡單：一名敵人會在牆壁之間彈來彈去，而我們要射中它。每次命中後敵人都會變快。只要打空一次，遊戲就會結束，你得重新開始。

![](/images/book/14/demo.gif)

這個遊戲會用到幾張圖片。你可以用自己的素材，但我會使用這三張：

![](/images/book/14/panda.png)
![](/images/book/14/snake.png)
![](/images/book/14/bullet.png)

這些圖片來自 [Kenney](http://kenney.nl/assets)，他製作了很多免費素材供大家在遊戲中使用。去看看他吧！

我們從 3 個主要的回調函數開始，並加載 *classic*，這就是我們用來模擬類的庫。

```lua
function love.load()
    Object = require "classic"
end

function love.update(dt)
end

function love.draw()
end
```

我們從玩家開始。新建一個名為 `player.lua` 的文件。

我們可以為所有對象做一個基類，但因為這只是一個簡單的小項目，就先不這麼做。不過我鼓勵你在章節結束後自行添加一個基類來改進代碼。

___

## 任務：創建一個可以移動的玩家

創建一個 Player 類：

```lua
--! file: player.lua
Player = Object:extend()

function Player:new()

end
```

我準備把熊貓的圖片給玩家使用。

```lua
function Player:new()
    self.image = love.graphics.newImage("panda.png")
end


function Player:draw()
    love.graphics.draw(self.image)
end
```

接下來讓我們通過方向鍵控制玩家移動。

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

現在我們應該能移動玩家了。回到 `main.lua` 並加載玩家。

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

如你所見，我們能移動玩家。但玩家依然可以移動到窗口外。我們用 if 語句來修復它。

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

糟糕，玩家還是能向右移得太遠。我們在檢測是否撞到右牆時，需要把寬度也考慮進去。

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

現在修好了，玩家再也出不了窗口。

___

## 任務：創建一個會移動的敵人

現在來製作 Enemy 類。新建一個名為 `enemy.lua` 的文件，輸入下面的代碼：

```lua
--! file: enemy.lua
Enemy = Object:extend()

function Enemy:new()


end
```

我要把蛇的圖片交給敵人，並讓它自己移動起來。

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

我們需要讓敵人在牆壁上反彈，但先把它加載進來。

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

現在可以看到敵人在移動，也會穿出窗口。就像處理玩家那樣，確保它留在窗口內。

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

敵人會在牆邊停下來，但我們想讓它彈回去。該怎麼做？當它撞到右牆時，接下來呢？它應該朝另一個方向移動。如何讓它反向移動？我們只要改變 `speed` 的值即可。那這個值應該變成多少？不能再是 100，而應該是 -100。

那麼我們是不是該寫 `self.speed = -100` 呢？不行。因為我們說過敵人被擊中時會加速，如果這麼寫，敵人一彈回就會把速度重置。所以我們應該把 `speed` 的值取反。`speed` 會變成 `-speed`。換句話說，如果速度增加到了 120，那它就會變成 -120。

如果撞到左牆呢？那時速度是個負數，我們應該把它變成正數。怎麼做？[負負得正](https://www.khanacademy.org/math/algebra-basics/basic-alg-foundations/alg-basics-negative-numbers/v/why-a-negative-times-a-negative-is-a-positive)。所以如果我們讓當時為負數的 `speed` 等於 `-speed`，它就會變回正數。

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

好了，我們已經有了玩家和一個會移動的敵人，接下來就剩下子彈了。

___

## 任務：能夠發射子彈

新建一個名為 `bullet.lua` 的文件，並寫入以下代碼：

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

子彈應該沿著豎直方向移動，而不是水平。

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

現在我們得發射子彈。在 main.lua 裡加載該文件並創建一個表。

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

接著給 Player 一個在按下空格時生成子彈的函數。

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

我們需要在 `love.keypressed` 回調裡調用這個函數。

```lua
--! file: main.lua
function love.keypressed(key)
    player:keyPressed(key)
end
```

接下來遍歷表，更新/繪製所有子彈。

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

太棒了，玩家現在能夠發射子彈了。

___

## 任務：讓子彈影響敵人的速度

現在我們需要讓子彈能夠擊中蛇。給 Bullet 增加一個碰撞檢測函數。

```lua
--! file: bullet.lua
function Bullet:checkCollision(obj)

end
```

你還記得怎麼做嗎？還記得要滿足碰撞成立的四個條件嗎？

這次不要返回 true 或 false，而是要增加敵人的速度。我們給子彈添加一個屬性 `dead`，稍後會用它把子彈從列表中移除。

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

現在我們要在 main.lua 中調用 checkCollision。

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

接著我們需要銷毀已經死亡的子彈。

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

最後一件事是當子彈沒有打中敵人而飛出屏幕時，要重啟遊戲。我們得檢查子彈是否離開屏幕。

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

測試一下吧。你可能會注意到，當敵人正向左移動時被擊中，它反而會減速。這是因為那時敵人的速度是負數，所以增加數值反而會減慢它。為了解決這個問題，我們需要檢測敵人的速度是否為負。

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

這樣遊戲就完成了。真的結束了嗎？你可以試著給遊戲添加更多功能，或者乾脆做一個全新的遊戲。不管做什麼，只要能持續學習、持續做遊戲就好！

___

## 總結
遊戲本質上就是一系列需要解決的問題。
