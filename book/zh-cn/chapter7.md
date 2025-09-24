# 第 7 章 - 表和 for 循环

## 表

表（table）本质上就是我们可以存储值的列表。

可以用花括号（{ }）创建一个表：

```lua
function love.load()
    fruits = {}
end
```

我们刚刚创建了一个名为 fruits 的表。现在可以往这个表里存储值。有多种方法可以做到。

一种方式是在花括号里直接写入值。

```lua
function love.load()
    -- 每个值之间用逗号分隔，就像参数和实参一样
    fruits = {"apple", "banana"}
end
```

我们还可以使用函数 `table.insert`。第一个参数是表，第二个参数是我们想要存放进表里的值。

```lua
function love.load()
    -- 每个值之间用逗号分隔，就像参数和实参一样
    fruits = {"apple", "banana"}
    table.insert(fruits, "pear")
end
```

这样在执行完 love.load 之后，我们的表里就包含了 `"apple"`、`"banana"` 和 `"pear"`。为了证明这一点，我们把这些值显示在屏幕上。为此我们会使用 `love.graphics.print(text, x, y)`。

```lua
function love.draw()
    -- 参数：(文本，x 坐标，y 坐标)
    love.graphics.print("Test", 100, 100)
end
```

运行游戏时，你应该会看到文本 "test"。我们可以通过写出表名，然后加上方括号（[ ]）来访问表中的值（注意是方括号而不是花括号！）。在方括号里写入我们想要的那个值所在的位置。

![](/images/book/7/table.png)

如前所述，表是一个值的列表。我们先添加了 `"apple"` 和 `"banana"`，所以它们分别位于列表的第 1 位和第 2 位。之后我们又添加了 `"pear"`，于是它位于列表的第 3 位。由于我们只添加了 3 个值，所以第 4 位目前还没有值。

如果我们想打印 `"apple"`，就得取出列表中的第一个值。

```lua
function love.draw()
    love.graphics.print(fruits[1], 100, 100)
end
```

这样就会绘制出 `"apple"`。如果把 `[1]` 换成 `[2]`，就会得到 `"banana"`，换成 `[3]` 则会得到 `"pear"`。

接下来我们想把 3 个水果都画出来。我们当然可以调用 3 次 love.graphics.print，每次传入不同的表元素……

```lua
function love.draw()
    love.graphics.print(fruits[1], 100, 100)
    love.graphics.print(fruits[2], 100, 200)
    love.graphics.print(fruits[3], 100, 300)
end
```

……但想象一下如果表里有 100 个值。幸运的是，我们有解决方案：for 循环！

___

## for 循环

for 循环可以把某段代码重复执行指定次数。

可以像这样创建 for 循环：

```lua
function love.load()
    fruits = {"apple", "banana"}
    table.insert(fruits, "pear")

    for i=1,10 do
        print("hello", i)
    end
end
```

运行游戏时你应该会看到它打印出 hello 1、hello 2、hello 3，一直到 10。

要创建一个 for 循环，先写 `for`。接着写一个变量并赋给它一个数值，这就是 for 循环的起点。这个变量可以随便命名，但惯例上会使用 `i`。这个变量只能在 for 循环内部使用（就像函数的参数一样）。然后写上它要计数到的终点数字。例如 `for i=6,18 do` 会从 6 开始循环，到 18 为止。

还有第三个可选的数字，表示变量每次增加多少。`for i=6,18,4 do` 的序列就是：6、10、14、18。通过它也可以让 for 循环用 -1 之类的步长倒序执行。

我们的表是从 1 开始，并且有 3 个值，所以我们会这样写：

```lua
function love.load()
    fruits = {"apple", "banana"}
    table.insert(fruits, "pear")

    for i=1,3 do
        print(fruits[i])
    end
end
```

运行游戏时你会看到它打印出了 3 个水果。第一次循环打印 `fruits[1]`，第二次打印 `fruits[2]`，第三次打印 `fruits[3]`。

___

## 编辑表

