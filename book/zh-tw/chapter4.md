# 第4章 - LÖVE

## 什麼是 LÖVE？
LÖVE 是我們稱之為*框架*的東西。簡單來說：它是一種讓編寫遊戲更加容易的工具。

LÖVE 是用 *C++* 和 *OpenGL* 編寫的，這兩者都被認為非常難。LÖVE 的原始碼非常複雜。但所有這些複雜代碼讓我們製作遊戲變得更容易。

例如，使用 `love.graphics.ellipse()`，我們可以繪製一個橢圓。這是它背後的原始碼：

```cpp
void Graphics::ellipse(DrawMode mode, float x, float y, float a, float b, int points)
{
        float two_pi = static_cast<float>(LOVE_M_PI * 2);
        if (points <= 0) points = 1;
        float angle_shift = (two_pi / points);
        float phi = .0f;

        float *coords = new float[2 * (points + 1)];
        for (int i = 0; i < points; ++i, phi += angle_shift)
        {
                coords[2*i+0] = x + a * cosf(phi);
                coords[2*i+1] = y + b * sinf(phi);
        }

        coords[2*points+0] = coords[0];
        coords[2*points+1] = coords[1];

        polygon(mode, coords, (points + 1) * 2);

        delete[] coords;
}
```

你可能完全看不懂上面的代碼（我自己也幾乎看不懂），這正是我們使用 LÖVE 的原因。它負責處理編寫遊戲中困難的部分，把有趣的部分留給我們。

___

## Lua

Lua 是 LÖVE 所使用的程式語言。Lua 本身就是一門程式語言，並不是 LÖVE 製作的，也不是專門為 LÖVE 設計的。LÖVE 的創建者只是選擇 Lua 作為他們框架的語言。

那麼我們寫的代碼中哪些是 LÖVE，哪些是 Lua 呢？很簡單：所有以 `love.` 開頭的內容都是 LÖVE 框架的一部分。其他一切都是 Lua。

這些函數屬於 LÖVE 框架：

```lua
love.graphics.circle("fill", 10, 10, 100, 25)
love.graphics.rectangle("line", 200, 30, 120, 100)
```

而這段就是純 Lua：

```lua
function test(a, b)
        return a + b
end
print(test(10, 20))
--Output: 30
```

如果你仍然覺得困惑，也沒關係。現在這不是最重要的事情。

___


## LÖVE 是如何工作的？

___

*此時你需要已經安裝好 LÖVE。如果還沒有，請返回[第1章](1)。*
___

LÖVE 會調用 3 個函數。首先它會調用 love.load()。我們會在這裡創建變量。

之後它會不斷按照順序反覆調用 love.update() 和 love.draw()。

所以：love.load -> love.update -> love.draw -> love.update -> love.draw -> love.update，如此往復。

在幕後，LÖVE 會調用這些函數，而我們需要創建它們，並在其中填入代碼。這就是我們所說的*回調*。

LÖVE 由若干*模塊*組成，love.graphics、love.audio、love.filesystem 等。大約有 15 個模塊，每個模塊專注於一件事情。你繪製的所有內容都由 love.graphics 完成，任何與聲音有關的事情都由 love.audio 處理。

目前，讓我們專注於 love.graphics。

LÖVE 有一個[維基](https://www.love2d.org/wiki/Main_Page)，其中為每個函數提供解釋。假設我們想要繪製一個矩形。在維基上我們進入[`love.graphics`](https://www.love2d.org/wiki/love.graphics)，然後在頁面上搜索「rectangle」。在那裡我們會找到[`love.graphics.rectangle`](https://www.love2d.org/wiki/love.graphics.rectangle)。

[![](/images/book/4/rectangle.png "love2d.org/wiki/love.graphics.rectangle")](https://www.love2d.org/wiki/love.graphics.rectangle)

該頁面告訴我們這個函數的作用以及它需要哪些參數。第一個參數是 `mode`，需要是 `DrawMode` 類型。我們可以點擊[`DrawMode`](https://www.love2d.org/wiki/DrawMode)來獲取關於該類型的更多信息。

[![](/images/book/4/drawmode.png "love2d.org/wiki/DrawMode")](https://www.love2d.org/wiki/DrawMode)

DrawMode 是一個字符串，可以是 "fill" 或 "line"，用於控制形狀的繪製方式。

剩餘的參數都是數字。

因此，如果我們想要繪製一個填充的矩形，可以這樣做：
```lua
function love.draw()
        love.graphics.rectangle("fill", 100, 200, 50, 80)
end
```

現在當你運行遊戲時，就會看到一個填充的矩形。

![](/images/book/4/example_rectangle.png)

LÖVE 提供的函數就是我們所說的 API。API 是 [Application Programming Interface](https://en.wikipedia.org/wiki/Application_programming_interface) 的縮寫。你可以閱讀維基百科文章了解 API 的確切含義，但在這裡它簡單地指你可以使用的 LÖVE 函數。

___

## 總結
LÖVE 是一個讓我們更容易製作遊戲的工具。LÖVE 使用一種叫 Lua 的程式語言。所有以 `love.` 開頭的內容都是 LÖVE 框架的一部分。維基告訴我們如何使用 LÖVE 所需的全部信息。