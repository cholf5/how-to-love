让我们的游戏可以保存和读取进度吧。这意味着要写入和读取文件。不过在此之前我们得先有个游戏，于是我们做一个可以捡金币的小小游戏。

我们先从能够移动的玩家开始。

```lua
 function love.load()
    -- 创建一个包含 x、y 以及半径的玩家对象
    player = {
        x = 100,
        y = 100,
        size = 25
    }
end

function love.update(dt)
    -- 允许通过键盘移动
    if love.keyboard.isDown("left") then
        player.x = player.x - 200 * dt
    elseif love.keyboard.isDown("right") then
        player.x = player.x + 200 * dt
    end

    -- 注意这里重新开启了一个 if，而不是继续 elseif
    -- 这是因为否则你就没法斜向移动了。
    if love.keyboard.isDown("up") then
        player.y = player.y - 200 * dt
    elseif love.keyboard.isDown("down") then
        player.y = player.y + 200 * dt
    end
end

function love.draw()
    -- 玩家和金币都会被画成圆形
    love.graphics.circle("line", player.x, player.y, player.size)
end
```

为了好玩，我们给玩家画上一张脸。

![](/images/book/21/face.png)

```lua
 function love.load()
    -- 创建一个包含 x、y、半径的玩家对象
    player = {
        x = 100,
        y = 100,
        size = 25,
        image = love.graphics.newImage("face.png")
    }
end

function love.draw()
    love.graphics.circle("line", player.x, player.y, player.size)
    -- 将头像的原点设置为图片中心
    love.graphics.draw(player.image, player.x, player.y,
        0, 1, 1, player.image:getWidth()/2, player.image:getHeight()/2)
end
```

接下来我们要加上一些金币，它们会随机地分布在屏幕上。给金币也加一个小小的美元符号吧。

![](/images/book/21/dollar.png)

```lua
 function love.load()
    player = {
        x = 100,
        y = 100,
        size = 25,
        image = love.graphics.newImage("face.png")
    }

    coins = {}

    for i=1,25 do
        table.insert(coins,
            {
                -- 使用 math.random 得到随机位置
                x = math.random(50, 650),
                y = math.random(50, 450),
                size = 10,
                image = love.graphics.newImage("dollar.png")
            }
        )
    end
end

function love.update(dt)
    if love.keyboard.isDown("left") then
        player.x = player.x - 200 * dt
    elseif love.keyboard.isDown("right") then
        player.x = player.x + 200 * dt
    end

    if love.keyboard.isDown("up") then
        player.y = player.y - 200 * dt
    elseif love.keyboard.isDown("down") then
        player.y = player.y + 200 * dt
    end
end

function love.draw()
    love.graphics.circle("line", player.x, player.y, player.size)
    love.graphics.draw(player.image, player.x, player.y,
        0, 1, 1, player.image:getWidth()/2, player.image:getHeight()/2)

    for i,v in ipairs(coins) do
        love.graphics.circle("line", v.x, v.y, v.size)
        love.graphics.draw(v.image, v.x, v.y,
            0, 1, 1, v.image:getWidth()/2, v.image:getHeight()/2)
    end
end
```

现在我们要让玩家能够拾取金币。我们需要检测是否发生碰撞。方法是计算两者之间的距离，再判断这个距离是否小于两个圆的半径之和。

![](/images/book/21/circles_collision.png)

```lua
function checkCollision(p1, p2)
    -- 用一行就能算出距离
    -- x、y 相减后平方，再相加，然后开根号
    local distance = math.sqrt((p1.x - p2.x)^2 + (p1.y - p2.y)^2)
    -- 返回距离是否小于半径之和
    return distance < p1.size + p2.size
end
```

现在我们遍历所有金币并检测它们是否碰到玩家。让玩家每次捡到金币时都变大一点。

```lua
function love.update(dt)
    if love.keyboard.isDown("left") then
        player.x = player.x - 200 * dt
    elseif love.keyboard.isDown("right") then
        player.x = player.x + 200 * dt
    end

    if love.keyboard.isDown("up") then
        player.y = player.y - 200 * dt
    elseif love.keyboard.isDown("down") then
        player.y = player.y + 200 * dt
    end

    for i,v in ipairs(coins) do
        if checkCollision(player, v) then
            table.remove(coins, i)
            player.size = player.size + 1
        end
    end
end
```

![](/images/book/21/coin_grower.gif)

现在我们可以四处移动并拾取金币，真棒！不过在开始保存和读取之前，我们还想做一些调整。

如果你多重启几次游戏，会发现尽管圆的位置是随机的，它们每次都出现在相同的随机位置。

要修复这个问题，我们可以使用 `math.randomseed()`。你生成的随机数取决于一个数，我们称之为“种子（seed）”。由于我们没有改变种子，所以总能得到相同的位置。种子的好处在于它们就像随机性的钥匙，可以保存和分享。例如在《Minecraft》中，你可以分享生成世界时使用的种子，其他人就能得到同样的世界。

