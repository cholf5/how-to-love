# 第 20 章 - 调试

Bug 指的是程序（在这里是游戏）中出现的问题。调试就是修复这些 Bug，让它们不再发生。作为程序员，遇到各种各样的 Bug 是再正常不过的事，因此调试是一项非常宝贵的技能。

我写了一个小小游戏。

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

按下 `space` 应该会发射一颗子弹。至少理论上如此，但实际上却没有任何反应，没有子弹出现。我们来找出原因。

我能想到的可能原因有：

* 并没有真正发射子弹。
* 发射了子弹，但绘制代码有问题。
* 绘制了子弹，但位置不对。

为了弄清问题出在哪，我们可以使用 `print`。例如把 `print` 放到 `love.update` 的 for 循环里，检查子弹的 x 坐标，以及循环是否真的被执行。因为如果子弹根本没有生成，`print` 永远不会运行。

```lua
function love.update(dt)
    for i,v in ipairs(bullets) do
        v.x = v.x + 400 * dt
        print(v.x)
    end
end
```

记得可以在 `main.lua` 顶部加入下面的代码，这样输出会立刻显示出来，不用关闭游戏窗口。

```lua
io.stdout:setvbuf("no")
```

运行游戏，按几次空格试试看。你会发现输出面板里没有任何内容。看起来我们并没有往 `bullets` 表里填东西。为了确认 `shoot` 函数有没有被调用，我们再在那里加一个 `print`。

```lua
function shoot()
    table.insert(bullets, {circle.x, circle.y})

    -- 你知道 print 可以接收无数个参数吗？
    print("How many bullets?", #bullets)
end
```

再试着射击，你会发现输出面板依旧没有任何打印。很奇怪啊，`if` 语句里写着 `if key == "space"`，我们明明按了空格。为了保险起见，让我们打印一下 `key` 的值。说不定我们把 `love.keypressed` 拼错了，导致根本没有执行到这段代码。

```lua
function love.keypressed()
    -- 像这样加入提示文字可以为输出提供上下文。
    -- 当你有很多 print 时特别有用。
    print("What is the key?", key)
    if key == "space" then
        shoot()
    end
end
```

再次尝试射击，你会看到这次确实有内容打印出来了。看起来 `key` 的值是 `nil`。这怎么可能？LÖVE 会把按键作为第一个参数传进来啊。不过等一下，我们的函数参数里并没有 `key`。定义函数时我忘记写了。修一下吧。

```lua
function love.keypressed(key)
    print("What is the key?", key)
    if key == "space" then
        shoot()
    end
end
```

好了，现在按下空格还是射不出子弹，但发生了别的事情：出现了一条错误信息。

___

## 阅读和修复错误

当代码尝试执行不可能完成的操作时就会报错。例如你无法把一个数字和字符串相乘，这会报错：

```lua
print(100 * "test")
```
![](/images/book/20/error1.png)

再比如尝试调用不存在的函数：

```lua
doesNotExist()
```

![](/images/book/20/error2.png)

在我们的发射子弹游戏里，出现的错误如下：

![](/images/book/20/error3.png)

那么这条错误究竟告诉了我们什么？很多初学者都会忽略这一点：错误信息其实已经准确指出了出错的原因和位置。

```
main.lua:10:
```

这一行告诉我们错误发生在第 10 行（你的行号可能不同）。

```
attempt to perform arithmetic on field 'x' (a nil value)
```

“Arithmetic” 指的是计算，比如使用 `+`、`-`、`*` 等。它尝试在字段 `x` 上进行计算，但 `x` 是 `nil`。

这就奇怪了，我们不是给表里加了 `x` 和 `y` 吗？其实并没有。我们只是把值插入了表里，却没有把它们赋给字段。把它修好吧。

```
function shoot()
    table.insert(bullets, {x = circle.x, y = circle.y})
end
```

现在终于可以射出子弹了！

我们再看一段新代码，我创建了一个 Circle 类并把它绘制了几次（不一定要跟着写）。

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

运行这段代码时我得到了如下错误：

