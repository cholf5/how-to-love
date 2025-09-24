庫是一段任何人都可以用來為自己的項目添加特定功能的代碼。

我們來試試一個庫。我們要使用 *rxi* 編寫的 *tick*。你可以在 [GitHub](https://github.com/rxi/tick) 上找到這個庫。

點擊 `tick.lua` 然後再點擊 Raw，接著[複製全部代碼](https://raw.githubusercontent.com/rxi/tick/master/tick.lua)。

回到你的文本編輯器，新建一個名為 `tick.lua` 的文件並粘貼這段代碼。

現在我們需要遵循 GitHub 頁面上的指引。首先，用 `require` 把它加載進來。

```lua
function love.load()
    tick = require "tick"
end
```

注意 `require` 後面沒有括號 ()。這是因為在只傳入一個參數時，可以省略它們。當然，我還是建議在其他函數調用中加上括號，不過對於 `require` 來說，省略括號是很常見的寫法。只是話說回來，這其實並不會帶來什麼區別。

接著我們要在更新函數裡放入 `tick.update(dt)`。

```lua
function love.update(dt)
    tick.update(dt)
end
```

現在我們已經準備好使用這個庫了。讓我們設置一個效果：在 2 秒之後繪製一個矩形。

```lua
function love.load()
    tick = require "tick"

    -- 創建一個布爾值
    drawRectangle = false

    -- 第一個參數是函數
    -- 第二個參數是等待多久調用這個函數
    tick.delay(function () drawRectangle = true end ,       2)
end

function love.draw()
    -- 如果 drawRectangle 為真，就繪製一個矩形
    if drawRectangle then
        love.graphics.rectangle("fill", 100, 100, 300, 200)
    end
end
```

我們剛剛把一個函數當作參數傳進去了？當然可以呀。函數本來就是一種變量。

運行遊戲你就會看到，有了這個庫我們可以給函數調用加上延遲。而像這樣提供各種功能的庫還有很多。

不要因為使用庫而感到愧疚。為什麼要重新發明輪子呢？除非你對自己動手實現很感興趣。我個人在項目裡大概會用到 10 個庫。它們提供的功能是我不懂得如何自己實現的，而且我也不打算去研究。

庫並不是魔法。它們都是 Lua 代碼，只要我們掌握了相關知識，你我都寫得出來。我們會在之後的章節自己做一個庫，從而更好地理解它們的運作方式。

___

## 標準庫

Lua 自帶了一些庫，稱為 *標準庫*。它們就是 Lua 內置的函數。比如 `print` 就是標準庫的一部分，`table.insert` 和 `table.remove` 也是。

有一個重要但我們尚未接觸的標準庫叫作 *math 庫*。它提供了數學相關的函數，在製作遊戲時會非常有用。

例如，`math.random` 會給我們一個隨機數。我們來用它在你按下空格時，把矩形放到一個隨機的位置。

```lua
function love.load()
    x = 30
    y = 50
end

function love.draw()
    love.graphics.rectangle("line", x, y, 100, 100)
end

function love.keypressed(key)
    -- 如果按下空格，就……
    if key == "space" then
        -- 讓 x 和 y 變成 100 到 500 之間的隨機數
        x = math.random(100, 500)
        y = math.random(100, 500)
    end
end
```

現在我們理解了什麼是庫，就可以開始使用一個類庫了。

___

## 總結

庫是用來提供功能的代碼，任何人都可以編寫。Lua 也自帶了我們稱之為標準庫的內置庫。