如果我们往表里添加或删除一个值，就得把 3 换成其他数字。为此我们会用 `#fruits`。在 `#` 号后面写表名，就能得到表的长度。表的长度指的是表中元素的数量。在我们的例子里长度是 `3`，因为 `fruits` 表里有 `apple`、`banana` 和 `pear` 这三个条目。

```lua
function love.load()
    fruits = {"apple", "banana"}

    print(#fruits)
    -- 输出：2

    table.insert(fruits, "pear")

    print(#fruits)
    -- 输出：3

    for i=1,#fruits do
        print(fruits[i])
    end
end
```

运用这点知识，我们来绘制全部 3 个水果。

```lua
function love.draw()
    for i=1,#fruits do
        love.graphics.print(fruits[i], 100, 100)
    end
end
```

运行游戏会发现它确实绘制了 3 个水果，不过它们都画在同一个位置。我们可以通过让每个数字对应不同的高度来修正这个问题。

```lua
function love.draw()
    for i=1,#fruits do
        love.graphics.print(fruits[i], 100, 100 + 50 * i)
    end
end
```

这样 `"apple"` 会绘制在 y 坐标 100 + 50 * 1，也就是 150 的位置。然后 `"banana"` 会绘制在 200，`"pear"` 会绘制在 250。

![](/images/book/7/fruits.png)

如果我们再添加一个水果，就不用改任何东西。它会自动被绘制出来。让我们添加 `"pineapple"`。

```lua
function love.load()
    fruits = {"apple", "banana"}
    table.insert(fruits, "pear")
    table.insert(fruits, "pineapple")
end
```

我们也可以从表里移除值。为此我们会用 `table.remove`。第一个参数是我们要删除元素的表，第二个参数是我们要删除的位置。如果想删除 banana，就像这样：

```lua
function love.load()
    fruits = {"apple", "banana"}
    table.insert(fruits, "pear")
    table.insert(fruits, "pineapple")
    table.remove(fruits, 2)
end
```

运行游戏会看到 banana 不再被绘制，而 pear 和 pineapple 都往上挪了一格。

![](/images/book/7/shift.png)

当你用 `table.remove` 从表里移除一个值时，表里后续的所有元素都会往前移动。所以原本在第 3 位的现在会变成第 2 位，原本在第 4 位的现在会变成第 3 位。

你也可以直接在表里新增或修改值。例如，我们可以把 `"apple"` 改成 `"tomato"`：

```lua
function love.load()
    fruits = {"apple", "banana"}
    table.insert(fruits, "pear")
    table.insert(fruits, "pineapple")
    table.remove(fruits, 2)
    -- 把表中第 1 个位置的值改成 "tomato"
    fruits[1] = "tomato"
end
```

___

## ipairs

回到 for 循环。其实还有另一种、更方便的方式来遍历表，那就是使用 `ipairs` 循环。

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
    -- 输出：
    -- 1, "tomato"
    -- 2, "pear"
    -- 3, "pineapple"
end
```

这个 for 循环会遍历（iterate）表中的所有值。变量 `i` 表示当前位置，变量 `v` 是该位置上的值。它基本上相当于 `fruits[i]` 的简写。例如，在第一次迭代中，变量 `i` 的值为 `1`，`v` 的值为 `"apple"`；在第二次迭代中，`i` 和 `v` 分别是 `2` 和 `"pear"`。

那么它是如何工作的？为什么 `ipairs` 函数可以做到这一点？这个我们之后再深入探讨。现在只需要知道，`ipairs` 基本上等价于如下代码：

```lua
for i=1, #fruits do
    v = fruits[i]
end
```

让我们使用 `ipairs` 来绘制表里的内容。

```lua
function love.draw()
    -- i 和 v 都是变量，所以我们想怎么命名都可以
    for i,frt in ipairs(fruits) do
        love.graphics.print(frt, 100, 100 + 50 * i)
    end
end
```

___

## 总结
表是可以存储多个值的列表。我们在创建表时、通过 `table.insert`，或者通过 `table_name[1] = "some_value"` 等方式把值放进去。我们可以用 `#table_name` 获取表的长度。for 循环可以让我们重复执行一段代码，也可以用来遍历表。