![](/images/book/20/error4.png)

“Attempt to index” 表示它尝试访问某个属性。在这里，它试图在变量 `self` 上找到属性 `x`。但错误提示里说 `self` 是一个数字，所以当然不行。这是怎么发生的呢？我们用冒号（`:`）定义了函数，这样第一个参数就会自动是 `self`，并且我们也用冒号调用，这样 `self` 会作为第一个实参传入。但显然某个地方出了错。为了知道哪里出错，我们可以查看回溯（Traceback）。

错误信息的底部展示了在触发错误前代码执行的“路径”。要从下往上读。`xpcall` 那一行可以忽略。下一行写着 `main.lua:21: in function 'draw'`。有意思，去看看。啊哈，我明白了。在第 21 行我用了一个点号而不是冒号（`circle.draw(140)`）。把它改成冒号就正常了！

___

## 语法错误

*语法错误* 指的是游戏甚至无法启动，因为代码本身有问题。解析代码时无法理解它。例如还记得变量名不能以数字开头吗？如果你这么做就会报错：

![](/images/book/20/error5.png)

看看下面这段代码（同样不必跟着写）：

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

这段代码给了我如下错误：

![](/images/book/20/error6.png)

`<eof>` 的意思是 *文件结束*。它期望在文件末尾看到一个 `end`。那我们直接在文件末尾加一个 `end` 就行了吗？当然不行。是我在某处写错了，需要正确修复。错误提示说它期待的是在第 6 行的函数里找到 `end`，那就从那里开始往下检查。打开函数后我写了一个 if 语句，然后又写了一个 if。关闭第二个 if 后我又开始了另一个 if，然后也把它关闭，接着关闭最外层的 if。不对啊，那时我应该关闭函数才对。我在函数里漏了一个 `end`。修正如下：

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

现在就能运行了。这也是为什么缩进如此重要：它帮助你看清哪里出了类似的错误。

另一个常见的错误如下所示：

```lua
function love.load()
    t = {}
    table.insert(t, {x = 100, y = 50)
end
```

它会报出下面的错误：

![](/images/book/20/error7.png)

原因是我没有把花括号闭合。

```lua
function love.load()
    t = {}
    table.insert(t, {x = 100, y = 50})
end
```

___

## 寻求帮助

也许你遇到了一个 Bug，又怎么都修不好。你尝试过各种调试方法却始终找不到原因，于是觉得需要帮助。幸运的是，网上有很多人乐于助人。提问的最佳地点是 [论坛](https://www.love2d.org/forums/viewforum.php?f=4&sid=4764a2d3dfb4e22494fe4e6de08ec829) 或 [Discord](https://discord.gg/MHtXaxQ)。不过提问可不是一句“各位我遇到这个 Bug 了怎么办？”就完事。你需要提供足够的信息，别人才能帮助你。

例如：

* 具体出现了什么问题？你期望/希望发生什么？
* 说明你已经尝试过哪些解决方案。
* 展示你认为可能出错的代码位置。
* 分享 .love 文件，让其他人可以亲自运行。

不过在提问之前，你可以先搜索一下你的问题。说不定这是个常见问题，已经被回答过很多次了。

记住，没有人有义务帮你；愿意伸出援手的人也都是无偿的，所以要保持礼貌 :)

___

## 橡皮鸭调试法

你还可以准备一只橡皮鸭。这叫做[橡皮鸭调试法](https://en.wikipedia.org/wiki/Rubber_duck_debugging)。理念是：当你向别人解释自己的代码时，往往会意识到哪里写错了，并自己修好。既然如此，你完全可以把橡皮鸭当成听众。我自己就有一只，名字叫 Hendrik！

![](/images/book/20/hendrik.png)

___

## 总结
我们可以使用 `print` 来定位 Bug 的来源。错误信息会准确告诉我们哪里出了问题。语法错误是因为解析代码失败而产生的错误。良好的缩进可以帮助我们避免类似的漏写 `end` 错误。我们可以在网上寻求帮助，但要提供充分的信息，让帮助我们的人省些力气。
