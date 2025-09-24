# 第 20 章 - 調試

Bug 指的是程序（在這裡是遊戲）中出現的問題。調試就是修復這些 Bug，讓它們不再發生。作為程式設計師，遇到各種各樣的 Bug 是再正常不過的事，因此調試是一項非常寶貴的技能。

我寫了一個小小遊戲。

```lua
function love.load()
    circle = {x = 100, y = 100}
    bullets = {}
end

function love.update(dt)
    for i,v in ipairs(bullets) do
        v.x = v.x + 400 * dt
    end
end

function love.draw()
    love.graphics.circle("fill", circle.x, circle.y, 50)

    for i,v in ipairs(bullets) do
        love.graphics.circle("fill", v.x, v.y, 10)
    end
end

function love.keypressed()
    if key == "space" then
        shoot()
    end
end

function shoot()
    table.insert(bullets, {circle.x, circle.y})
end
```

按下 `space` 應該會發射一顆子彈。至少理論上如此，但實際上卻沒有任何反應，沒有子彈出現。我們來找出原因。

我能想到的可能原因有：

* 並沒有真正發射子彈。
* 發射了子彈，但繪製代碼有問題。
* 繪製了子彈，但位置不對。

為了弄清問題出在哪，我們可以使用 `print`。例如把 `print` 放到 `love.update` 的 for 循環裡，檢查子彈的 x 坐標，以及循環是否真的被執行。因為如果子彈根本沒有生成，`print` 永遠不會運行。

```lua
function love.update(dt)
    for i,v in ipairs(bullets) do
        v.x = v.x + 400 * dt
        print(v.x)
    end
end
```

記得可以在 `main.lua` 頂部加入下面的代碼，這樣輸出會立刻顯示出來，不用關閉遊戲窗口。

```lua
io.stdout:setvbuf("no")
```

運行遊戲，按幾次空格試試看。你會發現輸出面板裡沒有任何內容。看起來我們並沒有往 `bullets` 表裡填東西。為了確認 `shoot` 函數有沒有被調用，我們再在那裡加一個 `print`。

```lua
function shoot()
    table.insert(bullets, {circle.x, circle.y})

    -- 你知道 print 可以接收無數個參數嗎？
    print("How many bullets?", #bullets)
end
```

再試著射擊，你會發現輸出面板依舊沒有任何列印。很奇怪啊，`if` 語句裡寫著 `if key == "space"`，我們明明按了空格。為了保險起見，讓我們列印一下 `key` 的值。說不定我們把 `love.keypressed` 拼錯了，導致根本沒有執行到這段代碼。

```lua
function love.keypressed()
    -- 像這樣加入提示文字可以為輸出提供上下文。
    -- 當你有很多 print 時特別有用。
    print("What is the key?", key)
    if key == "space" then
        shoot()
    end
end
```

再次嘗試射擊，你會看到這次確實有內容列印出來了。看起來 `key` 的值是 `nil`。這怎麼可能？LÖVE 會把按鍵作為第一個參數傳進來啊。不過等一下，我們的函數參數裡並沒有 `key`。定義函數時我忘記寫了。修一下吧。

```lua
function love.keypressed(key)
    print("What is the key?", key)
    if key == "space" then
        shoot()
    end
end
```

好了，現在按下空格還是射不出子彈，但發生了別的事情：出現了一條錯誤信息。

___

## 閱讀和修復錯誤

當代碼嘗試執行不可能完成的操作時就會報錯。例如你無法把一個數字和字符串相乘，這會報錯：

```lua
print(100 * "test")
```
![](/images/book/20/error1.png)

再比如嘗試調用不存在的函數：

```lua
doesNotExist()
```

![](/images/book/20/error2.png)

在我們的發射子彈遊戲裡，出現的錯誤如下：

![](/images/book/20/error3.png)

那麼這條錯誤究竟告訴了我們什麼？很多初學者都會忽略這一點：錯誤信息其實已經準確指出了出錯的原因和位置。

```
main.lua:10:
```

這一行告訴我們錯誤發生在第 10 行（你的行號可能不同）。

```
attempt to perform arithmetic on field 'x' (a nil value)
```

「Arithmetic」 指的是計算，比如使用 `+`、`-`、`*` 等。它嘗試在欄位 `x` 上進行計算，但 `x` 是 `nil`。

這就奇怪了，我們不是給表裡加了 `x` 和 `y` 嗎？其實並沒有。我們只是把值插入了表裡，卻沒有把它們賦給欄位。把它修好吧。

```
function shoot()
    table.insert(bullets, {x = circle.x, y = circle.y})
end
```

現在終於可以射出子彈了！

我們再看一段新代碼，我創建了一個 Circle 類並把它繪製了幾次（不一定要跟著寫）。

```lua
Object = require "classic"

Circle = Object:extend()

function Circle:new()
    self.x = 100
    self.y = 100
end

function Circle:draw(offset)
    love.graphics.circle("fill", self.x + offset, self.y, 25)
end

function love.load()
    circle = Circle()
end

function love.draw()
    circle:draw(10)
    circle:draw(70)
    circle.draw(140)
    circle:draw(210)
end
```

