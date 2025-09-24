# 第 21 章 - 保存與加載

讓我們的遊戲可以保存和讀取進度吧。這意味著要寫入和讀取文件。不過在此之前我們得先有個遊戲，於是我們做一個可以撿金幣的小小遊戲。

我們先從能夠移動的玩家開始。

```lua
 function love.load()
        -- 創建一個包含 x、y 以及半徑的玩家對象
        player = {
                x = 100,
                y = 100,
                size = 25
        }
end

function love.update(dt)
        -- 允許通過鍵盤移動
        if love.keyboard.isDown("left") then
                player.x = player.x - 200 * dt
        elseif love.keyboard.isDown("right") then
                player.x = player.x + 200 * dt
        end

        -- 注意這裡重新開啟了一個 if，而不是繼續 elseif
        -- 這是因為否則你就沒法斜向移動了。
        if love.keyboard.isDown("up") then
                player.y = player.y - 200 * dt
        elseif love.keyboard.isDown("down") then
                player.y = player.y + 200 * dt
        end
end

function love.draw()
        -- 玩家和金幣都會被畫成圓形
        love.graphics.circle("line", player.x, player.y, player.size)
end
```

為了好玩，我們給玩家畫上一張臉。

![](/images/book/21/face.png)

```lua
 function love.load()
        -- 創建一個包含 x、y、半徑的玩家對象
        player = {
                x = 100,
                y = 100,
                size = 25,
                image = love.graphics.newImage("face.png")
        }
end

function love.draw()
        love.graphics.circle("line", player.x, player.y, player.size)
        -- 將頭像的原點設置為圖片中心
        love.graphics.draw(player.image, player.x, player.y,
                0, 1, 1, player.image:getWidth()/2, player.image:getHeight()/2)
end
```

接下來我們要加上一些金幣，它們會隨機地分布在屏幕上。給金幣也加一個小小的美元符號吧。

![](/images/book/21/dollar.png)

```lua
 function love.load()
        player = {
                x = 100,
                y = 100,
                size = 25,
                image = love.graphics.newImage("face.png")
        }

        coins = {}

        for i=1,25 do
                table.insert(coins,
                        {
                                -- 使用 math.random 得到隨機位置
                                x = math.random(50, 650),
                                y = math.random(50, 450),
                                size = 10,
                                image = love.graphics.newImage("dollar.png")
                        }
                )
        end
end

function love.update(dt)
        if love.keyboard.isDown("left") then
                player.x = player.x - 200 * dt
        elseif love.keyboard.isDown("right") then
                player.x = player.x + 200 * dt
        end

        if love.keyboard.isDown("up") then
                player.y = player.y - 200 * dt
        elseif love.keyboard.isDown("down") then
                player.y = player.y + 200 * dt
        end
end

function love.draw()
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

現在我們要讓玩家能夠拾取金幣。我們需要檢測是否發生碰撞。方法是計算兩者之間的距離，再判斷這個距離是否小於兩個圓的半徑之和。

![](/images/book/21/circles_collision.png)

```lua
function checkCollision(p1, p2)
        -- 用一行就能算出距離
        -- x、y 相減後平方，再相加，然後開根號
        local distance = math.sqrt((p1.x - p2.x)^2 + (p1.y - p2.y)^2)
        -- 返回距離是否小於半徑之和
        return distance < p1.size + p2.size
end
```

現在我們遍歷所有金幣並檢測它們是否碰到玩家。讓玩家每次撿到金幣時都變大一點。

```lua
function love.update(dt)
        if love.keyboard.isDown("left") then
                player.x = player.x - 200 * dt
        elseif love.keyboard.isDown("right") then
                player.x = player.x + 200 * dt
        end

        if love.keyboard.isDown("up") then
                player.y = player.y - 200 * dt
        elseif love.keyboard.isDown("down") then
                player.y = player.y + 200 * dt
        end

        for i,v in ipairs(coins) do
                if checkCollision(player, v) then
                        table.remove(coins, i)
                        player.size = player.size + 1
                end
        end
