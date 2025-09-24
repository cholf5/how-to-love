# 第 5 章 - 移动一个矩形

这一章开始动起来：利用变量和 `love.update` 让矩形产生位移。

```lua
function love.load()
        x = 100
end

function love.update(dt)
        x = x + 5 * dt -- 乘以 dt 才能在不同电脑上保持相同速度
end

function love.draw()
        love.graphics.rectangle("line", x, 50, 200, 150)
end
```

`x` 表示矩形在屏幕上的横坐标。每次更新都把它加上一点，就能看到矩形往右移动。`dt`（delta time）是两次更新之间经过的时间。帧率不同的电脑更新次数不同，所以把速度乘以 `dt` 可以确保矩形在所有机器上都以同样的像素/秒速度前进。

___

## 总结

通过在 `love.update` 里不断修改变量，可以让画面中的物体产生运动。使用 delta time 后，移动速度与帧率无关，游戏体验更加一致。
