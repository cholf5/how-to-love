# 第 3 章 - 函數

函數可以把一段代碼封裝起來，讓我們在需要的時候隨時執行。這類東西有時也叫作 `method`。

定義函數有兩種寫法：

```lua
example = function ()
        print("Hello World!")
end
```

以及更常見的寫法：

```lua
function example()
        print("Hello World!")
end
```

先寫關鍵字 `function`，然後是函數名。函數本質上也是一種變量，所以命名規則和變量一樣。上面的函數名叫 `example`。名字後面加上一對括號 `()`，就可以在函數體裡寫代碼了。在這個例子裡，我們寫的是 `print("Hello World!")`。最後用 `end` 結束函數。

注意直接運行這段代碼，控制臺裡不會出現 「Hello World!」，因為我們還沒執行它。要調用函數，寫法是：

```lua
example()
--Output: "Hello World!"
```

也就是寫上函數名，後面跟上括號。這一步叫做*函數調用*。

___

## 參數

看看這段代碼：

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

函數名後面的括號裡可以放*參數*。參數是只在函數內部存在的臨時變量。這裡我們放了 `num`，在函數裡就能像普通變量一樣使用它。

我們多次調用 `sayNumber`，每次傳入不同的數字，於是同一句話裡插入的數字也不同。括號裡我們填寫的值叫作*實參*。第一次調用時，把實參 15 *傳遞* 給了形參 `num`。

最後我們在函數外列印 `num`，結果得到 `nil`。這說明 `num` 在外部沒有值——既不是數字也不是字符串，更不是函數。因為參數只在函數內部有效。

___

## 返回值

函數也可以用 `return` 關鍵字返回一個值，這個值可以被保存到變量裡。

```lua
function giveMeFive()
        return 5
end

a = giveMeFive()
print(a)
--Output: 5
```

`a` 得到了 `giveMeFive` 返回的值。

再看一個例子：

```lua
-- 多個參數和實參之間用逗號分隔
function sum(a, b)
        return a + b
end

print(sum(200, 95))
--Output:
--295
```

`sum` 函數返回 `a` 與 `b` 的和。我們甚至不用先把返回值存進變量，直接列印也行。

___

## 用途

當你想在多個地方執行同一段邏輯時，函數就派上用場了。與其每次都複製粘貼，不如寫成一個函數，哪裡需要就調用它。之後如果要調整行為，只需改動函數本身就能全局生效。這樣可以避免重複代碼，符合著名的 [Don't repeat yourself](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) 原則。

___

## 總結

函數可以保存一段代碼，隨時調用。調用時寫上函數名和括號，還能往括號裡傳入值，這些值會交給函數的參數（這些參數只在函數內部有效）。函數也可以返回一個值，既能減少重複，又能讓代碼更清晰。