end
```

![](/images/book/21/coin_grower.gif)

現在我們可以四處移動並拾取金幣，真棒！不過在開始保存和讀取之前，我們還想做一些調整。

如果你多重啟幾次遊戲，會發現儘管圓的位置是隨機的，它們每次都出現在相同的隨機位置。

要修復這個問題，我們可以使用 `math.randomseed()`。你生成的隨機數取決於一個數，我們稱之為「種子（seed）」。由於我們沒有改變種子，所以總能得到相同的位置。種子的好處在於它們就像隨機性的鑰匙，可以保存和分享。例如在《Minecraft》中，你可以分享生成世界時使用的種子，其他人就能得到同樣的世界。

那我們用什麼數作為種子呢？如果我們寫 `math.randomseed(123)`，遊戲仍然會得到相同的數。我們需要一個每次啟動遊戲都唯一的數字，可以使用 `os.time()`。這是 Lua 提供的函數，它會返回作業系統當前的時間（單位為秒），也就是每天 86400 個獨一無二的數字！

不過更好的做法是使用 LÖVE 的數學庫。LÖVE 的隨機數生成器（rng）會自動用 `os.time()` 作為種子，並且整體上比 Lua 自帶的 rng 更好、更隨機。

```lua
 function love.load()
        player = {
                x = 100,
                y = 100,
                size = 25,
                image = love.graphics.newImage("face.png")
        }

        coins = {}

        for i=1,25 do
                table.insert(coins,
                        {
                                x = love.math.random(50, 650),
                                y = love.math.random(50, 450),
                                size = 10,
                                image = love.graphics.newImage("dollar.png")
                        }
                )
        end
end
```

還有一件讓我在意的事情，就是我們移除金幣時使用的 for 循環。雖然現在拾取金幣沒問題，但通常來說，當你遍歷一個列表並在其中移除元素時，你應該使用更安全的寫法。因為移除一個元素後列表會變短，從而擾亂 for 循環。

比如試試下面這段代碼：

```lua
local test = {"a", "b", "c", "d", "e", "f", "g", "h", "i", "j"}
for i,v in ipairs(test) do
        table.remove(test, i)
