## 表

表（table）本質上就是我們可以存儲值的列表。

可以用花括號（{ }）創建一個表：

```lua
function love.load()
    fruits = {}
end
```

我們剛剛創建了一個名為 fruits 的表。現在可以往這個表裡存儲值。有多種方法可以做到。

一種方式是在花括號裡直接寫入值。

```lua
function love.load()
    -- 每個值之間用逗號分隔，就像參數和實參一樣
    fruits = {"apple", "banana"}
end
```

我們還可以使用函數 `table.insert`。第一個參數是表，第二個參數是我們想要存放進表裡的值。

```lua
function love.load()
    -- 每個值之間用逗號分隔，就像參數和實參一樣
    fruits = {"apple", "banana"}
    table.insert(fruits, "pear")
end
```

這樣在執行完 love.load 之後，我們的表裡就包含了 `"apple"`、`"banana"` 和 `"pear"`。為了證明這一點，我們把這些值顯示在屏幕上。為此我們會使用 `love.graphics.print(text, x, y)`。

```lua
function love.draw()
    -- 參數：(文本，x 坐標，y 坐標)
    love.graphics.print("Test", 100, 100)
end
```

運行遊戲時，你應該會看到文本 "test"。我們可以通過寫出表名，然後加上方括號（[ ]）來訪問表中的值（注意是方括號而不是花括號！）。在方括號裡寫入我們想要的那個值所在的位置。

![](/images/book/7/table.png)

如前所述，表是一個值的列表。我們先添加了 `"apple"` 和 `"banana"`，所以它們分別位於列表的第 1 位和第 2 位。之後我們又添加了 `"pear"`，於是它位於列表的第 3 位。由於我們只添加了 3 個值，所以第 4 位目前還沒有值。

如果我們想列印 `"apple"`，就得取出列表中的第一個值。

```lua
function love.draw()
    love.graphics.print(fruits[1], 100, 100)
end
```

這樣就會繪製出 `"apple"`。如果把 `[1]` 換成 `[2]`，就會得到 `"banana"`，換成 `[3]` 則會得到 `"pear"`。

接下來我們想把 3 個水果都畫出來。我們當然可以調用 3 次 love.graphics.print，每次傳入不同的表元素……

```lua
function love.draw()
    love.graphics.print(fruits[1], 100, 100)
    love.graphics.print(fruits[2], 100, 200)
    love.graphics.print(fruits[3], 100, 300)
end
```

……但想像一下如果表裡有 100 個值。幸運的是，我們有解決方案：for 循環！

___

## for 循環

for 循環可以把某段代碼重複執行指定次數。

可以像這樣創建 for 循環：

```lua
function love.load()
    fruits = {"apple", "banana"}
    table.insert(fruits, "pear")

    for i=1,10 do
        print("hello", i)
    end
end
```

運行遊戲時你應該會看到它列印出 hello 1、hello 2、hello 3，一直到 10。

要創建一個 for 循環，先寫 `for`。接著寫一個變量並賦給它一個數值，這就是 for 循環的起點。這個變量可以隨便命名，但慣例上會使用 `i`。這個變量只能在 for 循環內部使用（就像函數的參數一樣）。然後寫上它要計數到的終點數字。例如 `for i=6,18 do` 會從 6 開始循環，到 18 為止。

還有第三個可選的數字，表示變量每次增加多少。`for i=6,18,4 do` 的序列就是：6、10、14、18。通過它也可以讓 for 循環用 -1 之類的步長倒序執行。

我們的表是從 1 開始，並且有 3 個值，所以我們會這樣寫：

```lua
function love.load()
    fruits = {"apple", "banana"}
    table.insert(fruits, "pear")

    for i=1,3 do
        print(fruits[i])
    end
end
```

運行遊戲時你會看到它列印出了 3 個水果。第一次循環列印 `fruits[1]`，第二次列印 `fruits[2]`，第三次列印 `fruits[3]`。

___

## 編輯表

如果我們往表裡添加或刪除一個值，就得把 3 換成其他數字。為此我們會用 `#fruits`。在 `#` 號後面寫表名，就能得到表的長度。表的長度指的是表中元素的數量。在我們的例子裡長度是 `3`，因為 `fruits` 表裡有 `apple`、`banana` 和 `pear` 這三個條目。

