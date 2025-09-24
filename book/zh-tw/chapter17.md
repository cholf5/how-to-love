# 第 17 章 - 動畫

## 幀序列

讓我們來製作一張動畫圖像。

首先，你需要一些圖片：

![](/images/book/17/jump1.png)、![](/images/book/17/jump2.png)、![](/images/book/17/jump3.png)、![](/images/book/17/jump4.png) 和 ![](/images/book/17/jump5.png)

你也可以在[這裡](https://drive.google.com/file/d/1bMVMUv-B0XF9nBJfw_7ek781cmUjrdgn/view?usp=sharing)下載它們的壓縮包。

加載這些圖片並把它們放進一個表中。

```lua
function love.load()
        frames = {}

        table.insert(frames, love.graphics.newImage("jump1.png"))
        table.insert(frames, love.graphics.newImage("jump2.png"))
        table.insert(frames, love.graphics.newImage("jump3.png"))
        table.insert(frames, love.graphics.newImage("jump4.png"))
        table.insert(frames, love.graphics.newImage("jump5.png"))
end
```

等等，我們可以更高效地完成這件事。

```lua
function love.load()
        frames = {}

        for i=1,5 do
                table.insert(frames, love.graphics.newImage("jump" .. i .. ".png"))
        end
end
```

好多了！現在我們需要創建一個動畫。要怎麼做呢？

*用 for 循環？*

不行。for 循環會讓我們在同一時間繪製所有幀，而我們想要的是每秒繪製不同的幀。我們需要一個每秒增加 1 的變量。這個很簡單！

```lua
function love.load()
        frames = {}

        for i=1,5 do
                table.insert(frames, love.graphics.newImage("jump" .. i .. ".png"))
        end

        -- 我用一個長一點的名字，免得和名為 frames 的變量混淆
        currentFrame = 1
end


function love.update(dt)
        currentFrame = currentFrame + dt
end
```

現在我們有了每秒增加 1 的變量 `currentFrame`，讓我們用它來繪製幀。

```lua
function love.draw()
        love.graphics.draw(frames[currentFrame])
end
```

如果你運行遊戲，會得到一個錯誤：*bad argument #1 to 'draw' (Drawable expected, got nil)*

這是因為我們的變量 `currentFrame` 帶有小數。第一次更新之後，`currentFrame` 會變成類似 1.016 的值，而表裡在位置 1 和 2 有元素，卻沒有位置 1.016 的元素。

為了解決這個問題，我們用 `math.floor` 將數字向下取整。這樣 1.016 就會變成 1。

```lua
function love.draw()
        love.graphics.draw(frames[math.floor(currentFrame)])
end
```

運行遊戲你會看到動畫正常播放，但最終仍然會出現錯誤。這是因為 currentFrame 變得大於（或等於）6，而我們只有 5 幀。為了解決這個問題，我們在它大於（或等於）6 時重置 `currentFrame`。趁這個機會，讓我們順便把動畫加速一點。

```lua
function love.update(dt)
        currentFrame = currentFrame + 10 * dt
        if currentFrame >= 6 then
                currentFrame = 1
        end
end
```

看他跳得多歡！

![](/images/book/17/jump.gif)

___

## Quad

這種方式能用，但效率不高。對於大型動畫，我們會需要很多圖片。如果把所有幀放進一張圖裡，再只繪製其中的一部分呢？我們可以用 quad 來做到這一點。

首先，下載這張圖片：

![](/images/book/17/jump.png)

我們將重寫函數 `love.load`（可以保持 `love.update` 和 `love.draw` 不變）。

```lua
function love.load()
        image = love.graphics.newImage("jump.png")
end
```

把 quad 想像成我們從圖片上剪下來的一塊矩形。我們告訴遊戲「我們想要圖片裡的這部分」。我們將製作第一幀的 quad。可以使用 `love.graphics.newQuad` [(wiki)](https://love2d.org/wiki/love.graphics.newQuad)。

前兩個參數是 quad 的 x 和 y 位置。因為我們想要第一幀，所以取圖片的左上角，也就是 0,0。

```lua
function love.load()
        image = love.graphics.newImage("jump.png")
        frames = {}
        table.insert(frames, love.graphics.newQuad(0, 0))
end
```

再強調一次，quad 就像在紙上剪出一塊。我們最終把圖片繪製在哪裡與 quad 無關。

![](/images/book/17/quad_position.png)

接下來的兩個參數是 quad 的寬和高。圖片中每幀的寬度是 117，高度是 233。最後兩個參數是整張圖片的寬和高。我們可以通過 `image:getWidth()` 和 `image:getHeight()` 獲取。

```lua
function love.load()
        image = love.graphics.newImage("jump.png")
        frames = {}
        local frame_width = 117
        local frame_height = 233
        table.insert(frames, love.graphics.newQuad(0, 0, frame_width, frame_height, image:getWidth(), image:getHeight()))

        currentFrame = 1
end
```

現在讓我們通過繪製來測試這個 quad。繪製 quad 時，需要把它作為 `love.graphics.draw` 的第二個參數傳入。

```lua
function love.draw()
        love.graphics.draw(image, frames[1], 100, 100)
end
```

可以看到，它繪製出了第一幀。很好，現在讓我們創建第二個 quad。

要繪製第二幀，我們只需要把矩形向右移動。由於每幀的寬度是 117，所以只需要把 x 向右移動 117。

```lua
function love.load()
        image = love.graphics.newImage("jump.png")
        frames = {}
        local frame_width = 117
        local frame_height = 233
        table.insert(frames, love.graphics.newQuad(0, 0, frame_width, frame_height, image:getWidth(), image:getHeight()))
        table.insert(frames, love.graphics.newQuad(frame_width, 0, frame_width, frame_height, image:getWidth(), image:getHeight()))
end
```

第三個 quad 也可以同樣處理。

![](/images/book/17/jump_help.png)

等等，我們是不是在重複同樣的操作？我們不是有專門處理重複的工具嗎？for 循環！另外，我們還能把 :getWidth 和 :getHeight 的調用結果存到變量裡，避免多次調用。

```lua
function love.load()
        image = love.graphics.newImage("jump.png")
        local width = image:getWidth()
        local height = image:getHeight()

        frames = {}

        local frame_width = 117
        local frame_height = 233

        for i=0,4 do
                table.insert(frames, love.graphics.newQuad(i * frame_width, 0, frame_width, frame_height, width, height))
        end

        currentFrame = 1
end
```

注意我們這次的 for 循環從 0 開始到 4 結束，而不是從 1 到 5。這是因為我們的第一個 quad 位於位置 0，而 0 * 177 等於 0。

現在剩下要做的就是使用 currentFrame 來決定要繪製的 quad。

```lua
function love.draw()
        love.graphics.draw(image, frames[math.floor(currentFrame)], 100, 100)
end
```

___

## 多行幀

現在我們可以把一行幀做成動畫了，但如果有多行怎麼辦？

![](/images/book/17/jump_2.png)

很簡單，我們只需要用不同的 y 值重複同樣的事情。

```lua
function love.load()
        image = love.graphics.newImage("jump_2.png")
        local width = image:getWidth()
        local height = image:getHeight()

        frames = {}

        local frame_width = 117
        local frame_height = 233

        for i=0,2 do
                table.insert(frames, love.graphics.newQuad(i * frame_width, 0, frame_width, frame_height, width, height))
        end

        for i=0,1 do
                table.insert(frames, love.graphics.newQuad(i * frame_width, frame_height, frame_width, frame_height, width, height))
        end

        currentFrame = 1
end
```

但是等等，我們又看到了重複！碰到重複我們該怎麼辦？用 for 循環。

*所以，比如說，在 for 循環裡面再套一個 for 循環？*

沒錯！不過我們得做一些調整。

```lua
function love.load()
        image = love.graphics.newImage("jump_2.png")
        local width = image:getWidth()
        local height = image:getHeight()

        frames = {}

        local frame_width = 117
        local frame_height = 233

        for i=0,1 do
                -- 我把內層 for 循環裡的 i 改成了 j
                for j=0,2 do
                        -- 所以這裡也要改成 j
                        table.insert(frames, love.graphics.newQuad(j * frame_width, i * frame_height, frame_width, frame_height, width, height))
                end
        end

        currentFrame = 1
end
```

在外層 for 循環的第一次迭代中，i 等於 0，而 j 依次等於 0、1、2。
在第二次迭代中，i 等於 1，而 j 又依次等於 0、1、2。

你可能會注意到我們多了一個空的 quad。雖然我們只繪製前 5 個 quad，這不是什麼大問題，但我們可以像這樣避免它：

```lua
maxFrames = 5
for i=0,1 do
        for j=0,2 do
                table.insert(frames, love.graphics.newQuad(j * frame_width, i * frame_height, frame_width, frame_height, width, height))
                if #frames == maxFrames then
                        break
                end
        end
        print("I don't break!")
end
```

使用 `break` 可以結束一個 for 循環。這樣就能防止添加最後那個 quad。

注意 *"I don't break"* 仍然會被列印出來。這是因為 `break` 只會跳出使用它的那一層循環，外層循環仍然會繼續。我們可以在外層循環裡加上相同的 if 語句來解決，但在這裡沒必要，因為那時外層循環已經處於最後一次迭代了。

___

## 邊緣溢出

當我們在使用 quad 時旋轉和/或縮放圖片，可能會出現一種叫作 *邊緣溢出（bleeding）* 的現象。問題在於 quad 外部的部分也被繪製了出來。

假設我們的精靈圖是這樣的：

![](/images/book/17/rectangles1.png)

第一幀可能就會變成這樣：

![](/images/book/17/bleeding.png)

造成這種現象的原因比較技術性，但事實就是它會發生。幸運的是，我們可以通過在幀的周圍增加 1 像素的邊框來解決這個問題。邊框可以使用和實際邊框相同的顏色，也可以使用透明像素。

![](/images/book/17/bleeding_fix.png)

然後我們在 quad 中不包含那圈邊框。

我給我們的跳躍角色加了一圈邊框。我把它做成紫色而不是透明，這樣如果不小心繪製到了邊框就能看得出來。

![](/images/book/17/jump_3.png)

讓我們一步一步完成這件事。

首先，我們不想繪製第一列像素，所以我們的 quad 從 1 開始（而不是 0）。

```lua
newQuad(1, 1, frame_width, frame_height, width, height)
```

好吧，這對第一幀有效，但下一幀我們該繪製哪部分呢？簡單地加上幀寬/幀高嗎？

```lua
newQuad(1 + j * frame_width, 1 + i * frame_height, frame_width, frame_height, width, height)
```

差不多。我們還少了點什麼。

![](/images/book/17/almost.png)

藍色的線條是我們的 quad。可以看到，quad 比應該的位置向左偏了 2 個像素。所以讓我們在每次迭代時額外加上 2。

```lua
newQuad(1 + j * (frame_width + 2), 1 + i * (frame_height + 2), frame_width, frame_height, width, height)
```

現在我們的 quad 就在正確的位置了。下面這張圖展示了我們是如何定位 quad 的：我們先加 1，然後加上 `frame_width` + 2，並乘以 `i`。這樣就能為每一幀準確地定位 quad。

![](/images/book/17/whatisgoingon.png)

___

## 總結

通過 quad 我們可以繪製圖像的一部分，用它來把精靈圖轉換成動畫。如果有多行幀，我們可以使用嵌套的 for 循環來遍歷整個圖集。我們可以使用 `break` 來結束一個循環。為了避免 *邊緣溢出*，可以在精靈圖上為每幀添加 1 像素的邊框。