end
print(#test)
-- 輸出：5
```

結果是 5，也就是說它只移除了列表的一半。這是因為移除元素時其他元素會向前移動，從而被跳過。

![](/images/book/21/table_remove.png)

要解決這個問題，我們應該反向遍歷表。這樣就不會在移除元素後跳過其他元素。

![](/images/book/21/table_remove_reverse.png)

這意味著我們不會再使用 `ipairs`，而是改用普通的 for 循環，不過是倒著數。

```lua
function love.update(dt)
        if love.keyboard.isDown("left") then
                player.x = player.x - 200 * dt
        elseif love.keyboard.isDown("right") then
                player.x = player.x + 200 * dt
        end

        if love.keyboard.isDown("up") then
                player.y = player.y - 200 * dt
        elseif love.keyboard.isDown("down") then
                player.y = player.y + 200 * dt
        end

        -- 從末尾開始，直到 1，每次步長為 -1
        for i=#coins,1,-1 do
                -- 使用 coins[i] 而不是 v
                if checkCollision(player, coins[i]) then
                        table.remove(coins, i)
                        player.size = player.size + 1
                end
        end
end
```

好了，現在是時候開始保存遊戲了。

___

## 保存

保存遊戲的做法是先創建一個表，然後把我們想保存的信息放進去。那我們需要保存什麼？比如玩家的位置、大小，以及那些尚未被拾取的金幣的信息。我們來寫一個 `saveGame()` 函數，把重要數據收集到表裡。

```lua
function saveGame()
        data = {}
        data.player = {
                x = player.x,
                y = player.y,
                size = player.size
        }

        data.coins = {}
        for i,v in ipairs(coins) do
                -- 在這裡 data.coins[i] = value 和 table.insert(data.coins, value) 是一樣的
                data.coins[i] = {x = v.x, y = v.y}
        end
end
```

為什麼只保存這些部分，而不是整個表呢？通常情況下你不想保存超出需求的數據。我們不需要存儲圖像的寬度和高度，因為它們始終相同。此外，玩家對象裡包含一個圖像對象，而我們無法保存 LÖVE 的對象。

既然我們已經擁有所需的信息，下一步就是*序列化*它。也就是說把這個錶轉換成我們能讀取的東西。現在如果你列印一個表，得到的可能是 `table: 0x00e4ca20` 之類的內容，這並不是我們想保存的信息。

為了序列化這個表，我們要使用 *lume* —— *rxi* 開發的一個工具庫。你可以在 [GitHub](https://github.com/rxi/lume) 找到它。

點擊 `lume.lua`，再點擊 Raw，然後[複製代碼](https://raw.githubusercontent.com/rxi/lume/master/lume.lua)。

在你的文本編輯器中新建一個 `lume.lua` 文件，把代碼粘貼進去。

在 `main.lua` 的 `love.load()` 頂部用 `lume = require "lume"` 將其載入。

Lume 提供了各種實用的函數，這個教程裡我們需要的是 `serialize` 和 `deserialize`。我們先試試它。把 data 表序列化並列印出來。

```lua
function saveGame()
        data = {}
        data.player = {
                x = player.x,
                y = player.y,
                size = player.size
        }

        data.coins = {}
        for i,v in ipairs(coins) do
                -- 在這裡 data.coins[i] = value 和 table.insert(data.coins, value) 是一樣的
                data.coins[i] = {x = v.x, y = v.y}
        end

        serialized = lume.serialize(data)
        print(serialized)
end
```

在輸出中你會看到這個表以可讀的形式被列印出來。這正是我們將要保存到文件裡的內容，下一步就是實現這一點。

我們可以通過 `love.filesystem` 模塊（[wiki](https://www.love2d.org/wiki/love.filesystem)）創建、編輯和讀取文件。要創建/寫入文件，我們使用 `love.filesystem.write(filename, data)`（[wiki](https://www.love2d.org/wiki/love.filesystem.write)）。第一個參數是文件名，第二個參數是要寫入文件的數據。

```lua
function saveGame()
        data = {}
        data.player = {
                x = player.x,
                y = player.y,
                size = player.size
        }

        data.coins = {}
        for i,v in ipairs(coins) do
                -- 在這裡 data.coins[i] = value 和 table.insert(data.coins, value) 是一樣的
                data.coins[i] = {x = v.x, y = v.y}
        end

        serialized = lume.serialize(data)
        -- 文件擴展名其實無所謂，甚至可以省略
        love.filesystem.write("savedata.txt", serialized)
end
```

現在我們要加上保存的觸發方式。按下 *F1* 時執行保存。

```lua
function love.keypressed(key)
        if key == "f1" then
                saveGame()
        end
end
```

運行遊戲，撿幾個金幣，然後按 F1。就這樣，我們完成了第一份存檔！那麼存檔在哪呢？如果你用的是 Windows，它會保存在 `AppData\\Roaming\\LOVE\\` 裡。你可以按 Win + R，輸入「appdata」並回車，隨後進入 Roaming，再進入 LOVE。那裡應該有一個和你 LÖVE 項目文件夾同名的目錄，裡面就有 `savedata.txt`。打開它就能看到我們寫進去的表。

接下來我們要讓遊戲能夠加載這些數據。

___

## 讀取

要加載數據需要以下步驟：

* 檢查存檔文件是否存在
* 讀取文件
* 把數據轉換成表
* 將數據應用到玩家和金幣上

我們先檢查文件是否存在，如果存在就讀取它。可以使用 `love.filesystem.getInfo(filename)` 和 `love.filesystem.read(filename)`。
`love.filesystem.getInfo(filename)` 如果文件存在就會返回一個包含信息的表，否則返回 `nil`。因為我們只關心文件是否存在，所以直接把這個函數放進 if 判斷裡即可，不需要表中的詳細信息。

```lua
 function love.load()

        lume = require "lume"

        player = {
                x = 100,
                y = 100,
                size = 25,
                image = love.graphics.newImage("face.png")
        }

        coins = {}

        if love.filesystem.getInfo("savedata.txt") then
                file = love.filesystem.read("savedata.txt")
                print(file)
        end

        for i=1,25 do
                table.insert(coins,
                        {
                                x = love.math.random(50, 650),
                                y = love.math.random(50, 450),
                                size = 10,
                                image = love.graphics.newImage("dollar.png")
                        }
                )
        end
end
```

運行遊戲後應該能列印出我們的存檔數據。現在要把這個字符串轉換成真正的表，可以用 `lume.deserialize`。

```lua
if love.filesystem.getInfo("savedata.txt") then
        file = love.filesystem.read("savedata.txt")
        data = lume.deserialize(file)
end
```

現在我們可以把數據應用到玩家和金幣上了。注意我們在填充金幣表之前寫這段代碼，因為我們不想再生成已經在存檔裡被拾取的金幣。現在添加金幣是根據存檔數據進行的。

```lua
 function love.load()

        lume = require "lume"

        player = {
                x = 100,
                y = 100,
                size = 25,
                image = love.graphics.newImage("face.png")
        }

        coins = {}

        if love.filesystem.getInfo("savedata.txt") then
                file = love.filesystem.read("savedata.txt")
                data = lume.deserialize(file)

                -- 應用玩家信息
                player.x = data.player.x
                player.y = data.player.y
                player.size = data.player.size

                for i,v in ipairs(data.coins) do
                        coins[i] = {
                                x = v.x,
                                y = v.y,
                                size = 10,
                                image = love.graphics.newImage("dollar.png")
                        }
                end
        else
                -- 只有在沒有存檔時才執行
                for i=1,25 do
                        table.insert(coins,
                                {
                                        x = love.math.random(50, 650),
                                        y = love.math.random(50, 450),
                                        size = 10,
                                        image = love.graphics.newImage("dollar.png")
                                }
                        )
                end
        end
end
```

現在運行遊戲你就會發現它會加載你的存檔。你可以再拾取一些金幣，按 F1 保存，重啟遊戲後會再次看到保存和讀取生效。太棒了！不過如果我們想重新開始呢？我們加一個按鈕來刪除存檔文件，這樣就能重新玩一局。

___

## 重置

要刪除存檔文件可以調用 `love.filesystem.remove(filename)`。我們讓 *F2* 鍵刪除文件並重啟遊戲。可以使用 `love.event.quit()` 退出遊戲，但如果把 `"restart"` 作為第一個參數傳入，遊戲就會改為重啟。

```lua
function love.keypressed(key)
        if key == "f1" then
                saveGame()
        elseif key == "f2" then
        love.filesystem.remove("savedata.txt")
                love.event.quit("restart")
        end
end
```

好了，我們現在也能重置遊戲了！

___

## 總結

*種子*決定了你生成哪些隨機值，這可以用來分享隨機生成的關卡等內容。我們同樣可以使用 LÖVE 的數學模塊。當我們在遍歷列表時要移除元素，應當倒序遍歷以防遺漏。我們可以把重要數據存入表、將錶轉成字符串，再用 `love.filesystem.write(filename)` 寫入文件以創建存檔。讀取存檔時，用 `love.filesystem.read(filename)` 讀取文件、反序列化數據並把它應用到我們的對象上。可以使用 `love.filesystem.remove(filename)` 刪除文件，並通過 `love.event.quit("restart")` 重啟遊戲。
