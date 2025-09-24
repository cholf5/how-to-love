## 角度

讓我們創建一個會朝滑鼠光標方向移動的圓。

先從創建一個圓開始。

```lua
function love.load()
    -- 創建一個名為 circle 的對象
    circle = {}

    -- 為它設置 x、y、radius 和 speed 屬性
    circle.x = 100
    circle.y = 100
    circle.radius = 25
    circle.speed = 200
end


function love.draw()
    -- 繪製圓
    love.graphics.circle("line", circle.x, circle.y, circle.radius)
end
```

為了讓圓朝著光標移動，我們需要知道角度。我們可以通過 `math.atan2` 函數獲取角度。第一個參數是目標的 y 坐標減去對象的 y 坐標，第二個參數同理，不過用於 x 坐標。這是少數幾個 y 在前、x 在後的情況之一。

基本上，atan2 所做的就是接受一個豎直向量和一個水平向量（距離 + 方向），並利用這些信息返回一個角度。

![](/images/book/16/atan2.png)

要得到所需的速度，我們把圓的位置從目標位置中減去。

```lua
function love.update(dt)
    -- love.mouse.getPosition 返回光標的 x 和 y 位置。
    mouse_x, mouse_y = love.mouse.getPosition()

    angle = math.atan2(mouse_y - circle.y, mouse_x - circle.x)
end


function love.draw()
    love.graphics.circle("line", circle.x, circle.y, circle.radius)

    -- 輸出角度
    love.graphics.print("angle: " .. angle, 10, 10)

    -- 這些線用來可視化水平和垂直方向的速度
    love.graphics.line(circle.x, circle.y, mouse_x, circle.y)
    love.graphics.line(circle.x, circle.y, circle.x, mouse_y)

    -- 角度線
    love.graphics.line(circle.x, circle.y, mouse_x, mouse_y)
end
```

![](/images/book/16/angle.gif)

如果 atan2 讓你摸不著頭腦，也不用擔心。你只需要記住：`math.atan2(target_y - object_y, target_x - object_x)` 會給出角度。在我們的例子裡，對象是圓，目標是光標。

接下來會出現一些數學內容，但別被嚇到。這並不難，就算不太理解，在入門階段也完全沒關係。

運行遊戲時你可能會注意到角度不會高於 3.14（圓周率 π）。這是因為 atan2 返回的不是角度制，而是弧度制。

下面這個 gif 演示了什麼是弧度。

![](/images/book/16/radian.gif)