那我们用什么数作为种子呢？如果我们写 `math.randomseed(123)`，游戏仍然会得到相同的数。我们需要一个每次启动游戏都唯一的数字，可以使用 `os.time()`。这是 Lua 提供的函数，它会返回操作系统当前的时间（单位为秒），也就是每天 86400 个独一无二的数字！

不过更好的做法是使用 LÖVE 的数学库。LÖVE 的随机数生成器（rng）会自动用 `os.time()` 作为种子，并且整体上比 Lua 自带的 rng 更好、更随机。

```lua
 function love.load()
    player = {
        x = 100,
        y = 100,
        size = 25,
        image = love.graphics.newImage("face.png")
    }

    coins = {}

    for i=1,25 do
        table.insert(coins,
            {
                x = love.math.random(50, 650),
                y = love.math.random(50, 450),
                size = 10,
                image = love.graphics.newImage("dollar.png")
            }
        )
    end
end
```

还有一件让我在意的事情，就是我们移除金币时使用的 for 循环。虽然现在拾取金币没问题，但通常来说，当你遍历一个列表并在其中移除元素时，你应该使用更安全的写法。因为移除一个元素后列表会变短，从而扰乱 for 循环。

比如试试下面这段代码：

```lua
local test = {"a", "b", "c", "d", "e", "f", "g", "h", "i", "j"}
for i,v in ipairs(test) do
    table.remove(test, i)
end
print(#test)
-- 输出：5
```

结果是 5，也就是说它只移除了列表的一半。这是因为移除元素时其他元素会向前移动，从而被跳过。

![](/images/book/21/table_remove.png)

要解决这个问题，我们应该反向遍历表。这样就不会在移除元素后跳过其他元素。

![](/images/book/21/table_remove_reverse.png)

这意味着我们不会再使用 `ipairs`，而是改用普通的 for 循环，不过是倒着数。

```lua
function love.update(dt)
    if love.keyboard.isDown("left") then
        player.x = player.x - 200 * dt
    elseif love.keyboard.isDown("right") then
        player.x = player.x + 200 * dt
    end

    if love.keyboard.isDown("up") then
        player.y = player.y - 200 * dt
    elseif love.keyboard.isDown("down") then
        player.y = player.y + 200 * dt
    end

    -- 从末尾开始，直到 1，每次步长为 -1
    for i=#coins,1,-1 do
        -- 使用 coins[i] 而不是 v
        if checkCollision(player, coins[i]) then
            table.remove(coins, i)
            player.size = player.size + 1
        end
    end
end
```

好了，现在是时候开始保存游戏了。

___

## 保存

保存游戏的做法是先创建一个表，然后把我们想保存的信息放进去。那我们需要保存什么？比如玩家的位置、大小，以及那些尚未被拾取的金币的信息。我们来写一个 `saveGame()` 函数，把重要数据收集到表里。

```lua
function saveGame()
    data = {}
    data.player = {
        x = player.x,
        y = player.y,
        size = player.size
    }

    data.coins = {}
    for i,v in ipairs(coins) do
        -- 在这里 data.coins[i] = value 和 table.insert(data.coins, value) 是一样的
        data.coins[i] = {x = v.x, y = v.y}
    end
end
```

为什么只保存这些部分，而不是整个表呢？通常情况下你不想保存超出需求的数据。我们不需要存储图像的宽度和高度，因为它们始终相同。此外，玩家对象里包含一个图像对象，而我们无法保存 LÖVE 的对象。

既然我们已经拥有所需的信息，下一步就是*序列化*它。也就是说把这个表转换成我们能读取的东西。现在如果你打印一个表，得到的可能是 `table: 0x00e4ca20` 之类的内容，这并不是我们想保存的信息。