```lua
function love.load()
    fruits = {"apple", "banana"}

    print(#fruits)
    -- 輸出：2

    table.insert(fruits, "pear")

    print(#fruits)
    -- 輸出：3

    for i=1,#fruits do
        print(fruits[i])
    end
end
```

運用這點知識，我們來繪製全部 3 個水果。

```lua
function love.draw()
    for i=1,#fruits do
        love.graphics.print(fruits[i], 100, 100)
    end
end
```

運行遊戲會發現它確實繪製了 3 個水果，不過它們都畫在同一個位置。我們可以通過讓每個數字對應不同的高度來修正這個問題。

```lua
function love.draw()
    for i=1,#fruits do
        love.graphics.print(fruits[i], 100, 100 + 50 * i)
    end
end
```

這樣 `"apple"` 會繪製在 y 坐標 100 + 50 * 1，也就是 150 的位置。然後 `"banana"` 會繪製在 200，`"pear"` 會繪製在 250。

![](/images/book/7/fruits.png)

如果我們再添加一個水果，就不用改任何東西。它會自動被繪製出來。讓我們添加 `"pineapple"`。

```lua
function love.load()
    fruits = {"apple", "banana"}
    table.insert(fruits, "pear")
    table.insert(fruits, "pineapple")
end
```

我們也可以從表裡移除值。為此我們會用 `table.remove`。第一個參數是我們要刪除元素的表，第二個參數是我們要刪除的位置。如果想刪除 banana，就像這樣：

```lua
function love.load()
    fruits = {"apple", "banana"}
    table.insert(fruits, "pear")
    table.insert(fruits, "pineapple")
    table.remove(fruits, 2)
end
```

運行遊戲會看到 banana 不再被繪製，而 pear 和 pineapple 都往上挪了一格。

![](/images/book/7/shift.png)

當你用 `table.remove` 從表裡移除一個值時，表裡後續的所有元素都會往前移動。所以原本在第 3 位的現在會變成第 2 位，原本在第 4 位的現在會變成第 3 位。

你也可以直接在表裡新增或修改值。例如，我們可以把 `"apple"` 改成 `"tomato"`：

```lua
function love.load()
    fruits = {"apple", "banana"}
    table.insert(fruits, "pear")
    table.insert(fruits, "pineapple")
    table.remove(fruits, 2)
    -- 把表中第 1 個位置的值改成 "tomato"
    fruits[1] = "tomato"
end
```

___

## ipairs

回到 for 循環。其實還有另一種、更方便的方式來遍歷表，那就是使用 `ipairs` 循環。

```lua
function love.load()
    fruits = {"apple", "banana"}
    table.insert(fruits, "pear")
    table.insert(fruits, "pineapple")
    table.remove(fruits, 2)
    fruits[1] = "tomato"

    for i,v in ipairs(fruits) do
        print(i, v)
    end
    -- 輸出：
    -- 1, "tomato"
    -- 2, "pear"
    -- 3, "pineapple"
end
```

這個 for 循環會遍歷（iterate）表中的所有值。變量 `i` 表示當前位置，變量 `v` 是該位置上的值。它基本上相當於 `fruits[i]` 的簡寫。例如，在第一次迭代中，變量 `i` 的值為 `1`，`v` 的值為 `"apple"`；在第二次迭代中，`i` 和 `v` 分別是 `2` 和 `"pear"`。

那麼它是如何工作的？為什麼 `ipairs` 函數可以做到這一點？這個我們之後再深入探討。現在只需要知道，`ipairs` 基本上等價於如下代碼：

```lua
for i=1, #fruits do
    v = fruits[i]
end
```

讓我們使用 `ipairs` 來繪製表裡的內容。

```lua
function love.draw()
    -- i 和 v 都是變量，所以我們想怎麼命名都可以
    for i,frt in ipairs(fruits) do
        love.graphics.print(frt, 100, 100 + 50 * i)
    end
end
```

___

## 總結
表是可以存儲多個值的列表。我們在創建表時、通過 `table.insert`，或者通過 `table_name[1] = "some_value"` 等方式把值放進去。我們可以用 `#table_name` 獲取表的長度。for 循環可以讓我們重複執行一段代碼，也可以用來遍歷表。
