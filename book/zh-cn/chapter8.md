# 第 8 章 - 对象

表不仅能当列表，还能用键值对的方式存储属性，这样的表可以看作一个“对象”。

```lua
rect = {}
rect.x = 100
rect.y = 100
rect.width = 70
rect.height = 90
rect.speed = 100
```

绘制时直接读取对象属性：

```lua
love.graphics.rectangle("line", rect.x, rect.y, rect.width, rect.height)
```

把 `rect.x` 每帧加上 `rect.speed * dt`，矩形就会移动。

更有趣的是可以把多个对象放到一个列表中：

```lua
listOfRectangles = {}

function createRect()
        local rect = {x = 100, y = 100, width = 70, height = 90, speed = 100}
        table.insert(listOfRectangles, rect)
end

function love.keypressed(key)
        if key == "space" then
                createRect()
        end
end
```

然后在 `love.update` 与 `love.draw` 里遍历 `listOfRectangles`：

```lua
for _, v in ipairs(listOfRectangles) do
        v.x = v.x + v.speed * dt
        love.graphics.rectangle("line", v.x, v.y, v.width, v.height)
end
```

每次按空格就会生成一个新的移动矩形。

___

## 总结

给表添加命名属性就能构建出对象。对象列表配合遍历，可以轻松管理一大批相似的实体。
