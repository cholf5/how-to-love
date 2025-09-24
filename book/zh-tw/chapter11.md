類就像藍圖。用一張藍圖可以建造很多房子，同樣地，我們也能從一個類創建多個對象。

![](/images/book/11/blueprint.png)

為了使用類，我們需要一個庫：[classic](https://github.com/rxi/classic)。

點擊 `classic.lua`，再點擊 Raw，然後[複製源碼](https://raw.githubusercontent.com/rxi/classic/master/classic.lua)。

回到你的文本編輯器，新建一個叫做 `classic.lua` 的文件，並把代碼粘貼進去。

接下來我們要在程序裡引用它。

```lua
function love.load()
    Object = require "classic"
end
```

現在我們已經準備好來創建一個類了。新建文件 `rectangle.lua`，把下面的代碼放進去：

```lua
--! file: rectangle.lua

-- 把 Object 作為第一個參數傳入。
Rectangle = Object.extend(Object)

function Rectangle.new(self)
    self.test = math.random(1, 1000)
end
```

稍後我們會解釋所有內容，但先把這段代碼放進你的 `main.lua`。

```lua
--! file: main.lua
function love.load()
    Object = require "classic"
    -- 別忘了加載文件
    require "rectangle"

    r1 = Rectangle()
    r2 = Rectangle()
    print(r1.test, r2.test)
end
```

運行遊戲時，你會看到列印出了兩個隨機數。

接下來我們逐行分析這段代碼。首先通過 `Rectangle = Object.extend(Object)` 創建了一個新類。這樣 `Rectangle` 就成為一個類，這是我們的藍圖。與普通屬性不同，類名通常首字母大寫（也就是 UpperCamelCase 或 PascalCase）。

在 `main.lua` 中我們寫了 `r1 = Rectangle()`。雖然 `Rectangle` 是一個表，但我們仍然可以像調用函數那樣去調用它。這個機制留到以後再講。調用 `Rectangle()` 會創建一個新的實例，這意味著它會基於我們的藍圖構造一個具有類全部特性的對象。每個實例都是獨立的。

為了證明 `r1` 是獨立的，我們又創建了一個名為 `r2` 的實例。它們都有 `test` 屬性，但值不同。

當我們調用 `Rectangle()` 時，會執行 `Rectangle.new`。這就是所謂的「構造函數」。

參數 `self` 表示我們正在修改的實例。如果我們寫 `Rectangle.test = math.random(0, 1000)`，就會把屬性賦給藍圖本身，而不是由藍圖創建的實例。

讓我們對這個類做一些修改：

```lua
--! file: rectangle.lua
Rectangle = Object.extend(Object)

function Rectangle.new(self)
    self.x = 100
    self.y = 100
    self.width = 200
    self.height = 150
    self.speed = 100
end


function Rectangle.update(self, dt)
    self.x = self.x + self.speed * dt
end


function Rectangle.draw(self)
    love.graphics.rectangle("line", self.x, self.y, self.width, self.height)
end
```

這和我們在[第 8 章](/learn/book/8)裡製作的移動矩形對象很相似，只不過這次我們把移動和繪製的代碼放進了對象內部。現在在 `main.lua` 中只需要調用它的更新和繪製函數即可。

```lua
--! file: main.lua

function love.load()
    Object = require "classic"
    require "rectangle"
    r1 = Rectangle()
    r2 = Rectangle()
end


function love.update(dt)
    r1.update(r1, dt)
end


function love.draw()
    r1.draw(r1)
end
```

運行遊戲時你會看到一個移動的矩形。

我們創建了一個名為 `Rectangle` 的類，並實例化為 `r1`。現在 `r1` 擁有 `update` 和 `draw` 這兩個函數。我們調用它們，並且把實例自身 `r1` 作為第一個參數傳進去，這個參數在函數裡就變成了 `self`。

不過每次調用函數都要手動傳入 `r1` 有點煩人。幸運的是，Lua 提供了一個簡寫。使用冒號（:）調用函數時，Lua 會自動把冒號左側的對象作為第一個參數傳入。

```lua
--! file: main.lua
function love.update(dt)
    -- Lua 會把它轉換為：r1.update(r1, dt)
    r1:update(dt)
end


function love.draw()
    -- Lua 會把它轉換為：r1.draw(r1)
    r1:draw()
end
```

在定義函數時也可以使用同樣的寫法。

```lua
--! file: rectangle.lua

-- Lua 會把它轉換為：Object.extend(Object)
Rectangle = Object:extend()

-- Lua 會把它轉換為：Rectangle.new(self)
function Rectangle:new()
    self.x = 100
    self.y = 100
    self.width = 200
    self.height = 150
    self.speed = 100
end


-- Lua 會把它轉換為：Rectangle.update(self, dt)
function Rectangle:update(dt)
    self.x = self.x + self.speed * dt
end


-- Lua 會把它轉換為：Rectangle.draw(self)
function Rectangle:draw()
    love.graphics.rectangle("line", self.x, self.y, self.width, self.height)
end
```

我們把這種寫法稱為[*語法糖*](https://zh.wikipedia.org/wiki/%E8%AF%AD%E6%B3%95%E7%B3%96)。

讓我們給 `Rectangle:new()` 添加一些參數。

```lua
--! file: rectangle.lua
function Rectangle:new(x, y, width, height)
    self.x = x
    self.y = y
    self.width = width
    self.height = height
    self.speed = 100
end
```

這樣我們就能分別給 `r1` 和 `r2` 指定它們自己的位置和尺寸。

```lua
--! file: main.lua

function love.load()
    Object = require "classic"
    require "rectangle"
    r1 = Rectangle(100, 100, 200, 50)
    r2 = Rectangle(350, 80, 25, 140)
end


function love.update(dt)
    r1:update(dt)
    r2:update(dt)
end


function love.draw()
    r1:draw()
    r2:draw()
end
```

現在我們擁有兩個移動的矩形，這就是類的強大之處。`r1` 和 `r2` 擁有相同的結構，但彼此獨立。

![](/images/book/11/moving_rectangles_classes.gif)

類的另一個優勢是「繼承」。

___

## 繼承

通過繼承，我們可以擴展類。換句話說，我們複製藍圖並給它添加功能，而不用修改原始藍圖。

![](/images/book/11/extension.png)

假設你的遊戲裡有多種怪物。每個怪物都有自己的攻擊方式和移動方式，但它們都可以受到傷害，也都可能死亡。這些共同的特性應該放在所謂的*超類*或*基類*中。基類提供所有怪物共有的功能，然後每個怪物的類再繼承這個基類並添加自己的特性。

我們來創建另一個移動的形狀——圓形。移動矩形和圓形有哪些共同點？它們都會移動。所以我們為這些形狀創建一個基類。

新建文件 `shape.lua`，並寫入以下代碼：

```lua
--! file: shape.lua
Shape = Object:extend()

function Shape:new(x, y)
    self.x = x
    self.y = y
    self.speed = 100
end


function Shape:update(dt)
    self.x = self.x + self.speed * dt
end
```

現在我們的基類 `Shape` 負責移動邏輯。需要說明的是，「基類」只是一個術語，比如「X 是 Y 的基類」。基類和其他類本質上沒有區別，只是使用方式不同。

既然我們已有處理移動的基類，就可以讓 `Rectangle` 繼承 `Shape`，並移除它自己的更新函數。別忘了在使用前先 `require "shape"`。

```lua
--! file: main.lua

function love.load()
    Object = require "classic"
    require "shape"
    require "rectangle"
    r1 = Rectangle()
    r2 = Rectangle()
end
```

```lua
--! file: rectangle.lua
Rectangle = Shape:extend()

function Rectangle:new(x, y, width, height)
    Rectangle.super.new(self, x, y)
    self.width = width
    self.height = height
end

function Rectangle:draw()
    love.graphics.rectangle("line", self.x, self.y, self.width, self.height)
end
```

通過 `Rectangle = Shape:extend()`，我們讓 `Rectangle` 成為了 `Shape` 的子類。

`Shape` 自己也有一個 `:new()` 函數。當我們定義 `Rectangle:new()` 時，就覆蓋了原本的函數。也就是說，當調用 `Rectangle()` 時，將執行 `Rectangle:new()`，而不是 `Shape:new()`。

不過 `Rectangle` 擁有名為 `super` 的屬性，它指向 `Rectangle` 繼承的那個類。通過 `Rectangle.super` 我們可以訪問基類的函數，並用它來調用 `Shape:new()`。

因為我們不是以實例的方式調用該函數，所以需要手動把 `self` 作為第一個參數傳入，不能讓 Lua 用冒號（:）幫我們處理。

接下來我們需要製作一個圓形類。新建文件 `circle.lua`，寫入下面的代碼。

```lua
--! file: circle.lua
Circle = Shape:extend()

function Circle:new(x, y, radius)
    Circle.super.new(self, x, y)
    -- 圓形沒有寬度或高度，只有半徑。
    self.radius = radius
end


function Circle:draw()
    love.graphics.circle("line", self.x, self.y, self.radius)
end
```

我們讓 `Circle` 繼承 `Shape`，並通過 `Circle.super.new(self, x, y)` 把 `x` 與 `y` 傳給 `Shape` 的 `new()` 函數。

然後給 `Circle` 類提供自己的繪製函數。這就是繪製圓形的方式。圓沒有寬和高，而是半徑。

現在在 `main.lua` 中加載 `shape.lua` 和 `circle.lua`，並把 `r2` 改成圓。

```lua
--! file: main.lua

function love.load()
    Object = require "classic"
    -- 別忘了加載文件
    require "shape"

    require "rectangle"

    -- 別忘了加載文件
    require "circle"

    r1 = Rectangle(100, 100, 200, 50)

    -- 把 r2 變成 Circle，而不是 Rectangle
    r2 = Circle(350, 80, 40)
end
```

現在運行遊戲，你會看到一個移動的矩形和一個移動的圓。

![](/images/book/11/moving_rectangle_circle.gif)

___

## 再來一遍

我們再把所有代碼過一遍。

首先用 `require "classic"` 加載 classic 庫。加載這個庫會返回一個表，我們把它存進 `Object`。它提供了模擬類所需的最基礎功能。因為 Lua 自身沒有類，藉助 `classic` 可以非常好地模擬類。

接著加載 `shape.lua`。在那個文件裡我們創建了一個名為 `Shape` 的新類。這個類將作為 `Rectangle` 和 `Circle` 的*基類*。這兩個類都擁有 `x` 和 `y` 屬性，並且會水平移動，這些共同點都放進 `Shape`。

然後我們創建 `Rectangle` 類，讓它繼承基類 `Shape`。在 `:new()` 函數（也就是構造函數）裡，我們通過 `Rectangle.super.new(self, x, y)` 調用基類的構造函數。我們把 `self` 作為第一個參數傳入，以便 `Shape` 使用實例本身，而不是藍圖本身。之後再給矩形添加 `width` 和 `height` 屬性，並實現它的繪製函數。

接下來對圓形做同樣的事情，只不過它用的是 `radius` 屬性，而不是寬和高。

當類準備好之後，我們就可以實例化它們。`r1 = Rectangle(100, 100, 200, 50)` 會創建一個 `Rectangle` 類的實例。它是根據藍圖構造出來的對象，而不是藍圖本身，對這個實例的修改不會影響類。我們更新並繪製這個實例時使用冒號語法，因為需要把實例作為第一個參數傳入，冒號會幫我們自動完成這一步。

最後我們對 `r2` 做相同的事情，只不過它是 `Circle`。

___

## 迷惑了嗎？

這一章包含了大量信息，如果你暫時覺得難以理解也是很正常的。我的建議是繼續跟著教程練習。如果你是編程新手，掌握這些新概念需要一些時間，但最終你會習慣它們。在講解新內容的同時，我也會不斷回顧舊概念。

___

## 做得更規範

在這個教程裡我為了方便使用了全局變量。但更規範的做法是使用局部變量。

我們需要對類做兩點修改：

1. 在文件中把類聲明為局部變量。
2. 在文件末尾返回這個變量。

下面是 `shape.lua` 的改法：

```lua
--! file: shape.lua
local Shape = Object:extend()

function Shape:new(x, y)
    self.x = x
    self.y = y
    self.speed = 100
end


function Shape:update(dt)
    self.x = self.x + self.speed * dt
end

return Shape
```

然後在其他類的文件裡，我們通過 `require` 載入 shape 文件，並把它的返回值賦給一個變量，就像處理 classic 那樣。

```lua
--! file: rectangle.lua
-- 這裡的變量名隨便取什麼都可以，不過保持一致會更好。
local Shape = require "shape"

-- 也把 Rectangle 設為局部變量。
local Rectangle = Shape:extend()

function Rectangle:new(x, y, width, height)
    Rectangle.super.new(self, x, y)
    self.width = width
    self.height = height
end

function Rectangle:draw()
    love.graphics.rectangle("line", self.x, self.y, self.width, self.height)
end

-- 最後把它返回。
return Rectangle
```

最後，在 `main.lua` 裡我們同樣可以創建局部變量。

```lua
--! file: main.lua

function love.load()
    Object = require "classic"
    -- 不再需要在這裡 require shape。

    local Rectangle = require "rectangle"

    local Circle = require "circle"

    r1 = Rectangle(100, 100, 200, 50)

    r2 = Circle(350, 80, 40)
end
```

我們也可以把 `Object = require "classic"` 移到 `shape.lua` 中，並將其設為局部變量。`r1` 和 `r2` 也可以設為局部變量，但需要在 `love.load` 外部聲明。

```lua
--! file: main.lua

-- 把變量設為局部後，r1 和 r2 就不再是全局變量。
local r1, r2

function love.load()
    Object = require "classic"

    local Rectangle = require "rectangle"

    local Circle = require "circle"

    r1 = Rectangle(100, 100, 200, 50)

    r2 = Circle(350, 80, 40)
end
```

這些額外的步驟看起來似乎只是重複勞動，但能讓代碼更加整潔。想像一下，如果你的遊戲裡有一個全局變量 `score`，而遊戲中還有一個帶自己得分系統的小遊戲，就可能會意外覆蓋全局的 `score`，結果你會困惑為什麼分數不對。全局變量可以使用，但請謹慎使用。

___

## 總結

類就像藍圖。我們可以從一個類創建多個對象。為了模擬類，我們使用 classic 庫。可以通過 `ClassName = Object:extend()` 創建類，通過 `instanceName = ClassName()` 創建實例，它會調用 `ClassName:new()` 函數，也就是構造函數。類的每個函數都應該以 `self` 作為第一個參數，這樣在調用函數時就能把實例作為首個參數傳入（`instanceName.functionName(instanceName)`）。我們可以使用冒號語法（:）讓 Lua 自動完成這一步。

可以用 `ExtensionName = ClassName:extend()` 擴展一個類。這樣 `ExtensionName` 就是 `ClassName` 的副本，我們可以在不修改 `ClassName` 的前提下為它添加屬性。如果我們在 `ExtensionName` 中定義了與 `ClassName` 同名的函數，仍然可以通過 `ExtensionName.super.functionName(self)` 調用原函數。

通過使用局部變量，代碼將更加整潔且易於維護。