運行這段代碼時我得到了如下錯誤：

![](/images/book/20/error4.png)

「Attempt to index」 表示它嘗試訪問某個屬性。在這裡，它試圖在變量 `self` 上找到屬性 `x`。但錯誤提示裡說 `self` 是一個數字，所以當然不行。這是怎麼發生的呢？我們用冒號（`:`）定義了函數，這樣第一個參數就會自動是 `self`，並且我們也用冒號調用，這樣 `self` 會作為第一個實參傳入。但顯然某個地方出了錯。為了知道哪裡出錯，我們可以查看回溯（Traceback）。

錯誤信息的底部展示了在觸發錯誤前代碼執行的「路徑」。要從下往上讀。`xpcall` 那一行可以忽略。下一行寫著 `main.lua:21: in function 'draw'`。有意思，去看看。啊哈，我明白了。在第 21 行我用了一個點號而不是冒號（`circle.draw(140)`）。把它改成冒號就正常了！

___

## 語法錯誤

*語法錯誤* 指的是遊戲甚至無法啟動，因為代碼本身有問題。解析代碼時無法理解它。例如還記得變量名不能以數字開頭嗎？如果你這麼做就會報錯：

![](/images/book/20/error5.png)

看看下面這段代碼（同樣不必跟著寫）：

```lua
function love.load()
    timer = 0
    show = true
end

function love.update(dt)
    show = false
    timer = timer + dt

    if timer > 1 then
        if love.keyboard.isDown("space") then
            show = true
        end
    if timer > 2 then
        timer = 0
    end
end

function love.draw()
    if show then
        love.graphics.rectangle("fill", 100, 100, 100, 100)
    end
end
```

這段代碼給了我如下錯誤：

![](/images/book/20/error6.png)

`<eof>` 的意思是 *文件結束*。它期望在文件末尾看到一個 `end`。那我們直接在文件末尾加一個 `end` 就行了嗎？當然不行。是我在某處寫錯了，需要正確修復。錯誤提示說它期待的是在第 6 行的函數裡找到 `end`，那就從那裡開始往下檢查。打開函數後我寫了一個 if 語句，然後又寫了一個 if。關閉第二個 if 後我又開始了另一個 if，然後也把它關閉，接著關閉最外層的 if。不對啊，那時我應該關閉函數才對。我在函數裡漏了一個 `end`。修正如下：

```lua
function love.update(dt)
    show = false
    timer = timer + dt

    if timer > 1 then
        if love.keyboard.isDown("space") then
            show = true
        end
        if timer > 2 then
            timer = 0
        end
    end
end
```

現在就能運行了。這也是為什麼縮進如此重要：它幫助你看清哪裡出了類似的錯誤。

另一個常見的錯誤如下所示：

```lua
function love.load()
    t = {}
    table.insert(t, {x = 100, y = 50)
end
```

它會報出下面的錯誤：

![](/images/book/20/error7.png)

原因是我沒有把花括號閉合。

```lua
function love.load()
    t = {}
    table.insert(t, {x = 100, y = 50})
end
```

___

## 尋求幫助

也許你遇到了一個 Bug，又怎麼都修不好。你嘗試過各種調試方法卻始終找不到原因，於是覺得需要幫助。幸運的是，網上有很多人樂於助人。提問的最佳地點是 [論壇](https://www.love2d.org/forums/viewforum.php?f=4&sid=4764a2d3dfb4e22494fe4e6de08ec829) 或 [Discord](https://discord.gg/MHtXaxQ)。不過提問可不是一句「各位我遇到這個 Bug 了怎麼辦？」就完事。你需要提供足夠的信息，別人才能幫助你。

例如：

* 具體出現了什麼問題？你期望/希望發生什麼？
* 說明你已經嘗試過哪些解決方案。
* 展示你認為可能出錯的代碼位置。
* 分享 .love 文件，讓其他人可以親自運行。

不過在提問之前，你可以先搜索一下你的問題。說不定這是個常見問題，已經被回答過很多次了。

記住，沒有人有義務幫你；願意伸出援手的人也都是無償的，所以要保持禮貌 :)

___

## 橡皮鴨調試法

你還可以準備一隻橡皮鴨。這叫做[橡皮鴨調試法](https://en.wikipedia.org/wiki/Rubber_duck_debugging)。理念是：當你向別人解釋自己的代碼時，往往會意識到哪裡寫錯了，並自己修好。既然如此，你完全可以把橡皮鴨當成聽眾。我自己就有一隻，名字叫 Hendrik！

![](/images/book/20/hendrik.png)

___

## 總結
我們可以使用 `print` 來定位 Bug 的來源。錯誤信息會準確告訴我們哪裡出了問題。語法錯誤是因為解析代碼失敗而產生的錯誤。良好的縮進可以幫助我們避免類似的漏寫 `end` 錯誤。我們可以在網上尋求幫助，但要提供充分的信息，讓幫助我們的人省些力氣。
