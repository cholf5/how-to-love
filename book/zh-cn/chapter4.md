# 第4章 - LÖVE

## 什么是 LÖVE？
LÖVE 是我们称之为*框架*的东西。简单来说：它是一种让编写游戏更加容易的工具。

LÖVE 是用 *C++* 和 *OpenGL* 编写的，这两者都被认为非常难。LÖVE 的源代码非常复杂。但所有这些复杂代码让我们制作游戏变得更容易。

例如，使用 `love.graphics.ellipse()`，我们可以绘制一个椭圆。这是它背后的源代码：

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

你可能完全看不懂上面的代码（我自己也几乎看不懂），这正是我们使用 LÖVE 的原因。它负责处理编写游戏中困难的部分，把有趣的部分留给我们。

___

## Lua

Lua 是 LÖVE 所使用的编程语言。Lua 本身就是一门编程语言，并不是 LÖVE 制作的，也不是专门为 LÖVE 设计的。LÖVE 的创建者只是选择 Lua 作为他们框架的语言。

那么我们写的代码中哪些是 LÖVE，哪些是 Lua 呢？很简单：所有以 `love.` 开头的内容都是 LÖVE 框架的一部分。其他一切都是 Lua。

这些函数属于 LÖVE 框架：

```lua
love.graphics.circle("fill", 10, 10, 100, 25)
love.graphics.rectangle("line", 200, 30, 120, 100)
```

而这段就是纯 Lua：

```lua
function test(a, b)
        return a + b
end
print(test(10, 20))
--Output: 30
```

如果你仍然觉得困惑，也没关系。现在这不是最重要的事情。

___


## LÖVE 是如何工作的？

___

*此时你需要已经安装好 LÖVE。如果还没有，请返回[第1章](1)。*
___

LÖVE 会调用 3 个函数。首先它会调用 love.load()。我们会在这里创建变量。

之后它会不断按照顺序反复调用 love.update() 和 love.draw()。

所以：love.load -> love.update -> love.draw -> love.update -> love.draw -> love.update，如此往复。

在幕后，LÖVE 会调用这些函数，而我们需要创建它们，并在其中填入代码。这就是我们所说的*回调*。

LÖVE 由若干*模块*组成，love.graphics、love.audio、love.filesystem 等。大约有 15 个模块，每个模块专注于一件事情。你绘制的所有内容都由 love.graphics 完成，任何与声音有关的事情都由 love.audio 处理。

目前，让我们专注于 love.graphics。

LÖVE 有一个[维基](https://www.love2d.org/wiki/Main_Page)，其中为每个函数提供解释。假设我们想要绘制一个矩形。在维基上我们进入[`love.graphics`](https://www.love2d.org/wiki/love.graphics)，然后在页面上搜索“rectangle”。在那里我们会找到[`love.graphics.rectangle`](https://www.love2d.org/wiki/love.graphics.rectangle)。

[![](/images/book/4/rectangle.png "love2d.org/wiki/love.graphics.rectangle")](https://www.love2d.org/wiki/love.graphics.rectangle)

该页面告诉我们这个函数的作用以及它需要哪些参数。第一个参数是 `mode`，需要是 `DrawMode` 类型。我们可以点击[`DrawMode`](https://www.love2d.org/wiki/DrawMode)来获取关于该类型的更多信息。

[![](/images/book/4/drawmode.png "love2d.org/wiki/DrawMode")](https://www.love2d.org/wiki/DrawMode)

DrawMode 是一个字符串，可以是 "fill" 或 "line"，用于控制形状的绘制方式。

剩余的参数都是数字。

因此，如果我们想要绘制一个填充的矩形，可以这样做：
```lua
function love.draw()
        love.graphics.rectangle("fill", 100, 200, 50, 80)
end
```

现在当你运行游戏时，就会看到一个填充的矩形。

![](/images/book/4/example_rectangle.png)

LÖVE 提供的函数就是我们所说的 API。API 是 [Application Programming Interface](https://en.wikipedia.org/wiki/Application_programming_interface) 的缩写。你可以阅读维基百科文章了解 API 的确切含义，但在这里它简单地指你可以使用的 LÖVE 函数。

___

## 总结
LÖVE 是一个让我们更容易制作游戏的工具。LÖVE 使用一种叫 Lua 的编程语言。所有以 `love.` 开头的内容都是 LÖVE 框架的一部分。维基告诉我们如何使用 LÖVE 所需的全部信息。
