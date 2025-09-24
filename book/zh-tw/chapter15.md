# 第 15 章 - 發布你的遊戲

___
*我們使用上一章的代碼*
___

**提示：查看[附加章節](bonus/vscode)，了解如何使用 makelove 更順暢地構建遊戲。**
___

你已經做出了一款遊戲，並且想把它分享給其他人。當然你可以讓他們在電腦上安裝 LÖVE，但其實沒有這個必要。

首先，我們需要更改窗口標題和圖標。我們會使用一個配置文件來完成這一點。

創建一個名為 `conf.lua` 的新文件，並寫入以下代碼：

```lua
function love.conf(t)
    t.window.title = "Panda Shooter!"
    t.window.icon = "panda.png"
end
```

保存文件。現在當你運行遊戲時，就會看到窗口標題變成了 "Panda Shooter!"，圖標也換成了那隻熊貓。

配置文件的作用正是如此。LÖVE 會在啟動遊戲之前加載 `conf.lua` 並應用其中的設置。完整的可配置選項請參閱[官方 Wiki](https://love2d.org/wiki/Config_Files)。

既然遊戲已經擁有合適的標題和圖標，接下來就把它打包成可執行程序。

首先需要把遊戲打包成一個 zip 壓縮文件。進入你的遊戲文件夾，選中其中所有文件。右鍵點擊，選擇 **發送到**，再點擊 **壓縮 (zip) 文件夾**。文件名無所謂，但我們需要把擴展名從默認的 `.zip` 改為 `.love`。

*注意：這一部分僅適用於 Windows。想了解如何在其他平臺上構建遊戲，請參閱[這裡](https://www.love2d.org/wiki/Game_Distribution)。*

![](/images/book/15/compress.png)

**如果你看不到文件擴展名**

按下 ***Windows + Pause/Break***。在新窗口的左上角點擊 ***控制面板***。接著依次進入 ***外觀和個性化***。

![](/images/book/15/control_panel.png)

點擊 ***文件資源管理器選項***。

![](/images/book/15/personalization.png)

會彈出一個新窗口。切換到 ***查看*** 選項卡，在 ***高級設置*** 中確保 ***隱藏已知文件類型的擴展名*** 處於未勾選狀態。

![](/images/book/15/folder_options.png)

我寫了一個用於打包遊戲的 bat 腳本。下載[這個壓縮包](https://drive.google.com/file/d/1xX49nDCI0UxjnwY3-h0f-kpdmHVmNqvz/view?usp=sharing)，並將所有文件解壓到某個文件夾。

然後把你的 `.love` 文件拖到 `build.bat` 上。這會在同一目錄下生成一個 `.zip` 文件。把它分享給別人就可以了。玩家只需把壓縮包中的所有文件解壓到同一個文件夾，然後打開其中的 `.exe` 文件就能遊玩。

接下來你需要找一個發布遊戲的平臺。可以去看看 [itch.io](https://itch.io/)。

想了解更多遊戲打包的信息，請參閱 [LÖVE Wiki 頁面](https://www.love2d.org/wiki/Game_Distribution)，其中也介紹了如何為其他平臺構建你的遊戲。

___

## 總結

藉助 [conf.lua](https://love2d.org/wiki/Config_Files) 你可以配置遊戲的標題和圖標。選中遊戲文件夾中的所有文件並壓縮成 zip，將擴展名從 `.zip` 改為 `.love`。下載[這個壓縮包](https://drive.google.com/file/d/1xX49nDCI0UxjnwY3-h0f-kpdmHVmNqvz/view?usp=sharing)，把 `.love` 拖到 `build.bat` 上即可生成 `.zip`。玩家需要把壓縮包解開到同一個文件夾，並運行 `.exe` 文件來體驗你的遊戲。
