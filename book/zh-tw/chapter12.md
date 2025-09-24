在 LÖVE 中創建和使用圖像非常簡單。首先我們需要一張圖片。我會使用這張圖：

![](/images/book/12/sheep.png)

當然，你可以使用任何喜歡的圖片，只要它是 *.png* 格式。請確保圖片與 `main.lua` 位於同一個文件夾中。

我們先要加載圖片，並把它存到一個變量裡。為此可以使用 `love.graphics.newImage(path)`，把圖片名稱作為字符串傳入第一個參數。如果你有：

```lua
function love.load()
    myImage = love.graphics.newImage("sheep.png")
end
```

也可以把圖片放在子目錄中，但要確保路徑寫完整。

```lua
myImage = love.graphics.newImage("path/to/sheep.png")
```

現在我們的圖片存放在變量 `myImage` 中。可以用 `love.graphics.draw` 把它繪製出來。

```lua
function love.draw()
    love.graphics.draw(myImage, 100, 100)
end
```

這就是如何繪製一張圖片。

___

## .draw() 的參數

我們來看一下 `love.graphics.draw()` 的全部參數。除了圖像本身，其他參數都是可選的。

**image**

要繪製的圖像。

**x** 和 **y**

希望繪製圖像的水平和垂直位置。

**r**

旋轉角度（或稱角度）。在 LÖVE 中所有角度都使用弧度。關於弧度會在其他章節進一步說明。

**sx** 和 **sy**

在 **x** 軸和 **y** 軸方向上的縮放。如果想把圖像放大到原來的兩倍，可以這樣寫：

`love.graphics.draw(myImage, 100, 100, 0, 2, 2)`

也可以利用這一點來鏡像圖像：

`love.graphics.draw(myImage, 100, 100, 0, -1, 1)`

**ox** 和 **oy**

圖像的 **x** 方向和 **y** 方向的原點。

默認情況下，縮放與旋轉都是圍繞圖像的左上角進行的。

![](/images/book/12/origin1.png)

原點就是基準點。如果我們希望圍繞圖像中心進行縮放，就需要把原點放到圖像的中心。

`love.graphics.draw(myImage, 100, 100, 0, 2, 2, 39, 50)`

![](/images/book/12/origin2.png)

**kx** 和 **ky**

用於剪切（shear）（雖然它們本身並沒有 **k** 開頭，我也不太清楚為什麼會這樣命名）。

通過它們可以讓圖像產生傾斜效果。

![](/images/book/12/shear.png)

我們之前用來繪製文本的 `love.graphics.print` 也有相同的參數。

x, y, r, sx, sy, ox, oy, kx, ky

再次強調，除了 **image** 之外，這些參數都可以省略。我們稱它們為「可選參數」。

你可以通過閱讀 [API 文檔](https://love2d.org/wiki/love.graphics.draw) 來了解 LÖVE 的函數。

___

## 圖像對象

`love.graphics.newImage` 返回的其實是一個對象，也就是 [Image](https://love2d.org/wiki/Image) 對象。它擁有一些函數，可以讓我們修改圖像或取得與圖像相關的數據。

例如，我們可以通過 `:getWidth()` 和 `:getHeight()` 獲得圖像的寬度和高度，從而把原點放在圖像中心。

```lua
function love.load()
    myImage = love.graphics.newImage("sheep.png")
    width = myImage:getWidth()
    height = myImage:getHeight()
end

function love.draw()
    love.graphics.draw(myImage, 100, 100, 0, 2, 2, width/2, height/2)
end
```

___

## 顏色

可以使用 `love.graphics.setColor(r, g, b)` 來改變繪製圖像時所使用的顏色。它會影響之後繪製的所有內容，不僅僅是圖像，還包括矩形、圖形和線條。它使用的是 [RGB 模型](https://en.wikipedia.org/wiki/RGB_color_model)。雖然該模型的正式取值範圍是 0 到 255，但在 LÖVE 中取值範圍是 0 到 1。因此 (255, 200, 40) 在這裡要寫成 (1, 0.78, 0.15)。如果你只知道 0-255 範圍內的顏色值，可以用 `number/255` 計算出需要的數值。還有第四個參數 `a` 表示 alpha，用來控制所有繪製內容的透明度。如果不希望其他繪製調用繼續使用當前顏色，別忘了把顏色重置為白色。背景色可以用 `love.graphics.setBackgroundColor(r, g, b)` 設置。由於它只需要調用一次，所以可以放在 `love.load` 中。

```lua
function love.load()
    myImage = love.graphics.newImage("sheep.png")
    love.graphics.setBackgroundColor(1, 1, 1)
end

function love.draw()
    love.graphics.setColor(255/255, 200/255, 40/255, 127/255)
    love.graphics.setColor(1, 0.78, 0.15, 0.5)
    -- 或者……
    love.graphics.draw(myImage, 100, 100)
    -- 不傳入 alpha 參數會自動把它恢復為 1。
    love.graphics.setColor(1, 1, 1)
    love.graphics.draw(myImage, 200, 100)
end
```

![](/images/book/12/color.png)

___

## 總結

我們使用 `myImage = love.graphics.newImage("path/to/image.png")` 加載圖像，它會返回一個 Image 對象，可以存放在變量中。把這個變量傳給 `love.graphics.draw(myImage)` 就能把圖像畫出來。這個函數還有一些可選參數，用於控制圖像的位置、角度和縮放。Image 對象提供了方法，可以獲取圖像相關的數據。可以通過 `love.graphics.setColor(r, g, b)` 改變圖像以及之後所有繪製內容的顏色。