如果你仍然感到困惑，推薦觀看 [可汗學院的這段視頻](https://www.youtube.com/watch?v=EnwWxMZVBeg) 來了解弧度。

一些要點：

* `math.atan2` 返回的角度單位是弧度。
* 返回的角度範圍在 -3.14 到 3.14 之間。
* 360 度等於 π*2 弧度。因此 90 度等於 π/2 弧度。


數字 π（圓周率）是圓的周長與直徑的比值。也就是說，如果我們取一個圓的直徑並用它除以圓的周長，就會得到 π。

![](/images/book/16/pi.gif)

在 Lua 中我們可以通過 `math.pi` 獲取 π。

暫時不理解也沒關係。第一次沒搞懂不要氣餒。

___

## 正弦與餘弦

現在我們需要讓圓朝著滑鼠移動。為此我們會使用 `math.cos` 和 `math.sin`。

這兩個函數會根據我們傳入的角度返回 -1 到 1 之間的值。

這裡有一個 gif 可以幫助你想像正弦和餘弦。

![](/images/book/16/sinecosine.gif)

下面這張圖則展示了 gif 中究竟發生了什麼。

![](/images/book/16/sinecosine2.png)

正弦和餘弦是根據角度返回 -1 到 1 之間的值。

如果角度指向左側，那麼餘弦會是 -1，而正弦會是 0。

![](/images/book/16/sinecosine3.png)

如果角度指向下方，那麼餘弦會是 0，而正弦會是 1。

![](/images/book/16/sinecosine4.png)

那麼我們如何利用這些值讓圓朝著滑鼠移動呢？方法是把速度乘上它們。例如，如果滑鼠位於一個對角角度，比方說右上方，正弦可能是 -0.7，而餘弦可能是 0.7。

現在如果我們這樣寫：

```lua
circle.x = circle.x + circle.speed * dt
circle.y = circle.y + circle.speed * dt
```

圓會直接朝右下方移動。但如果我們像這樣乘以正弦和餘弦：

```lua
circle.x = circle.x + circle.speed * cos * dt
circle.y = circle.y + circle.speed * sin * dt
```

那麼圓會以 `circle.speed * 0.7` 的速度在水平方向移動，

並以 `circle.speed * -0.7` 的速度在垂直方向移動。

這意味著它應該會筆直地朝著滑鼠移動。來試試看吧！

```lua
function love.update(dt)
    -- love.mouse.getPosition 返回光標的 x 和 y 位置。
    mouse_x, mouse_y = love.mouse.getPosition()

    angle = math.atan2(mouse_y - circle.y, mouse_x - circle.x)

    cos = math.cos(angle)
    sin = math.sin(angle)

    -- 讓圓朝著滑鼠移動
    circle.x = circle.x + circle.speed * cos * dt
    circle.y = circle.y + circle.speed * sin * dt
end


function love.draw()
    love.graphics.circle("line", circle.x, circle.y, circle.radius)

    -- 角度線
    love.graphics.line(circle.x, circle.y, mouse_x, mouse_y)
    love.graphics.line(circle.x, circle.y, mouse_x, circle.y)
    love.graphics.line(circle.x, circle.y, circle.x, mouse_y)

end
```

![](/images/book/16/following_circle.gif)

___

## 距離

現在假設我們只想在圓靠近光標時才讓它移動。為此我們需要計算它們之間的距離。我們會使用勾股定理。

利用勾股定理，你可以計算出直角三角形中最長的邊。

![](/images/book/16/pythagorean.png)

基本的做法是，用較短的兩條邊構造兩個正方形，把這兩個正方形的面積相加，得到一個更大的正方形的面積，最後求這個正方形的平方根，你就得到了最長的邊，也就是*斜邊*的長度。

那麼這對我們求距離有什麼幫助呢？當你有兩個點（在我們的例子中是圓和光標）時，它們之間也存在一個看不見的三角形。

看一看：

```lua
function love.draw()
    love.graphics.circle("line", circle.x, circle.y, circle.radius)
    love.graphics.line(circle.x, circle.y, mouse_x, mouse_y)
    love.graphics.line(circle.x, circle.y, mouse_x, circle.y)
    love.graphics.line(mouse_x, mouse_y, mouse_x, circle.y)
end
```

![](/images/book/16/triangle.png)

如果我們對這個三角形使用勾股定理，就能算出它的斜邊，從而知道這兩個點之間的距離。

我們來為此編寫一個新函數。首先需要得到水平和垂直的邊。

```lua
function getDistance(x1, y1, x2, y2)
    local horizontal_distance = x1 - x2
    local vertical_distance = y1 - y2
end
```

接著我們需要把這些數字平方。可以通過自身相乘或用 `^2` 來實現。

```lua
function getDistance(x1, y1, x2, y2)
    local horizontal_distance = x1 - x2
    local vertical_distance = y1 - y2

    -- 兩種寫法都可以
    local a = horizontal_distance * horizontal_distance
    local b = vertical_distance ^2
end
```

現在我們要把這兩個數字相加並求平方根。如果我們把 5 平方（也就是 5*5 或 5^2），會得到 25，所以 25 的平方根是 5。我們可以使用 `math.sqrt` 求平方根。

```lua
function getDistance(x1, y1, x2, y2)
    local horizontal_distance = x1 - x2
    local vertical_distance = y1 - y2
    -- 兩種寫法都可以
    local a = horizontal_distance * horizontal_distance
    local b = vertical_distance ^2

    local c = a + b
    local distance = math.sqrt(c)
    return distance
end
```

為了驗證它是否有效，我們來畫一個半徑等於距離的圓。

```lua
function love.draw()
    love.graphics.circle("line", circle.x, circle.y, circle.radius)
    love.graphics.line(circle.x, circle.y, mouse_x, mouse_y)
    love.graphics.line(circle.x, circle.y, mouse_x, circle.y)
    love.graphics.line(mouse_x, mouse_y, mouse_x, circle.y)

    local distance = getDistance(circle.x, circle.y, mouse_x, mouse_y)
    love.graphics.circle("line", circle.x, circle.y, distance)
end
```

![](/images/book/16/following_circle_distance.gif)

成功了！現在來玩點有意思的。我希望圓只在距離小於 400 像素時移動，而且越接近目標移動得越慢。

```lua
function love.update(dt)
    mouse_x, mouse_y = love.mouse.getPosition()
    angle = math.atan2(mouse_y - circle.y, mouse_x - circle.x)
    cos = math.cos(angle)
    sin = math.sin(angle)

    local distance = getDistance(circle.x, circle.y, mouse_x, mouse_y)

    if distance < 400 then
        circle.x = circle.x + circle.speed * cos * (distance/100) * dt
        circle.y = circle.y + circle.speed * sin * (distance/100) * dt
    end
end
```
![](/images/book/16/following_circle_distance_speed.gif)

___

## 圖像
讓我們使用一張圖像，並讓它朝向光標。

![](/images/book/16/arrow_right.png)

旋轉參數默認是 0。

當角度為 0 時，餘弦為 1，正弦為 0，這意味著對象會朝右移動。

因此當你使用圖像時，應該讓它默認朝向右方。

```lua
function love.load()
    arrow = {}
    arrow.x = 200
    arrow.y = 200
    arrow.speed = 300
    arrow.angle = 0
    arrow.image = love.graphics.newImage("arrow_right.png")
end

function love.update(dt)
    mouse_x, mouse_y = love.mouse.getPosition()
    arrow.angle = math.atan2(mouse_y - arrow.y, mouse_x - arrow.x)
    cos = math.cos(arrow.angle)
    sin = math.sin(arrow.angle)

    arrow.x = arrow.x + arrow.speed * cos * dt
    arrow.y = arrow.y + arrow.speed * sin * dt
end

function love.draw()
    love.graphics.draw(arrow.image, arrow.x, arrow.y, arrow.angle)
    love.graphics.circle("fill", mouse_x, mouse_y, 5)
end
```

運行遊戲時你可能會注意到箭頭有些偏移。

![](/images/book/16/arrow_off.png)

這是因為圖像圍繞其左上角旋轉，而不是圍繞中心。要修復它，我們需要把原點放在圖像中心。


```lua
function love.load()
    arrow = {}
    arrow.x = 200
    arrow.y = 200
    arrow.speed = 300
    arrow.angle = 0
    arrow.image = love.graphics.newImage("arrow_right.png")
    arrow.origin_x = arrow.image:getWidth() / 2
    arrow.origin_y = arrow.image:getHeight() / 2
end
```

```lua
function love.draw()
    love.graphics.draw(arrow.image,
        arrow.x, arrow.y, arrow.angle, 1, 1,
        arrow.origin_x, arrow.origin_y)
    love.graphics.circle("fill", mouse_x, mouse_y, 5)
end
```

現在它就能正確指向光標了。

![](/images/book/16/following_arrow.gif)

___

## 總結

我們可以通過獲取角度的餘弦和正弦，讓對象按照角度移動。然後用速度乘以餘弦得到 x 方向的移動量，用速度乘以正弦得到 y 方向的移動量。我們可以使用勾股定理計算兩點之間的距離。當你使用圖像時，應讓它默認指向右方，並別忘了把原點放在圖像中心。
