# 第 6 章 - if 語句
___
*我們沿用上一章的代碼。*
___
使用 if 語句，我們可以讓某段代碼只在滿足特定條件時才會執行。

你可以這樣創建一個 if 語句：
```lua
if condition then
    -- 代碼
end
```

條件（也稱為語句）要麼為真，要麼為假。

例如：`5 > 9`

`>` 表示「大於」。所以這句話是「5 大於 9」，它是假的。

請把一個 if 語句包在增加 x 的代碼外面。

```lua
function love.update(dt)
    if 5 > 9 then
        x = x + 100 * dt
    end
end
```

運行遊戲時你會注意到矩形沒有移動。這是因為條件為假。如果我們把條件改成 `5 < 9`（5 小於 9），那麼條件為真，if 語句中的代碼就會執行。

藉此，我們就可以讓 `x` 增長到 600，然後停止移動，條件是 `x < 600`。

```lua
function love.update(dt)
    if x < 600 then
        x = x + 100 * dt
    end
end
```

![](/images/book/6/rectangle_stop.gif)

如果我們想要檢查一個值是否等於另一個值，需要使用兩個等號（==）。

例如：`4 == 7`

一個等號用來賦值，兩個等號用來比較。

```lua
x = 10 -- 把 10 賦值給 x
x == 10 -- 把 x 和 10 進行比較
```

我們還可以使用 `>=` 和 `<=` 來判斷一個值是否大於等於另一個值，或是小於等於另一個值。

```lua
10 <= 10 -- true，10 等於 10
15 >= 4 -- true，15 大於 4
```

所以上面的代碼相當於以下寫法的簡寫：
```lua
10 == 10 or 10 < 10
15 == 4 or 15 > 4
```

## 布爾值

變量也可以是 `true` 或 `false`。這種變量類型稱為布爾值（boolean）。

讓我們創建一個名為 `move` 的新變量，賦值為 `true`，並在 if 語句中檢查 `move` 是否為 `true`。

```lua
function love.load()
    x = 100
    move = true
end

function love.update(dt)
    -- 記得用兩個等號！
    if move == true then
        x = x + 100 * dt
    end
end
```

`move` 是 `true`，所以矩形會移動。不過 `move == true` 實際上是多餘的。我們是在檢查「`move` 的值是 `true`」是否成立。直接把 `move` 當作條件就足夠了。

```lua
if move then
    x = x + 100 * dt
end
```

如果我們想檢查 `move` 是否為 `false`，可以在它前面加上 `not`。

```lua
if not move then
    x = x + 100 * dt
end
```

如果我們想檢查一個數字是否不等於另一個數字，就使用波浪號（~）。

```lua
if 4 ~= 5 then
    x = x + 100 * dt
end
```

我們還可以把語句的結果賦值給變量，使其為 `true` 或 `false`。

例如：`move = 6 > 3`。

如果我們先檢查 move 是否為 true，然後在 if 語句內部把 move 改為 false，也不會立刻跳出 if 語句。下面的代碼仍然會繼續執行。

```lua
if move then
    move = false
    print("這一行仍然會被執行！")
    x = x + 100 * dt
end
```

## 方向鍵
讓我們基於是否按住右方向鍵來移動矩形。為此我們使用函數 `love.keyboard.isDown` [(wiki)](https://www.love2d.org/wiki/love.keyboard.isDown)。

注意 Down 的首字母是大寫的。這種大小寫方式稱為駝峰命名（camelCase）。我們把第一個單詞的首字母寫成小寫，之後每個單詞的首字母寫成大寫。在本教程中，我們的變量也會使用這種命名方式。

把字符串 "right" 作為第一個參數傳入，即可檢查右方向鍵是否被按下。
```lua
if love.keyboard.isDown("right") then
    x = x + 100 * dt
end
```

這樣只有在按住右方向鍵時，矩形才會移動。

![](/images/book/6/rectangle_right.gif)

我們還可以使用 `else` 來告訴遊戲當條件為 `false` 時該做什麼。讓我們在沒有按右方向鍵時，使矩形向左移動。

```lua
if love.keyboard.isDown("right") then
    x = x + 100 * dt
else
    x = x - 100 * dt -- 把 x 的值減小
end
```

如果第一個條件為假，我們還可以用 `elseif` 檢查另一個條件。讓我們在檢查右方向鍵後（未按下），再檢查左方向鍵是否按下。

```lua
if love.keyboard.isDown("right") then
    x = x + 100 * dt
elseif love.keyboard.isDown("left") then
    x = x - 100 * dt
end
```

試著讓矩形也能上下移動。

___

## and 與 or
使用 `and` 可以檢查多個條件是否同時為真。

 ```lua
if 5 < 9 and 14 > 7 then
    print("兩個條件都為真")
end
```

使用 `or` 時，只要任意條件為真，if 語句就會執行。

 ```lua
if 20 < 9 or 14 > 7 or 5 == 10 then
    print("這些條件裡至少有一個為真")
end
```


___

## 還有一件事
更準確地說，if 語句會檢查條件是否「不是 `false` 或 `nil`」。
```lua
if true then print(1) end -- 不是 false 或 nil，會執行。
if false then print(2) end -- false，不會執行。
if nil then print(3) end -- nil，不會執行。
if 5 then print(4) end -- 不是 false 或 nil，會執行。
if "hello" then print(5) end -- 不是 false 或 nil，會執行。
-- 輸出：1、4、5
```

___

## 總結
藉助 if 語句，我們可以讓某段代碼只在條件滿足時執行。我們可以檢查一個數字是否大於、小於或等於另一個數字/值。變量可以是 true 或 false，這種變量被稱為布爾值。我們可以使用 `else` 告訴遊戲在條件為假時執行什麼，或者使用 `elseif` 來進行其他檢查。
