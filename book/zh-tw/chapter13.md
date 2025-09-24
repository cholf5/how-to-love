假設我們在製作一款可以向怪物射擊的遊戲。怪物被子彈擊中時應該死亡。那麼我們需要檢查的是：怪物是否與子彈發生了碰撞？

我們將編寫一個 *碰撞檢測* 函數，用來判斷兩個矩形是否相交。這類檢測叫作 AABB（Axis-Aligned Bounding Box，軸對齊包圍盒）碰撞。那麼問題來了：在什麼情況下兩個矩形會發生碰撞呢？

我準備了一張包含三個例子的圖片：

![](/images/book/13/rectangles1.png)

是時候開啟你的程式設計師大腦了。如果你還沒這麼做的話。第三個例子中發生了什麼，而前兩個例子中沒有發生？

「它們發生了碰撞。」

沒錯，但還得更具體些。我們需要能夠讓計算機理解的信息。

看看兩個矩形的位置。在第一個例子中，紅色矩形沒有與藍色矩形碰撞，因為紅色矩形太靠左了。如果紅色矩形向右移動一點，它們就會接觸。究竟要移動多遠呢？只要 **紅色矩形的右邊** 比 **藍色矩形的左邊** 更靠 **右** 就行了。這個條件在例子 3 中成立。

不過在例子 2 中同樣成立。要確保真正發生碰撞，我們還需要更多條件。例子 2 告訴我們不能移動得太靠右。那麼需要向左移動多遠？當 **紅色矩形的左邊** 比 **藍色矩形的右邊** 更靠 **左** 時，它們就會相交。

現在我們已經有兩個條件了，這就足夠了嗎？

並沒有。看看下面這張圖：

![](/images/book/13/rectangles2.png)

這個場景滿足我們目前的條件：紅色矩形的右邊比藍色矩形的左邊靠右，紅色矩形的左邊也比藍色矩形的右邊靠左。然而它們並沒有碰撞，因為紅色矩形太靠上了，它還需要繼續向下移動。要移動到什麼位置呢？直到 **紅色矩形的下邊** 比 **藍色矩形的上邊** 更靠 **下**。

但如果移動得太靠下，又不會碰撞了。紅色矩形最多能向下移動多遠，同時仍與藍色矩形相交？只要 **紅色矩形的上邊** 比 **藍色矩形的下邊** 更靠 **上** 就可以。

現在我們已經得到了四個條件。這四個條件在下圖的三個例子中都為真嗎？

![](/images/book/13/rectangles3.png)

**紅色矩形的右邊** 比 **藍色矩形的左邊** 更靠 **右**。

**紅色矩形的左邊** 比 **藍色矩形的右邊** 更靠 **左**。

**紅色矩形的下邊** 比 **藍色矩形的上邊** 更靠 **下**。

**紅色矩形的上邊** 比 **藍色矩形的下邊** 更靠 **上**。

是的，全都滿足！接下來我們要把這些信息寫成函數。

先創建兩個矩形：

```lua
function love.load()
    -- 創建兩個矩形
    r1 = {
        x = 10,
        y = 100,
        width = 100,
        height = 100
    }

    r2 = {
        x = 250,
        y = 120,
        width = 150,
        height = 120
    }
end


function love.update(dt)
    -- 讓其中一個矩形移動
    r1.x = r1.x + 100 * dt
end


function love.draw()
    love.graphics.rectangle("line", r1.x, r1.y, r1.width, r1.height)
    love.graphics.rectangle("line", r2.x, r2.y, r2.width, r2.height)
end
```

現在我們創建一個名為 `checkCollision()` 的新函數，並讓它接收兩個矩形作為參數。

```lua
function checkCollision(a, b)

end
```

首先我們需要得到矩形的四條邊。左邊就是 x 坐標，右邊是 x 加上寬度。y 和高度同理。

```lua
function checkCollision(a, b)
    -- 在局部變量中，常見的寫法是使用下劃線而非駝峰命名
    local a_left = a.x
    local a_right = a.x + a.width
    local a_top = a.y
    local a_bottom = a.y + a.height

    local b_left = b.x
    local b_right = b.x + b.width
    local b_top = b.y
    local b_bottom = b.y + b.height
end
```

得到了兩個矩形的四條邊之後，就可以把這些條件寫進 if 語句中。

```lua
function checkCollision(a, b)
    -- 在局部變量中，常見的寫法是使用下劃線而非駝峰命名
    local a_left = a.x
    local a_right = a.x + a.width
    local a_top = a.y
    local a_bottom = a.y + a.height

    local b_left = b.x
    local b_right = b.x + b.width
    local b_top = b.y
    local b_bottom = b.y + b.height

    -- 如果紅色矩形的右邊比藍色矩形的左邊更靠右
    if  a_right > b_left
    -- 並且紅色矩形的左邊比藍色矩形的右邊更靠左
    and a_left < b_right
    -- 並且紅色矩形的下邊比藍色矩形的上邊更靠下
    and a_bottom > b_top
    -- 並且紅色矩形的上邊比藍色矩形的下邊更靠上，那麼……
    and a_top < b_bottom then
        -- 它們發生了碰撞！
        return true
    else
        -- 只要上述條件有任意一個不成立，就返回 false
        return false
    end
end
```

注意 if 條件本身就是一個布爾值。`checkCollision` 會在條件為 `true` 時返回 `true`，反之亦然。因此我們可以把 `checkCollision` 簡化成下面的形式：

```lua
function checkCollision(a, b)
    -- 在局部變量中，常見的寫法是使用下劃線而非駝峰命名
    local a_left = a.x
    local a_right = a.x + a.width
    local a_top = a.y
    local a_bottom = a.y + a.height

    local b_left = b.x
    local b_right = b.x + b.width
    local b_top = b.y
    local b_bottom = b.y + b.height

    -- 直接返回這個布爾表達式，而無需 if 語句
    return  a_right > b_left
        and a_left < b_right
        and a_bottom > b_top
        and a_top < b_bottom
end
```

好了，函數寫完了。現在來試一下吧！我們根據是否發生碰撞決定繪製填充矩形還是線框矩形。

```lua
function love.draw()
    -- 創建一個名為 mode 的局部變量
    local mode
    if checkCollision(r1, r2) then
        -- 如果發生碰撞，就填充繪製矩形
        mode = "fill"
    else
        -- 否則繪製線框
        mode = "line"
    end

    -- 將該變量作為第一個參數傳入
    love.graphics.rectangle(mode, r1.x, r1.y, r1.width, r1.height)
    love.graphics.rectangle(mode, r2.x, r2.y, r2.width, r2.height)
end
```

成功了！現在你已經知道如何檢測兩個矩形之間的碰撞了。

___

## 總結

兩個矩形之間的碰撞可以通過四個條件來判斷。

設 A 和 B 為兩個矩形：

A 的右邊在 B 的左邊右側。

A 的左邊在 B 的右邊左側。

A 的下邊在 B 的上邊下方。

A 的上邊在 B 的下邊上方。
