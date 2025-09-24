# 第 18 章 - 瓦片

___

*务必阅读代码中的注释，我在里面写了很多重要信息。*

___

在许多 2D 游戏里，关卡都是由瓦片构成的。我们要自己制作一个瓦片化的关卡。

先从创建一行开始。新建一个表，并用 1 和 0 填充它。

```lua
function love.load()
        tilemap = {1, 0, 0, 1, 1, 0, 1, 1, 1, 0}
end
```

这就是我们的关卡。`1` 表示有瓦片，`0` 表示为空。现在需要把它画出来。我们遍历整个表，每当遇到 1，就在对应位置画出一个矩形。

```lua
function love.draw()
        -- 再次回顾 ipairs
        -- ipairs 是一种特殊函数，可以用来遍历表
        -- 每次循环 i 会变成循环的当前下标，所以依次为 1、2、3、4……
        -- 每次循环 v 会变成下标 i 对应的值，在这里就是 1、0、0、1、1、0 等等
        for i,v in ipairs(tilemap) do
                if v == 1 then
                        love.graphics.rectangle("line", i * 25, 100, 25, 25)
                end
        end
end
```

![](/images/book/18/one_row.png)

好，这样没问题。但我们还想让它纵向延伸。方法是把表放进表中，也就是所谓的二维表。

```lua
function love.load()
        tilemap = {
                {1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
                {1, 0, 0, 0, 0, 0, 0, 0, 0, 1},
                {1, 0, 0, 1, 1, 1, 1, 0, 0, 1},
                {1, 0, 0, 0, 0, 0, 0, 0, 0, 1},
                {1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
        }
end
```

现在我们有一个由多个表组成的表。可以把它看成一张 Excel 表格。

![](/images/book/18/table.png)

1、2、3 等是我们所说的*行*，A、B、C 等被称为*列*。

也可以把它想象成一个小镇。

![](/images/book/18/houses.png)

每一排房子都是一个表，多排房子组成整个小镇，也就是我们的关卡。

绿色的房子位于第 2 行第 5 列。

红色的房子位于第 3 行第 2 列。

访问二维表的值如下所示：

`tilemap[4][3]`

这意味着：第 4 个表里的第 3 个值。或者说：第 4 行第 3 列。

![](/images/book/18/2d_table.gif)

让我们把关卡画出来。由于使用的是二维表，需要在 for 循环里再嵌套一个 for 循环。这也叫作*嵌套 for 循环*。

```lua
function love.draw()
        -- 先不用 ipairs

        -- i 从 1 循环到 tilemap 中的值数量
        for i=1,#tilemap do
                -- j 从 1 循环到该行中的值数量
                for j=1,#tilemap[i] do
                        -- 如果第 i 行第 j 列的值等于 1
                        if tilemap[i][j] == 1 then
                                -- 画出矩形
                                -- 使用 i 和 j 来定位矩形
                                -- j 控制 x，i 控制 y
                                love.graphics.rectangle("line", j * 25, i * 25, 25, 25)
                        end
                end
        end
end
```

我们遍历每一行，并对每一行遍历其中的每一列。

在内部循环中使用 `j` 来进行横向定位，在外部循环中使用 `i` 来进行纵向定位。记住，这些只是变量名，可以随意命名，但像这样使用 i 和 j 很常见。

现在把 for 循环改成 ipairs 循环。

```lua
function love.draw()
        for i,row in ipairs(tilemap) do
                for j,tile in ipairs(row) do
                        if tile == 1 then
                                love.graphics.rectangle("line", j * 25, i * 25, 25, 25)
                        end
                end
        end
end
```

我们使用变量名 `row` 和 `tile` 来让流程更清晰。我们遍历表 `tilemap`，每一个值都是一行（row）。遍历这一行时，每一个值就是一个瓦片（tile）。

我们还可以为瓦片使用不同的数字，并根据这些数字给瓦片不同的颜色。

```lua
function love.load()
        tilemap = {
                {1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
                {1, 2, 2, 2, 2, 2, 2, 2, 2, 1},
                {1, 2, 3, 4, 5, 5, 4, 3, 2, 1},
                {1, 2, 2, 2, 2, 2, 2, 2, 2, 1},
                {1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
        }
end

function love.draw()
        for i,row in ipairs(tilemap) do
                for j,tile in ipairs(row) do
                        -- 先检查瓦片是否为 0
                        if tile ~= 0 then

                                -- 根据瓦片编号设置颜色
                                if tile == 1 then
                                        -- setColor 使用 RGB，A 可选
                                        -- 红、绿、蓝、透明度
                                        love.graphics.setColor(1, 1, 1)
                                elseif tile == 2 then
                                        love.graphics.setColor(1, 0, 0)
                                elseif tile == 3 then
                                        love.graphics.setColor(1, 0, 1)
                                elseif tile == 4 then
                                        love.graphics.setColor(0, 0, 1)
                                elseif tile == 5 then
                                        love.graphics.setColor(0, 1, 1)
                                end

                                -- 绘制瓦片
                                love.graphics.rectangle("fill", j * 25, i * 25, 25, 25)
                        end
                end
        end
end
```

