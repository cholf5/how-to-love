# 第 7 章 - 表与 for 循环

表（table）就像数组，可以保存多个值。

```lua
fruits = {"apple", "banana"}
table.insert(fruits, "pear")
```

访问某个元素时使用方括号：`fruits[1]` 得到 "apple"。`#fruits` 可以获取表的长度。

当需要批量处理时，就用 `for` 循环：

```lua
for i = 1, #fruits do
        love.graphics.print(fruits[i], 100, 100 + 50 * i)
end
```

循环变量 `i` 会从 1 到表的长度，逐个把水果名称绘制在屏幕不同位置。

`for i = start, finish, step do` 可以自定义起点和步长，也可以用负数倒序。

___

## 总结

表能一次保存多项数据，配合 for 循环就能优雅地遍历、绘制或更新它们。
