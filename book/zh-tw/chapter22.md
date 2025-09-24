___
*我們會沿用上一章的代碼*
___

## 攝像機

當關卡非常大、不能完全塞進屏幕時，就需要一個「攝像機」來跟著玩家移動。我們來給上一章寫的遊戲加上攝像機：玩家在場景裡收集金幣。

攝像機的作用是什麼？本質上，它會在繪製時對所有內容做同樣的位移，讓玩家始終位於屏幕中央。要怎麼實現呢？一種做法是準備一個 `camera_offset` 之類的變量，然後繪製任何東西時都把它減掉。

```lua
love.graphics.circle("line", player.x - camera.offset.x, player.y - camera.offset.y, player.size)
```

可是在大型項目裡要畫的東西非常多，這樣做工作量太大。更簡單的辦法是使用 `love.graphics.translate()`。這個函數屬於*坐標系（Coordinate System）*的一部分。就像我們能平移、旋轉、縮放一張圖片一樣，也能平移、旋轉、縮放繪製的目標表面，而這個目標表面就叫做*畫布*（稍後會詳細介紹）。

默認情況下，你在位置 (x=0, y=0) 繪製內容，它會出現在屏幕左上角。如果調用 `love.graphics.translate(400, 200)`，我們就把畫布整體移動了。此時再在 (0,0) 位置繪製，結果會顯示在屏幕上的 (400,200)。如果調用 `love.graphics.scale(2)`，則之後繪製的所有內容都會被放大。多嘗試一下這些函數，你會更容易理解它們在做什麼。

接下來用 `love.graphics.translate(x, y)` 來構建攝像機。關鍵是如何移動屏幕，才能讓玩家出現在中央。先把玩家移到屏幕左上角：做法是把玩家位置取負值，當作新的 (0,0)。

在默認情況下，左上角就是 (0,0)，玩家會按自己的坐標 (100, 50) 被繪製出來。如果我們調用 `love.graphics.translate(-100, -50)`，就會把玩家搬到左上角。但我們想讓它位於中央，所以再加上屏幕寬高的一半（假設是 400 和 300）。

*下面這張圖演示了整個過程。首先用 `love.graphics.translate(-player.x, -player.y)` 把玩家移到左上角。接著用 `love.graphics.translate(-player.x + 400, -player.y + 300)` 把玩家移到屏幕中央。*

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

成功了！接下來我們想統計收集了多少金幣。分數屬於 HUD（抬頭顯示），也就是總是顯示在屏幕上的內容，不受遊戲場景的攝像機影響。先把分數變量加上：

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

運行一下遊戲，現在屏幕上能看到一個數字。但如何讓分數的位置不受攝像機影響呢？一種辦法是把坐標系平移回初始狀態：

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

我們還可以使用 `love.graphics.origin()`。它會重置所有坐標變換，對已經繪製的內容不會產生影響。

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

不過有時候這並不是最佳做法。比如我們想讓遊戲整體保持放大，始終調用 `love.graphics.scale(2)`，而又不希望它被重置。此時可以使用 `love.graphics.push()` 和 `love.graphics.pop()`。`love.graphics.push()` 會把當前的坐標變換保存到一個*棧*裡；`love.graphics.pop()` 則會取出棧頂保存的狀態並恢復。用它們就能正確地繪製分數。

```lua
--- code
function love.draw()
    love.graphics.push() -- 複製當前狀態並壓入棧中。
        love.graphics.translate(-player.x + 400, -player.y + 300)
        love.graphics.circle("line", player.x, player.y, player.size)
        love.graphics.draw(player.image, player.x, player.y,
            0, 1, 1, player.image:getWidth()/2, player.image:getHeight()/2)
        for i,v in ipairs(coins) do
            love.graphics.circle("line", v.x, v.y, v.size)
            love.graphics.draw(v.image, v.x, v.y,
                0, 1, 1, v.image:getWidth()/2, v.image:getHeight()/2)
        end
    love.graphics.pop() -- 彈出棧頂狀態並恢復。
    love.graphics.print(score, 10, 10)
end
```

太好了，我們已經有了一個攝像機，並且能把分數疊加在攝像機之上。接下來讓畫面搖起來。

___

## 屏幕震動

我們來給遊戲加個屏幕震動效果。首先需要一個計時器表示震動持續的時間，並在 `update` 中讓它遞減。

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

然後在計時器大於 0 時，讓畫面在一個小範圍內隨機平移。

```lua
function love.draw()
    love.graphics.push() -- 複製當前狀態並壓入棧。
        love.graphics.translate(-player.x + 400, -player.y + 300)

        if shakeDuration > 0 then
            -- 在 -5 到 5 之間隨機平移。
            -- 第二次 translate 會基於前一次的結果進行，不會清除之前的位移。
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
    love.graphics.pop() -- 彈出狀態並恢復。
    love.graphics.print(score, 10, 10)
end
```

