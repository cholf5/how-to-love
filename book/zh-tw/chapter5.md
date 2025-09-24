# 第5章 - 移動一個矩形

現在我們可以開始我稱之為「有趣的部分」了。我們要讓東西動起來！

先來看 3 個主要的回調函數。

```lua
function love.load()
end

function love.update()
end

function love.draw()
end
```

接下來，我們繪製一個矩形。

```lua
function love.draw()
    love.graphics.rectangle("line", 100, 50, 200, 150)
end
```

![](/images/book/5/rectangle.png)

這個函數的第二個和第三個參數分別是 x 與 y 坐標。

x 表示「屏幕上的水平位置」。0 在屏幕的最左側。

y 表示「屏幕上的垂直位置」。0 在屏幕的最上方。

![](/images/book/5/coordinates.png)

現在我們想讓這個矩形動起來。是時候像程式設計師那樣思考了。矩形要向右移動，究竟需要發生什麼？x 坐標得不斷增大：100、101、102、103、104，如此類推。但我們沒法把 100 改成 101。100 就是 100。我們需要一個可以隨意改變數值的東西。沒錯，就是**變量**！

在 love.load 中創建一個名為 `x` 的變量，並將 `love.graphics.rectangle` 裡的 100 替換為 `x`。

```lua
function love.load()
    x = 100
end

function love.draw()
    love.graphics.rectangle("line", x, 50, 200, 150)
end
```

因此現在我們矩形的 x 坐標就是變量 `x` 的值。

注意變量名 `x` 只是一個名字。我們完全可以把它叫做 `icecream` 或者 `unicorn` 等任意名字。函數並不在乎變量叫什麼，它只關心變量的值。

現在我們要讓這個矩形動起來。這要在 love.update 中完成。每次更新我們都想讓 `x` 增加 5。換句話說，`x` 必須等於 `x` 的當前值再加上 5。我們就是這麼寫的。

```lua
function love.update()
    x = x + 5
end
```

這樣當 `x` 等於 100 時，它會把 `x` 改成 100 + 5。下一次更新時 `x` 就是 105，然後它會變成 105 + 5，如此往復。

運行遊戲。矩形現在應該會移動了。

![](/images/book/5/rectangle_move.gif)

___

## Delta time

我們已經讓矩形移動了，但還有一個小問題：如果在另一臺電腦上運行遊戲，矩形的速度可能不同。這是因為並不是所有電腦的更新頻率都一樣，這就可能導致問題。

舉個例子，假設電腦 A 以 100 幀/秒（fps）運行，而電腦 B 以 200 幀/秒運行。

100 x 5 = 500

200 x 5 = 1000

因此，在 1 秒內，電腦 A 上的 `x` 增加了 500，而在電腦 B 上 `x` 增加了 1000。

幸運的是，我們有一個解決方案：delta time。

當 LÖVE 調用 love.update 時，它會傳入一個參數。在 love.update 裡添加參數 dt（delta time 的縮寫），然後把它列印出來看看。

```lua
function love.update(dt)
    print(dt)
    x = x + 5
end
```

delta time 是前一次更新與當前更新之間經過的時間。因此，在以 100 fps 運行的電腦 A 上，delta time 平均是 1 / 100，也就是 0.01。

在電腦 B 上，delta time 是 1 / 200，也就是 0.005。

所以在 1 秒內，電腦 A 更新了 100 次，並把 `x` 增加了 `5 * 0.01`；電腦 B 更新了 200 次，並把 `x` 增加了 `5 * 0.005`。

`100 * 5 * 0.01 = 5`

`200 * 5 * 0.005 = 5`

通過使用 delta time，我們的矩形在所有電腦上都會以相同的速度移動。

```lua
function love.update(dt)
    x = x + 5 * dt
```

現在我們的矩形在所有電腦上都是每秒移動 5 像素。把 5 改成 100 就能讓它移動得更快。

___

## 總結
我們使用一個在每次更新時遞增的變量，讓矩形移動。遞增時，我們把要增加的數乘以 delta time。delta time 是前一次更新與當前更新之間經過的時間。通過使用 delta time，可以確保矩形在所有電腦上以相同的速度移動。