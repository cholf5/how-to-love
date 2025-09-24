# 第 21 章 - 存档与读档

示例游戏：玩家控制小球收集随机生成的金币。收集后玩家变大，金币从表里移除。

```lua
function checkCollision(a, b)
        local distance = math.sqrt((a.x - b.x)^2 + (a.y - b.y)^2)
        return distance < a.size + b.size
end
```

## 保存

LÖVE 提供 `love.filesystem` 模块，可在用户目录下读写文件。

```lua
function saveGame()
        local data = {
                x = player.x,
                y = player.y,
                size = player.size,
                coins = coins
        }
        love.filesystem.write("save.lua", serpent.block(data))
end
```

实际教程使用了一个序列化函数（例如 `serpent`）把表转成字符串后写入文件。

## 读取

```lua
function loadGame()
        if love.filesystem.getInfo("save.lua") then
                local chunk = love.filesystem.load("save.lua")
                local data = chunk()
                player.x = data.x
                player.y = data.y
                player.size = data.size
                coins = data.coins
        end
end
```

在合适的时机（例如按下 S 存档、L 读档）调用上述函数即可。

___

## 总结

通过 `love.filesystem` 可以在玩家本地保存与加载表格化的数据，序列化工具能将表变成字符串，读取时再还原即可继续游戏。