或者用一种更好的方式：

```lua
function love.load()
        tilemap = {
                {1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
                {1, 2, 2, 2, 2, 2, 2, 2, 2, 1},
                {1, 2, 3, 4, 5, 5, 4, 3, 2, 1},
                {1, 2, 2, 2, 2, 2, 2, 2, 2, 1},
                {1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
        }

        -- 创建名为 colors 的表
        colors = {
                -- 用装满 RGB 数值的表填充它
                {1, 1, 1},
                {1, 0, 0},
                {1, 0, 1},
                {0, 0, 1},
                {0, 1, 1}
        }
end

function love.draw()
        for i,row in ipairs(tilemap) do
                for j,tile in ipairs(row) do
                        -- 先检查瓦片是否为 0
                        if tile ~= 0 then
                                -- 设置颜色。.setColor() 也接受包含 3 个数字的表。
                                -- 我们传入下标为 tile 值的表。
                                -- 所以如果 tile 等于 3，就传入 colors[3]，即 {1, 0, 1}
                                love.graphics.setColor(colors[tile])
                                -- 绘制瓦片
                                love.graphics.rectangle("fill", j * 25, i * 25, 25, 25)
                        end
                end
        end
end
```

![](/images/book/18/colors.png)

## 图像

我们已经能做出彩色的关卡了，但现在想要使用图像。很简单，只需添加一张图像，获取它的宽度与高度，然后在绘制时用图像替换矩形即可。

我会使用这张图片：

![](/images/book/18/tile.png)

```lua
function love.load()

        -- 载入图像
        image = love.graphics.newImage("tile.png")

        -- 获取宽度与高度
        width = image:getWidth()
        height = image:getHeight()

        tilemap = {
                {1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
                {1, 2, 2, 2, 2, 2, 2, 2, 2, 1},
                {1, 2, 3, 4, 5, 5, 4, 3, 2, 1},
                {1, 2, 2, 2, 2, 2, 2, 2, 2, 1},
                {1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
        }

        colors = {
                -- 用装满 RGB 数值的表填充它
                {1, 1, 1},
                {1, 0, 0},
                {1, 0, 1},
                {0, 0, 1},
                {0, 1, 1}
        }
end

function love.draw()
        for i,row in ipairs(tilemap) do
                for j,tile in ipairs(row) do
                        if tile ~= 0 then
                                love.graphics.setColor(colors[tile])
                                -- 绘制图像
                                love.graphics.draw(image, j * width, i * height)
                        end
                end
        end
end
```

![](/images/book/18/colors_image.png)

这很容易。但如果我们想绘制不同的图像怎么办？我们当然可以使用多张图片，不过上一章我们学习了如何使用 quad 绘制图像的一部分。同样可以把它用在瓦片上。

让我们使用这张瓦片集：

![](/images/book/18/tileset.png)

首先需要创建这些 quad。

```lua
function love.load()

        -- 载入图像
        image = love.graphics.newImage("tileset.png")

        -- 创建 quad 时需要整张图像的宽度与高度
        local image_width = image:getWidth()
        local image_height = image:getHeight()

        -- 每个瓦片的宽和高都是 32, 32
        -- 因此我们可以这样写：
        width = 32
        height = 32
        -- 但假设我们不知道瓦片的宽高
        -- 也可以利用瓦片集中的行数与列数
        -- 我们的瓦片集有 2 行 3 列
        -- 但我们需要减去 2，以抵消为防止渗色而预留的空像素
        width = (image_width / 3) - 2
        height = (image_height / 2) - 2

        -- 创建 quad
        quads = {}

        for i=0,1 do
                for j=0,2 do
                        -- 之所以把代码拆成多行
                        -- 只是为了能放进页面里
                        table.insert(quads,
                                love.graphics.newQuad(
                                        1 + j * (width + 2),
                                        1 + i * (height + 2),
                                        width, height,
                                        image_width, image_height))
                end
        end

        tilemap = {
                {1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
                {1, 2, 2, 2, 2, 2, 2, 2, 2, 1},
                {1, 2, 3, 4, 5, 5, 4, 3, 2, 1},
                {1, 2, 2, 2, 2, 2, 2, 2, 2, 1},
                {1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
        }

end
```

现在我们有了一个装着 quad 的表，接下来只需在 tilemap 中放入与目标 quad 对应的数字。根据我们创建 quad 的顺序，它们在表中的位置如下所示：

![](/images/book/18/numbered.png)

如果我们想制作这样的场景：

![](/images/book/18/level.png)

就要把 tilemap 改成这样：

```lua
tilemap = {
        {1, 6, 6, 2, 1, 6, 6, 2},
        {3, 0, 0, 4, 5, 0, 0, 3},
        {3, 0, 0, 0, 0, 0, 0, 3},
        {4, 2, 0, 0, 0, 0, 1, 5},
        {1, 5, 0, 0, 0, 0, 4, 2},
        {3, 0, 0, 0, 0, 0, 0, 3},
        {3, 0, 0, 1, 2, 0, 0, 3},
        {4, 6, 6, 5, 4, 6, 6, 5}
}
```

