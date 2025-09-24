# 第 9 章 - 多文件与作用域

## 多文件

把逻辑拆分到多个 Lua 文件能让项目更整洁。使用 `require("example")` 可以加载同目录下的 `example.lua`（不需要写 `.lua` 后缀）。如果文件在子目录，使用点号连接路径，如 `require("path.to.example")`。

未加 `local` 的变量会成为 *全局变量*，任何文件都能访问：

```lua
-- example.lua
test = 20
```

```lua
-- main.lua
require("example")
print(test) -- 20
```

给变量加上 `local` 关键字，就变成局部变量，仅在当前作用域内有效。

## 作用域

局部变量只能在声明它的代码块里使用：

```lua
if true then
        local value = 20
end
print(value) -- nil
```

函数参数也是局部变量。嵌套作用域里的同名变量不会影响外层。

![](/images/book/9/scope.png)

把变量 `local` 化能避免意外覆盖。常见模式是在文件顶部声明：

```lua
local listOfRectangles = {}
```

这样同一文件中的多个函数都能访问它，但不会泄漏为全局。

## 返回值

在文件顶层使用 `return` 可以把值导出给 `require`：

```lua
-- example.lua
local test = 99
return test
```

```lua
-- main.lua
local hello = require "example"
print(hello) -- 99
```

## 小结

使用 `require` 管理多文件；默认使用局部变量控制作用域；必要时才暴露全局或返回值。
