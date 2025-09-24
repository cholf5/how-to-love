___
*我们沿用上一章的代码。*
___
使用 if 语句，我们可以让某段代码只在满足特定条件时才会执行。

你可以这样创建一个 if 语句：
```lua
if condition then
    -- 代码
end
```

条件（也称为语句）要么为真，要么为假。

例如：`5 > 9`

`>` 表示“大于”。所以这句话是“5 大于 9”，它是假的。

请把一个 if 语句包在增加 x 的代码外面。

```lua
function love.update(dt)
    if 5 > 9 then
        x = x + 100 * dt
    end
end
```

运行游戏时你会注意到矩形没有移动。这是因为条件为假。如果我们把条件改成 `5 < 9`（5 小于 9），那么条件为真，if 语句中的代码就会执行。

借此，我们就可以让 `x` 增长到 600，然后停止移动，条件是 `x < 600`。

```lua
function love.update(dt)
    if x < 600 then
        x = x + 100 * dt
    end
end
```

![](/images/book/6/rectangle_stop.gif)

如果我们想要检查一个值是否等于另一个值，需要使用两个等号（==）。

例如：`4 == 7`

一个等号用来赋值，两个等号用来比较。

```lua
x = 10 -- 把 10 赋值给 x
x == 10 -- 把 x 和 10 进行比较
```

我们还可以使用 `>=` 和 `<=` 来判断一个值是否大于等于另一个值，或是小于等于另一个值。

```lua
10 <= 10 -- true，10 等于 10
15 >= 4 -- true，15 大于 4
```

所以上面的代码相当于以下写法的简写：
```lua
10 == 10 or 10 < 10
15 == 4 or 15 > 4
```

## 布尔值

变量也可以是 `true` 或 `false`。这种变量类型称为布尔值（boolean）。

让我们创建一个名为 `move` 的新变量，赋值为 `true`，并在 if 语句中检查 `move` 是否为 `true`。

```lua
function love.load()
    x = 100
    move = true
end

function love.update(dt)
    -- 记得用两个等号！
    if move == true then
        x = x + 100 * dt
    end
end
```

`move` 是 `true`，所以矩形会移动。不过 `move == true` 实际上是多余的。我们是在检查“`move` 的值是 `true`”是否成立。直接把 `move` 当作条件就足够了。

```lua
if move then
    x = x + 100 * dt
end
```

如果我们想检查 `move` 是否为 `false`，可以在它前面加上 `not`。

```lua
if not move then
    x = x + 100 * dt
end
```

如果我们想检查一个数字是否不等于另一个数字，就使用波浪号（~）。

```lua
if 4 ~= 5 then
    x = x + 100 * dt
end
```

我们还可以把语句的结果赋值给变量，使其为 `true` 或 `false`。

例如：`move = 6 > 3`。

如果我们先检查 move 是否为 true，然后在 if 语句内部把 move 改为 false，也不会立刻跳出 if 语句。下面的代码仍然会继续执行。

```lua
if move then
    move = false
    print("这一行仍然会被执行！")
    x = x + 100 * dt
end
```

## 方向键
让我们基于是否按住右方向键来移动矩形。为此我们使用函数 `love.keyboard.isDown` [(wiki)](https://www.love2d.org/wiki/love.keyboard.isDown)。

注意 Down 的首字母是大写的。这种大小写方式称为驼峰命名（camelCase）。我们把第一个单词的首字母写成小写，之后每个单词的首字母写成大写。在本教程中，我们的变量也会使用这种命名方式。

把字符串 "right" 作为第一个参数传入，即可检查右方向键是否被按下。
```lua
if love.keyboard.isDown("right") then
    x = x + 100 * dt
end
```

这样只有在按住右方向键时，矩形才会移动。

![](/images/book/6/rectangle_right.gif)

我们还可以使用 `else` 来告诉游戏当条件为 `false` 时该做什么。让我们在没有按右方向键时，使矩形向左移动。

```lua
if love.keyboard.isDown("right") then
    x = x + 100 * dt
else
    x = x - 100 * dt -- 把 x 的值减小
end
```

如果第一个条件为假，我们还可以用 `elseif` 检查另一个条件。让我们在检查右方向键后（未按下），再检查左方向键是否按下。

```lua
if love.keyboard.isDown("right") then
    x = x + 100 * dt
elseif love.keyboard.isDown("left") then
    x = x - 100 * dt
end
```

试着让矩形也能上下移动。

___

## and 与 or
使用 `and` 可以检查多个条件是否同时为真。

 ```lua
if 5 < 9 and 14 > 7 then
    print("两个条件都为真")
end
```

使用 `or` 时，只要任意条件为真，if 语句就会执行。

 ```lua
if 20 < 9 or 14 > 7 or 5 == 10 then
    print("这些条件里至少有一个为真")
end
```


___

## 还有一件事
更准确地说，if 语句会检查条件是否“不是 `false` 或 `nil`”。
```lua
if true then print(1) end -- 不是 false 或 nil，会执行。
if false then print(2) end -- false，不会执行。
if nil then print(3) end -- nil，不会执行。
if 5 then print(4) end -- 不是 false 或 nil，会执行。
if "hello" then print(5) end -- 不是 false 或 nil，会执行。
-- 输出：1、4、5
```

___

## 总结
借助 if 语句，我们可以让某段代码只在条件满足时执行。我们可以检查一个数字是否大于、小于或等于另一个数字/值。变量可以是 true 或 false，这种变量被称为布尔值。我们可以使用 `else` 告诉游戏在条件为假时执行什么，或者使用 `elseif` 来进行其他检查。
