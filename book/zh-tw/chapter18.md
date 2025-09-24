___

*務必閱讀代碼中的注釋，我在裡面寫了很多重要信息。*

___

在許多 2D 遊戲裡，關卡都是由瓦片構成的。我們要自己製作一個瓦片化的關卡。

先從創建一行開始。新建一個表，並用 1 和 0 填充它。

```lua
function love.load()
    tilemap = {1, 0, 0, 1, 1, 0, 1, 1, 1, 0}
end
```

這就是我們的關卡。`1` 表示有瓦片，`0` 表示為空。現在需要把它畫出來。我們遍歷整個表，每當遇到 1，就在對應位置畫出一個矩形。

```lua
function love.draw()
    -- 再次回顧 ipairs
    -- ipairs 是一種特殊函數，可以用來遍歷表
    -- 每次循環 i 會變成循環的當前下標，所以依次為 1、2、3、4……
    -- 每次循環 v 會變成下標 i 對應的值，在這裡就是 1、0、0、1、1、0 等等
    for i,v in ipairs(tilemap) do
        if v == 1 then
            love.graphics.rectangle("line", i * 25, 100, 25, 25)
        end
    end
end
```

![](/images/book/18/one_row.png)

好，這樣沒問題。但我們還想讓它縱向延伸。方法是把表放進表中，也就是所謂的二維表。

```lua
function love.load()
    tilemap = {
        {1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
        {1, 0, 0, 0, 0, 0, 0, 0, 0, 1},
        {1, 0, 0, 1, 1, 1, 1, 0, 0, 1},
        {1, 0, 0, 0, 0, 0, 0, 0, 0, 1},
        {1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
    }
end
```

現在我們有一個由多個表組成的表。可以把它看成一張 Excel 表格。

![](/images/book/18/table.png)

1、2、3 等是我們所說的*行*，A、B、C 等被稱為*列*。

也可以把它想像成一個小鎮。

![](/images/book/18/houses.png)

每一排房子都是一個表，多排房子組成整個小鎮，也就是我們的關卡。

綠色的房子位於第 2 行第 5 列。

紅色的房子位於第 3 行第 2 列。

訪問二維表的值如下所示：

`tilemap[4][3]`

這意味著：第 4 個表裡的第 3 個值。或者說：第 4 行第 3 列。

![](/images/book/18/2d_table.gif)

讓我們把關卡畫出來。由於使用的是二維表，需要在 for 循環裡再嵌套一個 for 循環。這也叫作*嵌套 for 循環*。

```lua
function love.draw()
    -- 先不用 ipairs

    -- i 從 1 循環到 tilemap 中的值數量
    for i=1,#tilemap do
        -- j 從 1 循環到該行中的值數量
        for j=1,#tilemap[i] do
            -- 如果第 i 行第 j 列的值等於 1
            if tilemap[i][j] == 1 then
                -- 畫出矩形
                -- 使用 i 和 j 來定位矩形
                -- j 控制 x，i 控制 y
                love.graphics.rectangle("line", j * 25, i * 25, 25, 25)
            end
        end
    end
end
```

我們遍歷每一行，並對每一行遍歷其中的每一列。

在內部循環中使用 `j` 來進行橫向定位，在外部循環中使用 `i` 來進行縱向定位。記住，這些只是變量名，可以隨意命名，但像這樣使用 i 和 j 很常見。

現在把 for 循環改成 ipairs 循環。

```lua
function love.draw()
    for i,row in ipairs(tilemap) do
        for j,tile in ipairs(row) do
            if tile == 1 then
                love.graphics.rectangle("line", j * 25, i * 25, 25, 25)
            end
        end
    end
end
```

我們使用變量名 `row` 和 `tile` 來讓流程更清晰。我們遍歷表 `tilemap`，每一個值都是一行（row）。遍歷這一行時，每一個值就是一個瓦片（tile）。

我們還可以為瓦片使用不同的數字，並根據這些數字給瓦片不同的顏色。

```lua
function love.load()
    tilemap = {
        {1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
        {1, 2, 2, 2, 2, 2, 2, 2, 2, 1},
        {1, 2, 3, 4, 5, 5, 4, 3, 2, 1},
        {1, 2, 2, 2, 2, 2, 2, 2, 2, 1},
        {1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
    }
end

function love.draw()
    for i,row in ipairs(tilemap) do
        for j,tile in ipairs(row) do
            -- 先檢查瓦片是否為 0
            if tile ~= 0 then

                -- 根據瓦片編號設置顏色
                if tile == 1 then
                    -- setColor 使用 RGB，A 可選
                    -- 紅、綠、藍、透明度
                    love.graphics.setColor(1, 1, 1)
                elseif tile == 2 then
                    love.graphics.setColor(1, 0, 0)
                elseif tile == 3 then
                    love.graphics.setColor(1, 0, 1)
                elseif tile == 4 then
                    love.graphics.setColor(0, 0, 1)
                elseif tile == 5 then
                    love.graphics.setColor(0, 1, 1)
                end

                -- 繪製瓦片
                love.graphics.rectangle("fill", j * 25, i * 25, 25, 25)
            end
        end
    end
end
```

