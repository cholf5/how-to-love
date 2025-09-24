___

*第 2 章和第 3 章其實不用安裝任何軟體。如果你暫時不想裝程序，可以用 [repl.it](https://repl.it/languages/lua) 先練習。但請務必閱讀本章末尾的「**還有幾件事**」段落。*

___

## LÖVE

打開 [love2d.org](https://www.love2d.org/)。

根據你的系統類型下載 32 位或 64 位的**安裝包**。如果不確定自己的系統是 32 位還是 64 位，選 32 位也沒關係。

![](/images/book/1/download_love.png)

運行安裝包。依次點擊 *Next*、*I agree*。接下來你可以選擇 LÖVE 的安裝位置。安裝在什麼地方其實無所謂，但請記住路徑，稍後我們會用到。這個文件夾下面我會稱為「**安裝目錄**」。

我的安裝目錄是 `C:/Program Files/LOVE`。

繼續點擊 *Next*，然後點擊 *Install*。

安裝完成後點擊 *Finish*。

___

## 代碼編輯器

接下來需要安裝一個文本編輯器。本教程使用 ZeroBrane Studio。

如果你更喜歡 **Visual Studio Code**，可以查看[附加章節](bonus/vscode)了解如何在 VS Code 中運行 LÖVE。

打開 [studio.zerobrane.com](https://studio.zerobrane.com/)，點擊 「Download」。

![](/images/book/1/download_brane.png)

這一步會出現捐贈 ZeroBrane Studio 的提示。如果暫時不想捐，可以點擊 [「Take me to the download page this time」](https://studio.zerobrane.com/download?not-this-time)。

運行安裝包，把 ZeroBrane Studio 安裝到你喜歡的任何位置。

![](/images/book/1/install_brane.png)

安裝完成後啟動 ZeroBrane Studio。

我們需要一個項目文件夾。打開文件管理器，在你喜歡的位置新建一個文件夾，名字隨意。在 ZeroBrane Studio 中點擊 「Select Project Folder」 圖標，選擇剛創建的文件夾。

![](/images/book/1/project_brane.png)

在 ZeroBrane Studio 中新建一個文件，可以點 `File -> New`，也可以按快捷鍵 `Ctrl + N`。

在文件裡寫下如下代碼：
```lua
function love.draw()
        love.graphics.print("Hello World!", 100, 100)
end
```

通過 `File -> Save` 或 `Ctrl + S` 保存文件，文件名叫 `main.lua`。

然後在菜單裡選擇 `Project -> Lua Interpreter`，把解釋器切換成 `LÖVE`。

現在按下 F6，就會彈出一個窗口，顯示 「Hello World!」。恭喜你，已經可以開始學習 LÖVE 了。之後我說的「*運行遊戲*」或「*運行代碼*」，就是要你按 F6 來啟動 LÖVE。

如果什麼都沒發生，反而看到提示 *Can't find love2d executable in any of the following folders*，說明 ZeroBrane Studio 找不到 LÖVE 的安裝位置。打開 `Edit -> Preferences -> Settings: User`，寫入以下配置：

```lua
path.love2d = 'C:/path/to/love.exe'
```

把 `'C:/path/to/love.exe'` 換成你實際安裝 LÖVE 的路徑，注意路徑裡的斜槓要用正斜槓 `/`。

___

## 還有幾件事

你是不是複製粘貼了示例代碼？我還是鼓勵你自己動手敲一遍。雖然看起來多了一些工作量，但親手輸入能讓你記得更牢。

唯一可以不用手敲的部分是注釋。

```lua
-- 這行是注釋，不會被執行。
-- 下一行才是代碼：

print(123)

--Output: 123
```

只要一行以兩個減號（`--`）開頭，就是*注釋*。計算機會忽略它，所以我們可以隨便寫一些說明文字而不會報錯。我會用注釋來解釋某段代碼的作用。當你自己抄代碼時，可以不用把注釋也抄上。

`print` 可以把信息輸出到*輸出控制臺*，也就是編輯器底部那個窗口。**關閉遊戲窗口**之後，那裡應該顯示 `123` 這段文字。我會寫上 `--Output:` 提示這段代碼應該輸出什麼，別把它和 `love.graphics.print` 搞混。

如果在 `main.lua` 最上方加上下面這一行，就能在遊戲運行時立即看到輸出。具體怎麼工作的現在不用管，理解成「讓程序不用等到關閉才顯示列印內容」就好。

```lua
io.stdout:setvbuf("no")
```

___

## 其他可選的編輯器

* [Visual Studio Code](https://code.visualstudio.com/)
* [Sublime Text](https://love2d.org/wiki/Sublime_Text)
* [Atom](https://love2d.org/wiki/Atom)
