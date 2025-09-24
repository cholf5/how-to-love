# 第 18 章 - 瓦片

创建地图的常见做法是用二维表表示格子：

```lua
tilemap = {
        {1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
        {1, 0, 0, 0, 0, 0, 0, 0, 0, 1},
        {1, 0, 0, 1, 1, 1, 1, 0, 0, 1},
        {1, 0, 0, 0, 0, 0, 0, 0, 0, 1},
        {1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
}
```

遍历时使用嵌套循环：

```lua
for rowIndex, row in ipairs(tilemap) do
        for colIndex, tile in ipairs(row) do
                if tile == 1 then
                        love.graphics.rectangle("line", colIndex * 25, rowIndex * 25, 25, 25)
                end
        end
end
```

`tile` 的值可以代表不同地形：0 空地、1 墙壁、2 水面……根据数值选择颜色或对应的 `Quad` 即可。

为了提高效率，可以预加载一张瓦片图，使用 `love.graphics.newQuad` 切出不同方块，绘制时依据 `tile` 值选择不同的 `quad`。

___

## 总结

二维表 + 嵌套循环是实现网格地图的基础；瓦片的数值可以映射到不同的外观或行为。