最後，每次撿到金幣時把計時器設成一個固定值，比如 0.3 秒。

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

試試看。也許你會覺得屏幕震動得太快；即使你覺得合適，也可能在別人的電腦上過快。因此我們還是要使用 delta time。可以再添加一個計時器來解決，同時需要一個對象來保存平移的偏移量。

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

現在震動速度就穩定了。

接著我們把遊戲做成多人遊戲，加入分屏效果怎麼樣？

___

## 畫布
每次你用 love.graphics 繪製內容時，實際上都是畫到一塊*畫布*上。畫布本身是一個對象，我們還可以創建自己的畫布。這在做多人分屏時非常有用：可以為每名玩家各自繪製到一塊獨立的畫布上，然後再把這些畫布繪製回主畫布。因為畫布本身也是一種 [Drawable](https://love2d.org/wiki/Drawable)，也就是所有能被 `love.graphics.draw()` 繪製的對象的父類。

Canvas 的超類型按層級順序是：

* Texture（紋理）
* Drawable（可繪製對象）
* Object（對象）

[Texture](http://love2d.org/wiki/Texture) 是 Drawable 的子類型。Image 和 Canvas 都是 Texture 的子類型，因此都可以配合 Quad 來繪製。
所有 LÖVE 對象的類型最終都是 [Object](http://love2d.org/wiki/Object)。不要和我們在代碼裡使用的 `Object` 類混淆，它們並沒有任何關係，只是名字一樣而已。

可以用 [`love.graphics.newCanvas`](http://love2d.org/wiki/love.graphics.newCanvas) 來創建畫布。

讓我們用畫布在遊戲裡實現分屏。首先加上另一個使用 WASD 操作的玩家，並移除屏幕震動以及存檔/讀檔系統。

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
    -- 用一行算出距離。
    -- 計算 x、y 坐標的差，再平方、求和，最後取平方根。
    local distance = math.sqrt((p1.x - p2.x)^2 + (p1.y - p2.y)^2)
    -- 返回距離是否小於半徑之和。
    return distance < p1.size + p2.size
end
```

接著需要一塊畫布來繪製場景。我們要把畫布繪製在屏幕的左右兩側，所以畫布尺寸設為 400x600。

```lua
-- In love.load()
screenCanvas = love.graphics.newCanvas(400, 600)
```

下一步是把遊戲繪製到這塊畫布上。`love.graphics.setCanvas()` 可以指定接下來要繪製到哪塊畫布上；如果不傳參數則會恢復成默認畫布。

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

此時如果運行遊戲，會發現屏幕是空的。因為我們確實把遊戲畫到了新畫布上，但還沒把這塊畫布繪製回默認畫布。就像之前說的，Canvas 是 Drawable，而 Drawable 都可以用 `love.graphics.draw` 繪製。

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

    -- 繪製畫布
    love.graphics.draw(screenCanvas)

    love.graphics.print("Player 1 - " .. score1, 10, 10)
    love.graphics.print("Player 2 - " .. score2, 10, 30)
end
```

現在應該能看到遊戲畫面了，但移動時會發現角色身後留下一條拖影。這是因為我們沒有清空畫布，導致之前繪製的內容一直保留。默認畫布會自動清空，而自定義畫布需要我們手動調用 `love.graphics.clear()`。應該在繪製遊戲前調用它。另外，由於我們只使用屏幕的一半，攝像機的中心也要調整：此時屏幕寬度的一半是 200 而不是 400。

既然我們要繪製兩次遊戲畫面，不妨把繪製邏輯封裝成一個函數。

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

    -- 加一條線把兩塊屏幕分隔開
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

現在我們有了分屏。不過左右兩側都仍然聚焦在玩家 1 身上。我們需要讓第二次繪製時攝像機聚焦玩家 2。可以為 `drawGame` 添加一個 `focus` 參數，讓攝像機對準傳入的對象（這裡就是玩家）。

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

## 庫

我們實現的攝像機還比較基礎。其實還能加很多功能，比如縮放、邊界限制等等。我推薦你看看這些提供高級攝像機功能的庫：

* [Gamera](https://github.com/kikito/gamera)
* [Stalker-X](https://github.com/adnzzzzZ/STALKER-X)

___

## 總結

藉助坐標系，我們可以改變屏幕上內容的繪製方式。`love.graphics.translate(x, y)` 能幫我們創建攝像機。所有繪製的內容都會落在*畫布*上，我們可以自己創建畫布，而且畫布和圖片一樣都屬於 LÖVE 的 *Texture* 類型，因此可以像繪製圖像那樣把畫布繪製在屏幕上。利用畫布，我們就能實現分屏等效果。
