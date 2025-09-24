# 第 3 章 - 函数

函数可以把一段代码封装起来，让我们在需要的时候随时执行。这类东西有时也叫作 `method`。

定义函数有两种写法：

```lua
example = function ()
    print("Hello World!")
end
```

以及更常见的写法：

```lua
function example()
    print("Hello World!")
end
```

先写关键字 `function`，然后是函数名。函数本质上也是一种变量，所以命名规则和变量一样。上面的函数名叫 `example`。名字后面加上一对括号 `()`，就可以在函数体里写代码了。在这个例子里，我们写的是 `print("Hello World!")`。最后用 `end` 结束函数。

注意直接运行这段代码，控制台里不会出现 “Hello World!”，因为我们还没执行它。要调用函数，写法是：

```lua
example()
--Output: "Hello World!"
```

也就是写上函数名，后面跟上括号。这一步叫做*函数调用*。

___

## 参数

看看这段代码：

```lua
function sayNumber(num)
    print("I like the number " .. num)
end

sayNumber(15)
sayNumber(2)
sayNumber(44)
sayNumber(100)
print(num)
--Output:
--"I like the number 15"
--"I like the number 2"
--"I like the number 44"
--"I like the number 100"
--nil
```

函数名后面的括号里可以放*参数*。参数是只在函数内部存在的临时变量。这里我们放了 `num`，在函数里就能像普通变量一样使用它。

我们多次调用 `sayNumber`，每次传入不同的数字，于是同一句话里插入的数字也不同。括号里我们填写的值叫作*实参*。第一次调用时，把实参 15 *传递* 给了形参 `num`。

最后我们在函数外打印 `num`，结果得到 `nil`。这说明 `num` 在外部没有值——既不是数字也不是字符串，更不是函数。因为参数只在函数内部有效。

___

## 返回值

函数也可以用 `return` 关键字返回一个值，这个值可以被保存到变量里。

```lua
function giveMeFive()
    return 5
end

a = giveMeFive()
print(a)
--Output: 5
```

`a` 得到了 `giveMeFive` 返回的值。

再看一个例子：

```lua
-- 多个参数和实参之间用逗号分隔
function sum(a, b)
    return a + b
end

print(sum(200, 95))
--Output:
--295
```

`sum` 函数返回 `a` 与 `b` 的和。我们甚至不用先把返回值存进变量，直接打印也行。

___

## 用途

当你想在多个地方执行同一段逻辑时，函数就派上用场了。与其每次都复制粘贴，不如写成一个函数，哪里需要就调用它。之后如果要调整行为，只需改动函数本身就能全局生效。这样可以避免重复代码，符合著名的 [Don't repeat yourself](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) 原则。

___

## 总结

函数可以保存一段代码，随时调用。调用时写上函数名和括号，还能往括号里传入值，这些值会交给函数的参数（这些参数只在函数内部有效）。函数也可以返回一个值，既能减少重复，又能让代码更清晰。
