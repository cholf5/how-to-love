# 第 9 章 - 多文件与作用域

## 多文件

使用多个文件可以让代码更有条理，也更易于浏览。新建一个名为 `example.lua` 的文件。确保它和一个全新且为空的 `main.lua` 位于同一目录。

在这个文件里创建一个变量。我会在代码块顶部加上 `--! file:`，以明确代码应该放在哪个文件里。这里只是为了本教程方便说明，它没有任何功能（毕竟只是注释），你不需要真正把它复制进去。如果接下来的教程里某个代码块没有出现这行，那就表示代码要么写在 main.lua，要么写在之前提到的那个文件里。

```lua
--! file: example.lua
test = 20
```

现在在 `main.lua` 里写上 `print(test)`。当你运行游戏时，会发现 `test` 的值是 `nil`。这是因为我们必须先加载那个文件。我们可以使用 `require`，把文件名作为字符串传入第一个参数。

```lua
--! file: main.lua
-- 省略 .lua 后缀
-- 暂时也不需要写 love.load 之类的内容
require("example")
print(test)
```

我们不给文件名加上 `".lua"`，因为 Lua 会自动帮我们补上。

你也可以把文件放在子目录里，但那样就需要写上完整路径。

```lua
-- 在 require 里路径分隔使用 . 而不是 /
require("path.to.example")
```

此时再次打印 `test`，在加载过 `example.lua` 之后，你应该能看到输出为 20。

在这种情况下，`test` 是我们所说的*全局变量*（简称 *global*）。也就是可以在整个项目里都使用的变量。与之相对的是*局部变量*（简称 *local*）。只要在变量名前加上 `local` 就能创建局部变量。

```lua
--! file: example.lua
local test = 20
```

重新运行游戏会发现 `test` 又变成 `nil` 了。这是因为它的*作用域*发生了变化。

---

## 作用域

局部变量只能在它们的*作用域*内使用。以上面的 `test` 为例，它的作用域就是文件 `example.lua`。这意味着 `test` 可以在这个文件中的任意位置使用，但在其他文件里则不可见。

如果我们在一个*代码块*内创建局部变量，比如函数、if 语句或 for 循环，那这个代码块就是该变量的作用域。

```lua
--! file: example.lua
if true then
    local test = 20
end

print(test)
-- 输出：nil
```

`test` 会是 `nil`，因为我们在它的作用域之外打印它。

函数的参数和局部变量类似，它们只存在于函数内部。

想要真正理解作用域是如何工作的，可以看看下面的代码：

```lua
--! file: main.lua
test = 10
require("example")
print(test)
-- 输出：10
```

```lua
--! file: example.lua
local test = 20

function some_function(test)
    if true then
        local test = 40
        print(test)
        -- 输出：40
    end
    print(test)
    -- 输出：30
end

some_function(30)

print(test)
-- 输出：20
```

运行游戏后，输出顺序应该是：40、30、20、10。我们一步步分析这段代码。

首先我们在 `main.lua` 中创建变量 `test`，但在打印它之前就先 `require` 了 `example.lua`。

在 `example.lua` 里我们创建了一个局部变量 `test`，它不会影响 `main.lua` 中的全局变量。也就是说，局部变量被赋的值并不会传递给全局变量。

我们创建了一个名为 `some_function(test)` 的函数，并在后面调用它。

在这个函数里，参数 `test` 不会影响我们之前创建的那个局部变量。

在 if 语句内部我们又创建了一个名为 `test` 的局部变量，它同样不会影响函数参数 `test`。

第一次打印发生在 if 语句内部，输出 40。离开 if 语句后再次打印 `test`，现在输出 30，也就是我们作为参数传入的值。if 语句里的 `test` 不会影响到参数 `test`；在 if 内部，那个局部变量拥有比参数更高的优先级。

在函数外部我们也打印了 `test`。这一次得到的是 20。`example.lua` 开头创建的局部变量并没有被函数内部的 `test` 影响。

最后我们在 `main.lua` 里打印 `test`，结果是 10。全局变量同样不受 `example.lua` 中局部变量的影响。

为了让每个 `test` 的作用域更加清晰，我做了一个可视化示意图：

![](/images/book/9/scope.png)

在创建局部变量时，并不一定要立刻赋值。

```lua
local test
test = 20
```

## 返回值

如果在文件的顶层（也就是不在任何函数里）写了 return 语句，当你通过 `require` 加载这个文件时，它就会返回该值。

举个例子：

```lua
--! file: example.lua
local test = 99
return test
```
```lua
--! file: main.lua
local hello = require "example"
print(hello)
-- 输出：99
```

## 何时使用局部变量？

最佳实践是始终优先使用局部变量。主要原因是，使用全局变量更容易犯错。你可能会在不同位置不小心重复使用同一个变量，使得在位置 1 修改的值在位置 2 会变得莫名其妙。如果某个变量只会在特定作用域内使用，就把它设为局部变量。

上一章中我们写了一个创建矩形的函数。这个函数里其实可以把变量 `rect` 声明为局部变量，因为它只在函数内部使用。虽然我们仍会在函数外使用这个矩形，但我们是通过把它加入表 `listOfRectangles`，再从表里访问的。

我们没有把 `listOfRectangles` 声明为局部变量，是因为它会在多个函数里使用。

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

    -- 把新矩形放进列表
    table.insert(listOfRectangles, rect)
end
```

不过我们仍然可以在 `love.load` 函数外部创建这个变量，从而让它保持为局部变量。

```lua
-- 在这里声明后，我们就能在整个文件里访问它
local listOfRectangles = {}

function love.load()
    -- 既然它已经是空表了，这个函数现在可以删掉
end
```

那么什么时候可以使用全局变量呢？对此大家意见不一。有些人会告诉你绝不要使用全局变量。我会告诉你，尤其是对初学者来说，如果确实需要在多个文件中使用同一个变量，使用全局变量是可以的。最好这种变量在创建后就不要再修改（重新赋值）。这类似于 `love` 这个全局变量：它从来不会改变。

需要注意的是，在整个教程中我用了不少全局变量，但那只是为了让代码更短、更容易讲解。

---

## 小结

使用 `require` 可以加载其它 Lua 文件。创建的变量默认可以在所有文件里使用；除非把它声明为局部变量，这样它就只能在自己的作用域内生效。局部变量不会影响作用域之外同名的变量。尽量使用局部变量而不是全局变量，它们执行起来也更快。
