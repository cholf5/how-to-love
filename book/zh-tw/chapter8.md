# 第 8 章 - 對象

在上一章中我們把表當作帶編號的列表來使用，不過我們還可以用另一種方式存儲值：使用字符串。

```lua
function love.load()
        --rect 是 rectangle（矩形）的縮寫
        rect = {}
        rect["width"] = 100
end
```

在這個例子裡，`"width"` 就是我們所說的*鍵*或*屬性*。因此表 `rect` 現在有了一個名為 `"width"` 的屬性，值為 100。創建屬性時並不一定要寫字符串形式，點號（`.`）是 `table_name["property_name"]` 的簡寫。

```lua
function love.load()
        rect = {}
        -- 下面兩行是等價的
        rect["width"] = 100
        rect.width = 100
end
```

我們再添加一些其他屬性。

```lua
function love.load()
        rect = {}
        rect.x = 100
        rect.y = 100
        rect.width = 70
        rect.height = 90
end
```

既然屬性都準備好了，就可以把這個矩形畫出來。

```lua
function love.draw()
        love.graphics.rectangle("line", rect.x, rect.y, rect.width, rect.height)
end
```

讓它動起來吧！

```lua
function love.load()
        rect = {}
        rect.x = 100
        rect.y = 100
        rect.width = 70
        rect.height = 90

        -- 添加一個 speed 屬性
        rect.speed = 100
end

function love.update(dt)
        -- 別忘了乘以 delta time，增加 x 的數值
        rect.x = rect.x + rect.speed * dt
end
```

我們再次得到一個會動的矩形，不過為了展示表的強大，我們想創建多個會移動的矩形。為此我們要把表當作列表使用，製作一個矩形列表。把 `love.load` 裡的代碼移到一個新函數裡，並在 `love.load` 中創建一個新表。

```lua
function love.load()
        -- 記得使用 camelCase（駝峰式命名）！
        listOfRectangles = {}
end

function createRect()
        rect = {}
        rect.x = 100
        rect.y = 100
        rect.width = 70
        rect.height = 90
        rect.speed = 100

        -- 把新的矩形放進列表
        table.insert(listOfRectangles, rect)
end
```

現在每次調用 `createRect`，我們都會把一個新的矩形對象添加到列表中。沒錯，一個表裡裝著一堆表。讓我們實現按下空格就調用 `createRect`。可以通過回調函數 `love.keypressed` 來完成。

```lua
function love.keypressed(key)
        -- 記住，比較時要用兩個等號（==）！
        if key == "space" then
                createRect()
        end
end
```

每當我們按下一個按鍵，LÖVE 就會調用 `love.keypressed`，並把按下的鍵作為參數傳進來。如果這個鍵是 `"space"`，就會調用 `createRect`。

最後要做的是修改我們的更新和繪製函數。我們需要遍歷矩形列表。

```
function love.update(dt)
        for i,v in ipairs(listOfRectangles) do
                v.x = v.x + v.speed * dt
        end
end

function love.draw(dt)
        for i,v in ipairs(listOfRectangles) do
                love.graphics.rectangle("line", v.x, v.y, v.width, v.height)
        end
end
```

現在運行遊戲時，每按一次空格，屏幕上就會出現一個移動的矩形。

![](/images/book/8/moving_rectangles.gif)

___

## 再來一遍？

這一章用很短的篇幅寫了不少代碼，難免讓人感到困惑，所以我們再把整個流程過一遍：

在 `love.load` 裡，我們創建了一個名為 `listOfRectangles` 的表。

按下空格時，LÖVE 會調用 `love.keypressed`，在這個函數裡我們檢查按下的鍵是不是 `"space"`。如果是，就調用函數 `createRect`。

在 `createRect` 中我們創建了一個新表，給它添加了 `x`、`y` 等屬性，然後把這個新表放進列表 `listOfRectangles` 裡。

在 `love.update` 和 `love.draw` 中，我們遍歷這個矩形列表，以更新和繪製每一個矩形。

___

## 函數

對象也可以擁有函數。為對象創建函數的方法如下：

```lua
tableName.functionName = function ()

end

-- 或者更常見的寫法
function tableName.functionName()

end
```

___

## 總結

我們不僅可以用數字，也可以用字符串來為表存儲值。這樣的表被稱為*對象*。利用對象可以避免創建大量的獨立變量。