或者用一種更好的方式：

```lua
function love.load()
    tilemap = {
        {1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
        {1, 2, 2, 2, 2, 2, 2, 2, 2, 1},
        {1, 2, 3, 4, 5, 5, 4, 3, 2, 1},
        {1, 2, 2, 2, 2, 2, 2, 2, 2, 1},
        {1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
    }

    -- 創建名為 colors 的表
    colors = {
        -- 用裝滿 RGB 數值的表填充它
        {1, 1, 1},
        {1, 0, 0},
        {1, 0, 1},
        {0, 0, 1},
        {0, 1, 1}
    }
end

function love.draw()
    for i,row in ipairs(tilemap) do
        for j,tile in ipairs(row) do
            -- 先檢查瓦片是否為 0
            if tile ~= 0 then
                -- 設置顏色。.setColor() 也接受包含 3 個數字的表。
                -- 我們傳入下標為 tile 值的表。
                -- 所以如果 tile 等於 3，就傳入 colors[3]，即 {1, 0, 1}
                love.graphics.setColor(colors[tile])
                -- 繪製瓦片
                love.graphics.rectangle("fill", j * 25, i * 25, 25, 25)
            end
        end
    end
end
```

![](/images/book/18/colors.png)

## 圖像

我們已經能做出彩色的關卡了，但現在想要使用圖像。很簡單，只需添加一張圖像，獲取它的寬度與高度，然後在繪製時用圖像替換矩形即可。

我會使用這張圖片：

![](/images/book/18/tile.png)

```lua
function love.load()
    -- 載入圖像
    image = love.graphics.newImage("tile.png")

    -- 獲取寬度與高度
    width = image:getWidth()
    height = image:getHeight()

    tilemap = {
        {1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
        {1, 2, 2, 2, 2, 2, 2, 2, 2, 1},
        {1, 2, 3, 4, 5, 5, 4, 3, 2, 1},
        {1, 2, 2, 2, 2, 2, 2, 2, 2, 1},
        {1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
    }

    colors = {
        -- 用裝滿 RGB 數值的表填充它
        {1, 1, 1},
        {1, 0, 0},
        {1, 0, 1},
        {0, 0, 1},
        {0, 1, 1}
    }
end

function love.draw()
    for i,row in ipairs(tilemap) do
        for j,tile in ipairs(row) do
            if tile ~= 0 then
                love.graphics.setColor(colors[tile])
                -- 繪製圖像
                love.graphics.draw(image, j * width, i * height)
            end
        end
    end
end
```

![](/images/book/18/colors_image.png)

這很容易。但如果我們想繪製不同的圖像怎麼辦？我們當然可以使用多張圖片，不過上一章我們學習了如何使用 quad 繪製圖像的一部分。同樣可以把它用在瓦片上。

讓我們使用這張瓦片集：

![](/images/book/18/tileset.png)

首先需要創建這些 quad。

```lua
function love.load()

    -- 載入圖像
    image = love.graphics.newImage("tileset.png")

    -- 創建 quad 時需要整張圖像的寬度與高度
    local image_width = image:getWidth()
    local image_height = image:getHeight()

    -- 每個瓦片的寬和高都是 32, 32
    -- 因此我們可以這樣寫：
    width = 32
    height = 32
    -- 但假設我們不知道瓦片的寬高
    -- 也可以利用瓦片集中的行數與列數
    -- 我們的瓦片集有 2 行 3 列
    -- 但我們需要減去 2，以抵消為防止滲色而預留的空像素
    width = (image_width / 3) - 2
    height = (image_height / 2) - 2

    -- 創建 quad
    quads = {}

    for i=0,1 do
        for j=0,2 do
            -- 之所以把代碼拆成多行
            -- 只是為了能放進頁面裡
            table.insert(quads,
                love.graphics.newQuad(
                    1 + j * (width + 2),
                    1 + i * (height + 2),
                    width, height,
                    image_width, image_height))
        end
    end

    tilemap = {
        {1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
        {1, 2, 2, 2, 2, 2, 2, 2, 2, 1},
        {1, 2, 3, 4, 5, 5, 4, 3, 2, 1},
        {1, 2, 2, 2, 2, 2, 2, 2, 2, 1},
        {1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
    }

end
```

現在我們有了一個裝著 quad 的表，接下來只需在 tilemap 中放入與目標 quad 對應的數字。根據我們創建 quad 的順序，它們在表中的位置如下所示：

![](/images/book/18/numbered.png)

如果我們想製作這樣的場景：

![](/images/book/18/level.png)

就要把 tilemap 改成這樣：

```lua
tilemap = {
    {1, 6, 6, 2, 1, 6, 6, 2},
    {3, 0, 0, 4, 5, 0, 0, 3},
    {3, 0, 0, 0, 0, 0, 0, 3},
    {4, 2, 0, 0, 0, 0, 1, 5},
    {1, 5, 0, 0, 0, 0, 4, 2},
    {3, 0, 0, 0, 0, 0, 0, 3},
    {3, 0, 0, 1, 2, 0, 0, 3},
    {4, 6, 6, 5, 4, 6, 6, 5}
}
```

