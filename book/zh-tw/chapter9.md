# 第 9 章 - 多文件與作用域

## 多文件

使用多個文件可以讓代碼更有條理，也更易於瀏覽。新建一個名為 `example.lua` 的文件。確保它和一個全新且為空的 `main.lua` 位於同一目錄。

在這個文件裡創建一個變量。我會在代碼塊頂部加上 `--! file:`，以明確代碼應該放在哪個文件裡。這裡只是為了本教程方便說明，它沒有任何功能（畢竟只是注釋），你不需要真正把它複製進去。如果接下來的教程裡某個代碼塊沒有出現這行，那就表示代碼要麼寫在 main.lua，要麼寫在之前提到的那個文件裡。

```lua
--! file: example.lua
test = 20
```

現在在 `main.lua` 裡寫上 `print(test)`。當你運行遊戲時，會發現 `test` 的值是 `nil`。這是因為我們必須先加載那個文件。我們可以使用 `require`，把文件名作為字符串傳入第一個參數。

```lua
--! file: main.lua
-- 省略 .lua 後綴
-- 暫時也不需要寫 love.load 之類的內容
require("example")
print(test)
```

我們不給文件名加上 `".lua"`，因為 Lua 會自動幫我們補上。

你也可以把文件放在子目錄裡，但那樣就需要寫上完整路徑。

```lua
-- 在 require 裡路徑分隔使用 . 而不是 /
require("path.to.example")
```

此時再次列印 `test`，在加載過 `example.lua` 之後，你應該能看到輸出為 20。

在這種情況下，`test` 是我們所說的*全局變量*（簡稱 *global*）。也就是可以在整個項目裡都使用的變量。與之相對的是*局部變量*（簡稱 *local*）。只要在變量名前加上 `local` 就能創建局部變量。

```lua
--! file: example.lua
local test = 20
```

重新運行遊戲會發現 `test` 又變成 `nil` 了。這是因為它的*作用域*發生了變化。

---

## 作用域

局部變量只能在它們的*作用域*內使用。以上面的 `test` 為例，它的作用域就是文件 `example.lua`。這意味著 `test` 可以在這個文件中的任意位置使用，但在其他文件裡則不可見。

如果我們在一個*代碼塊*內創建局部變量，比如函數、if 語句或 for 循環，那這個代碼塊就是該變量的作用域。

```lua
--! file: example.lua
if true then
        local test = 20
end

print(test)
-- 輸出：nil
```

`test` 會是 `nil`，因為我們在它的作用域之外列印它。

函數的參數和局部變量類似，它們只存在於函數內部。

想要真正理解作用域是如何工作的，可以看看下面的代碼：

```lua
--! file: main.lua
test = 10
require("example")
print(test)
-- 輸出：10
```

```lua
--! file: example.lua
local test = 20

function some_function(test)
        if true then
                local test = 40
                print(test)
                -- 輸出：40
        end
        print(test)
        -- 輸出：30
end

some_function(30)

print(test)
-- 輸出：20
```

運行遊戲後，輸出順序應該是：40、30、20、10。我們一步步分析這段代碼。

首先我們在 `main.lua` 中創建變量 `test`，但在列印它之前就先 `require` 了 `example.lua`。

在 `example.lua` 裡我們創建了一個局部變量 `test`，它不會影響 `main.lua` 中的全局變量。也就是說，局部變量被賦的值並不會傳遞給全局變量。

我們創建了一個名為 `some_function(test)` 的函數，並在後面調用它。

在這個函數裡，參數 `test` 不會影響我們之前創建的那個局部變量。

在 if 語句內部我們又創建了一個名為 `test` 的局部變量，它同樣不會影響函數參數 `test`。

第一次列印發生在 if 語句內部，輸出 40。離開 if 語句後再次列印 `test`，現在輸出 30，也就是我們作為參數傳入的值。if 語句裡的 `test` 不會影響到參數 `test`；在 if 內部，那個局部變量擁有比參數更高的優先級。

在函數外部我們也列印了 `test`。這一次得到的是 20。`example.lua` 開頭創建的局部變量並沒有被函數內部的 `test` 影響。

最後我們在 `main.lua` 裡列印 `test`，結果是 10。全局變量同樣不受 `example.lua` 中局部變量的影響。

為了讓每個 `test` 的作用域更加清晰，我做了一個可視化示意圖：

![](/images/book/9/scope.png)

在創建局部變量時，並不一定要立刻賦值。

```lua
local test
test = 20
```

## 返回值

如果在文件的頂層（也就是不在任何函數裡）寫了 return 語句，當你通過 `require` 加載這個文件時，它就會返回該值。

舉個例子：

```lua
--! file: example.lua
local test = 99
return test
```
```lua
--! file: main.lua
local hello = require "example"
print(hello)
-- 輸出：99
```

## 何時使用局部變量？

最佳實踐是始終優先使用局部變量。主要原因是，使用全局變量更容易犯錯。你可能會在不同位置不小心重複使用同一個變量，使得在位置 1 修改的值在位置 2 會變得莫名其妙。如果某個變量只會在特定作用域內使用，就把它設為局部變量。

上一章中我們寫了一個創建矩形的函數。這個函數裡其實可以把變量 `rect` 聲明為局部變量，因為它只在函數內部使用。雖然我們仍會在函數外使用這個矩形，但我們是通過把它加入表 `listOfRectangles`，再從表裡訪問的。

我們沒有把 `listOfRectangles` 聲明為局部變量，是因為它會在多個函數裡使用。

```lua
function love.load()
        listOfRectangles = {}
end

function createRect()
        local rect = {}
        rect.x = 100
        rect.y = 100
        rect.width = 70
        rect.height = 90
        rect.speed = 100

        -- 把新矩形放進列表
        table.insert(listOfRectangles, rect)
end
```

不過我們仍然可以在 `love.load` 函數外部創建這個變量，從而讓它保持為局部變量。

```lua
-- 在這裡聲明後，我們就能在整個文件裡訪問它
local listOfRectangles = {}

function love.load()
        -- 既然它已經是空表了，這個函數現在可以刪掉
end
```

那麼什麼時候可以使用全局變量呢？對此大家意見不一。有些人會告訴你絕不要使用全局變量。我會告訴你，尤其是對初學者來說，如果確實需要在多個文件中使用同一個變量，使用全局變量是可以的。最好這種變量在創建後就不要再修改（重新賦值）。這類似於 `love` 這個全局變量：它從來不會改變。

需要注意的是，在整個教程中我用了不少全局變量，但那只是為了讓代碼更短、更容易講解。

---

## 小結

使用 `require` 可以加載其它 Lua 文件。創建的變量默認可以在所有文件裡使用；除非把它聲明為局部變量，這樣它就只能在自己的作用域內生效。局部變量不會影響作用域之外同名的變量。儘量使用局部變量而不是全局變量，它們執行起來也更快。