把 tilemap 与图片以及编号对照起来，就能看出每个瓦片是如何使用的。

接下来要绘制正确的 quad。

```lua
function love.draw()
        for i,row in ipairs(tilemap) do
                for j,tile in ipairs(row) do
                        if tile ~= 0 then
                                -- 使用正确的 quad 绘制图像
                                love.graphics.draw(image, quads[tile], j * width, i * height)
                        end
                end
        end
end
```

因此在 (1,1) 上绘制的是位置 1 的 quad，在 (1,2) 上绘制的是位置 6 的 quad，等等。

运行游戏后，你会发现关卡现在看起来就像上面的图片。

## 玩家

既然有了关卡，就来创建一个可以四处走动、且不会穿墙的玩家吧。

玩家我会用这张图片：

![](/images/book/18/player.png)

```lua
function love.load()
        image = love.graphics.newImage("tileset.png")

        local image_width = image:getWidth()
        local image_height = image:getHeight()
        width = (image_width / 3) - 2
        height = (image_height / 2) - 2

        quads = {}

        for i=0,1 do
                for j=0,2 do
                        table.insert(quads,
                                love.graphics.newQuad(
                                        1 + j * (width + 2),
                                        1 + i * (height + 2),
                                        width, height,
                                        image_width, image_height))
                end
        end

        tilemap = {
                {1, 6, 6, 2, 1, 6, 6, 2},
                {3, 0, 0, 4, 5, 0, 0, 3},
                {3, 0, 0, 0, 0, 0, 0, 3},
                {4, 2, 0, 0, 0, 0, 1, 5},
                {1, 5, 0, 0, 0, 0, 4, 2},
                {3, 0, 0, 0, 0, 0, 0, 3},
                {3, 0, 0, 1, 2, 0, 0, 3},
                {4, 6, 6, 5, 4, 6, 6, 5}
        }

        -- 创建我们的玩家
        player = {
                image = love.graphics.newImage("player.png"),
                tile_x = 2,
                tile_y = 2
        }
end
```

`tile_x` 和 `tile_y` 表示玩家在 tilemap 上的位置。绘制时会将这些数值与瓦片宽高相乘。不过先让它动起来。我们不会做平滑移动，而是让它直接跳到下一个位置，因此移动不需要 `dt`。这也意味着我们关心的不是按键是否*按住*，而是是否*被按下*。为此我们使用 `love.keypressed` 事件。

首先创建局部变量 x 和 y。然后根据按下的键对变量加 1 或减 1，最后把结果赋值给玩家的位置。

```lua
function love.keypressed(key)
        local x = player.tile_x
        local y = player.tile_y

        if key == "left" then
                x = x - 1
        elseif key == "right" then
                x = x + 1
        elseif key == "up" then
                y = y - 1
        elseif key == "down" then
                y = y + 1
        end

        player.tile_x = x
        player.tile_y = y
end
```

既然它可以移动了，就把它画出来。

```lua
function love.draw()
        for i,row in ipairs(tilemap) do
                for j,tile in ipairs(row) do
                        if tile ~= 0 then
                                -- 使用正确的 quad 绘制图像
                                love.graphics.draw(image, quads[tile], j * width, i * height)
                        end
                end
        end

        -- 绘制玩家，并将瓦片坐标乘以瓦片宽高
        love.graphics.draw(player.image, player.tile_x * width, player.tile_y * height)
end
```

![](/images/book/18/tile-move-1.gif)

运行游戏后，你应该能操纵玩家四处移动。但问题在于他能穿墙而过。我们通过检查他想去的位置是否是墙来修复这个问题。

首先创建一个名为 `isEmpty` 的函数。在函数内部返回该坐标对应的值是否等于 0。

```lua
function isEmpty(x, y)
        return tilemap[y][x] == 0
end
```

x 和 y 看起来像是反过来了，但这是正确的。因为 y 对应的是行，而 x 对应的是列。

有了这个函数之后，我们就能检查想要前往的位置是否为空地，如果是，就说明可以行走。

```lua
function love.keypressed(key)
        local x = player.tile_x
        local y = player.tile_y

        if key == "left" then
                x = x - 1
        elseif key == "right" then
                x = x + 1
        elseif key == "up" then
                y = y - 1
        elseif key == "down" then
                y = y + 1
        end

        if isEmpty(x, y) then
                player.tile_x = x
                player.tile_y = y
        end
end
```

![](/images/book/18/tile-move-2.gif)

太好了，现在我们的玩家被困在墙内了。试着让他可以捡东西，或者在碰到钥匙时打开门。多多尝试，你就能学到更多。

___

## 总结

我们可以使用瓦片来制作关卡。瓦片地图由行和列构成，每一行包含若干列。行垂直排列，列水平排列。我们可以使用瓦片集和 quad 来绘制关卡。