把 tilemap 與圖片以及編號對照起來，就能看出每個瓦片是如何使用的。

接下來要繪製正確的 quad。

```lua
function love.draw()
    for i,row in ipairs(tilemap) do
        for j,tile in ipairs(row) do
            if tile ~= 0 then
                -- 使用正確的 quad 繪製圖像
                love.graphics.draw(image, quads[tile], j * width, i * height)
            end
        end
    end
end
```

因此在 (1,1) 上繪製的是位置 1 的 quad，在 (1,2) 上繪製的是位置 6 的 quad，等等。

運行遊戲後，你會發現關卡現在看起來就像上面的圖片。

## 玩家

既然有了關卡，就來創建一個可以四處走動、且不會穿牆的玩家吧。

玩家我會用這張圖片：

![](/images/book/18/player.png)

```lua
function love.load()
    image = love.graphics.newImage("tileset.png")

    local image_width = image:getWidth()
    local image_height = image:getHeight()
    width = (image_width / 3) - 2
    height = (image_height / 2) - 2

    quads = {}

    for i=0,1 do
        for j=0,2 do
            table.insert(quads,
                love.graphics.newQuad(
                    1 + j * (width + 2),
                    1 + i * (height + 2),
                    width, height,
                    image_width, image_height))
        end
    end

    tilemap = {
        {1, 6, 6, 2, 1, 6, 6, 2},
        {3, 0, 0, 4, 5, 0, 0, 3},
        {3, 0, 0, 0, 0, 0, 0, 3},
        {4, 2, 0, 0, 0, 0, 1, 5},
        {1, 5, 0, 0, 0, 0, 4, 2},
        {3, 0, 0, 0, 0, 0, 0, 3},
        {3, 0, 0, 1, 2, 0, 0, 3},
        {4, 6, 6, 5, 4, 6, 6, 5}
    }

    -- 創建我們的玩家
    player = {
        image = love.graphics.newImage("player.png"),
        tile_x = 2,
        tile_y = 2
    }
end
```

`tile_x` 和 `tile_y` 表示玩家在 tilemap 上的位置。繪製時會將這些數值與瓦片寬高相乘。不過先讓它動起來。我們不會做平滑移動，而是讓它直接跳到下一個位置，因此移動不需要 `dt`。這也意味著我們關心的不是按鍵是否*按住*，而是是否*被按下*。為此我們使用 `love.keypressed` 事件。

首先創建局部變量 x 和 y。然後根據按下的鍵對變量加 1 或減 1，最後把結果賦值給玩家的位置。

```lua
function love.keypressed(key)
    local x = player.tile_x
    local y = player.tile_y

    if key == "left" then
        x = x - 1
    elseif key == "right" then
        x = x + 1
    elseif key == "up" then
        y = y - 1
    elseif key == "down" then
        y = y + 1
    end

    player.tile_x = x
    player.tile_y = y
end
```

既然它可以移動了，就把它畫出來。

```lua
function love.draw()
    for i,row in ipairs(tilemap) do
        for j,tile in ipairs(row) do
            if tile ~= 0 then
                -- 使用正確的 quad 繪製圖像
                love.graphics.draw(image, quads[tile], j * width, i * height)
            end
        end
    end

    -- 繪製玩家，並將瓦片坐標乘以瓦片寬高
    love.graphics.draw(player.image, player.tile_x * width, player.tile_y * height)
end
```

![](/images/book/18/tile-move-1.gif)

運行遊戲後，你應該能操縱玩家四處移動。但問題在於他能穿牆而過。我們通過檢查他想去的位置是否是牆來修復這個問題。

首先創建一個名為 `isEmpty` 的函數。在函數內部返回該坐標對應的值是否等於 0。

```lua
function isEmpty(x, y)
    return tilemap[y][x] == 0
end
```

x 和 y 看起來像是反過來了，但這是正確的。因為 y 對應的是行，而 x 對應的是列。

有了這個函數之後，我們就能檢查想要前往的位置是否為空地，如果是，就說明可以行走。

```lua
function love.keypressed(key)
    local x = player.tile_x
    local y = player.tile_y

    if key == "left" then
        x = x - 1
    elseif key == "right" then
        x = x + 1
    elseif key == "up" then
        y = y - 1
    elseif key == "down" then
        y = y + 1
    end

    if isEmpty(x, y) then
        player.tile_x = x
        player.tile_y = y
    end
end
```

![](/images/book/18/tile-move-2.gif)

太好了，現在我們的玩家被困在牆內了。試著讓他可以撿東西，或者在碰到鑰匙時打開門。多多嘗試，你就能學到更多。

___

## 總結

我們可以使用瓦片來製作關卡。瓦片地圖由行和列構成，每一行包含若干列。行垂直排列，列水平排列。我們可以使用瓦片集和 quad 來繪製關卡。