为了序列化这个表，我们要使用 *lume* —— *rxi* 开发的一个工具库。你可以在 [GitHub](https://github.com/rxi/lume) 找到它。

点击 `lume.lua`，再点击 Raw，然后[复制代码](https://raw.githubusercontent.com/rxi/lume/master/lume.lua)。

在你的文本编辑器中新建一个 `lume.lua` 文件，把代码粘贴进去。

在 `main.lua` 的 `love.load()` 顶部用 `lume = require "lume"` 将其载入。

Lume 提供了各种实用的函数，这个教程里我们需要的是 `serialize` 和 `deserialize`。我们先试试它。把 data 表序列化并打印出来。

```lua
function saveGame()
    data = {}
    data.player = {
        x = player.x,
        y = player.y,
        size = player.size
    }

    data.coins = {}
    for i,v in ipairs(coins) do
        -- 在这里 data.coins[i] = value 和 table.insert(data.coins, value) 是一样的
        data.coins[i] = {x = v.x, y = v.y}
    end

    serialized = lume.serialize(data)
    print(serialized)
end
```

在输出中你会看到这个表以可读的形式被打印出来。这正是我们将要保存到文件里的内容，下一步就是实现这一点。

我们可以通过 `love.filesystem` 模块（[wiki](https://www.love2d.org/wiki/love.filesystem)）创建、编辑和读取文件。要创建/写入文件，我们使用 `love.filesystem.write(filename, data)`（[wiki](https://www.love2d.org/wiki/love.filesystem.write)）。第一个参数是文件名，第二个参数是要写入文件的数据。

```lua
function saveGame()
    data = {}
    data.player = {
        x = player.x,
        y = player.y,
        size = player.size
    }

    data.coins = {}
    for i,v in ipairs(coins) do
        -- 在这里 data.coins[i] = value 和 table.insert(data.coins, value) 是一样的
        data.coins[i] = {x = v.x, y = v.y}
    end

    serialized = lume.serialize(data)
    -- 文件扩展名其实无所谓，甚至可以省略
    love.filesystem.write("savedata.txt", serialized)
end
```

现在我们要加上保存的触发方式。按下 *F1* 时执行保存。

```lua
function love.keypressed(key)
    if key == "f1" then
        saveGame()
    end
end
```

运行游戏，捡几个金币，然后按 F1。就这样，我们完成了第一份存档！那么存档在哪呢？如果你用的是 Windows，它会保存在 `AppData\\Roaming\\LOVE\\` 里。你可以按 Win + R，输入“appdata”并回车，随后进入 Roaming，再进入 LOVE。那里应该有一个和你 LÖVE 项目文件夹同名的目录，里面就有 `savedata.txt`。打开它就能看到我们写进去的表。

接下来我们要让游戏能够加载这些数据。

___

## 读取

要加载数据需要以下步骤：

* 检查存档文件是否存在
* 读取文件
* 把数据转换成表
* 将数据应用到玩家和金币上

我们先检查文件是否存在，如果存在就读取它。可以使用 `love.filesystem.getInfo(filename)` 和 `love.filesystem.read(filename)`。
`love.filesystem.getInfo(filename)` 如果文件存在就会返回一个包含信息的表，否则返回 `nil`。因为我们只关心文件是否存在，所以直接把这个函数放进 if 判断里即可，不需要表中的详细信息。

```lua
 function love.load()
    lume = require "lume"

    player = {
        x = 100,
        y = 100,
        size = 25,
        image = love.graphics.newImage("face.png")
    }

    coins = {}

    if love.filesystem.getInfo("savedata.txt") then
        file = love.filesystem.read("savedata.txt")
        print(file)
    end

    for i=1,25 do
        table.insert(coins,
            {
                x = love.math.random(50, 650),
                y = love.math.random(50, 450),
                size = 10,
                image = love.graphics.newImage("dollar.png")
            }
        )
    end
end
```

运行游戏后应该能打印出我们的存档数据。现在要把这个字符串转换成真正的表，可以用 `lume.deserialize`。

```lua
if love.filesystem.getInfo("savedata.txt") then
    file = love.filesystem.read("savedata.txt")
    data = lume.deserialize(file)
end
```

现在我们可以把数据应用到玩家和金币上了。注意我们在填充金币表之前写这段代码，因为我们不想再生成已经在存档里被拾取的金币。现在添加金币是根据存档数据进行的。

```lua
 function love.load()
    lume = require "lume"

    player = {
        x = 100,
        y = 100,
        size = 25,
        image = love.graphics.newImage("face.png")
    }

    coins = {}

    if love.filesystem.getInfo("savedata.txt") then
        file = love.filesystem.read("savedata.txt")
        data = lume.deserialize(file)

        -- 应用玩家信息
        player.x = data.player.x
        player.y = data.player.y
        player.size = data.player.size

        for i,v in ipairs(data.coins) do
            coins[i] = {
                x = v.x,
                y = v.y,
                size = 10,
                image = love.graphics.newImage("dollar.png")
            }
        end
    else
        -- 只有在没有存档时才执行
        for i=1,25 do
            table.insert(coins,
                {
                    x = love.math.random(50, 650),
                    y = love.math.random(50, 450),
                    size = 10,
                    image = love.graphics.newImage("dollar.png")
                }
            )
        end
    end
end
```

现在运行游戏你就会发现它会加载你的存档。你可以再拾取一些金币，按 F1 保存，重启游戏后会再次看到保存和读取生效。太棒了！不过如果我们想重新开始呢？我们加一个按钮来删除存档文件，这样就能重新玩一局。

___

## 重置

要删除存档文件可以调用 `love.filesystem.remove(filename)`。我们让 *F2* 键删除文件并重启游戏。可以使用 `love.event.quit()` 退出游戏，但如果把 `"restart"` 作为第一个参数传入，游戏就会改为重启。

```lua
function love.keypressed(key)
    if key == "f1" then
        saveGame()
    elseif key == "f2" then
    love.filesystem.remove("savedata.txt")
        love.event.quit("restart")
    end
end
```

好了，我们现在也能重置游戏了！

___

## 总结

*种子*决定了你生成哪些随机值，这可以用来分享随机生成的关卡等内容。我们同样可以使用 LÖVE 的数学模块。当我们在遍历列表时要移除元素，应当倒序遍历以防遗漏。我们可以把重要数据存入表、将表转成字符串，再用 `love.filesystem.write(filename)` 写入文件以创建存档。读取存档时，用 `love.filesystem.read(filename)` 读取文件、反序列化数据并把它应用到我们的对象上。可以使用 `love.filesystem.remove(filename)` 删除文件，并通过 `love.event.quit("restart")` 重启游戏。
