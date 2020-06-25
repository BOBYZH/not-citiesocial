# Not citiesocial v2.0.0 (這不是citiesocial，第二版)

## ALPHA Camp 全端網路開發課程，學期四期末畢業專案
這是模仿[citiesocial](https://www.citiesocial.com/)復刻的電商網站，採handlebars + node.js全端整合技術開發，
所有的訪客能瀏覽與搜尋商品、訂閱電子報和加入商品到購物車，但下訂單付款只開放給註冊的顧客會員；
會員除了還能看訂單進度，也可以登記為店家，管理出售的商品與來自其他顧客的訂貨。
- 免安裝預覽連結：[https://not-citiesocial.herokuapp.com/](https://not-citiesocial.herokuapp.com/)

(因heroku服務免費版限制，開啟網站時需待主機從休眠狀態恢復，須稍待片刻)

## 開發者：
Bob Yu-Zhen Huang[(BOBYZH)](https://github.com/BOBYZH)，[開發簡介](https://medium.com/@writtenByBobYZHuang/%E6%9C%9F%E6%9C%AB%E5%80%8B%E4%BA%BA%E5%B0%88%E6%A1%88%E9%A9%97%E6%94%B6-not-citiesocial%E5%BA%97%E5%95%86%E7%B6%B2%E7%AB%99%E9%96%8B%E7%99%BC-ed5c23dce621)

## 如何使用：
0. 至少先在電腦上裝好Node.js、Git、MySQL Community  Server([依作業系統版本對照說明操作](https://dev.mysql.com/downloads/mysql/))
1. 從本專案頁面將檔案下載，或複製(clone)到要操作的電腦上:
```
git clone https://github.com/BOBYZH/not-citiesocial.git
```
2. 開啟終端機(terminal)，將目錄切換至專案資料夾(not-citiesocial)：
```
cd not-citiesocial
```
3. 確認是否有在全域(global)環境安裝nodemon；沒有的話建議安裝，在終端機輸入：
```
npm i nodemon -g
```
4. 使用npm安裝需要的套件，套件列表與版本詳見於[package.json](https://github.com/BOBYZH/not-citiesocial/blob/master/package.json)的"dependencies"：
```
npm i 
```
5. 用以下指令或其他方式建立資料庫，
```
npx sequelize db:create
```
再來可使用migrate與seeder建立資料表與範例資料，供快速檢視功能：
```
npx sequelize db:migrate
npx sequelize db:seed:all
```
以下為測試用的「正確」使用者名稱與對應的帳密：

|(firstName) | email              | password | 帳戶類別     |
| ------| -------------------| ---------| --------------------|
| root | root@example.com  | 12345678 | 顧客、店家 |
| user1 | user1@example.com  | 12345678 | 顧客、店家 |
| user2 | user2@example.com  | 12345678 | 顧客、店家 |
| test | test@test.com  | 12345678 | 顧客 |
6. 若要測試Facebook登入、藍新金流交易、圖片上傳與Gmail發信功能，需到[Facebook for Developers](https://developers.facebook.com/?locale=zh_TW)、
[藍新金流服務平台測試版](https://cwww.newebpay.com/)、[imgur](https://imgur.com/signin?redirect=https%3A%2F%2Fapi.imgur.com%2Foauth2%2Faddclient)
與[Google API Platform](https://console.developers.google.com/apis/library/gmail.googleapis.com?id=869e4b9c-0da4-4cbe-8b8d-c77f7ae060cc&project=not-citiesocial)
，申請對應的代碼
7. 可在本專案根目錄依據[.envTemplate](https://github.com/BOBYZH/not-citiesocial/blob/master/.envTemplate)內容格式，新增".env"檔案(可使用終端機指令)，並在.env填入環境變數；
藍新金流交易在本地測試時另需要[ngrok](https://ngrok.com/)模擬網域
```
cp .envTemplate .env
```

8. 執行本專案：
```
npm run dev

# 不使用nodemon的話，可改用以下指令，但無法在修改代碼後即時更新：
npm run start
```
9. 開啟預覽連結
- 若是在本機操作，於瀏覽器網址列輸入[http://localhost:3000](http://localhost:3000)（終端機也會有提示）；
- 若使用虛擬主機，則須配合主機服務設定另用網址

10. 執行單元測試
- 若需要檢視程式碼的自動化測試結果，須將[./config/config.json](https://github.com/BOBYZH/not-citiesocial/blob/master/config/config.json)的試的帳號與密碼設定，改為與開發的一樣
```
 "test": {
    "username": "root",
    "password": "password",
    "database": "not_citiesocial",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
```
並在終端機執行：
```
npm run test

# 若也要檢視單元測試的覆蓋率，可改用以下指令，執行結果會追加統計表格(也會在./coverage產生網頁版報告)：
npm run cover
```

## 主要功能說明：

1. 店家(admin)：
- 登記為店家帳號，且可執行訪客與顧客權限
- 管理商品項目(CRUD)
- 一次上/下架單一或多樣產品
- 瀏覽所有已接受訂單項目
- 透過信件與後台確認訂單項目狀況
- 發信聯絡網站管理員
- 取消店家帳號身分

2. 顧客(customer)：
- 註冊顧客帳號，且可執行訪客權限
- 從購物車成立訂單
- 將訂單結帳付款或取消
- 付款成功與商品寄送後收到明確的訊息(頁面提示與email確認)
- 查詢過去的訂單記錄
- 更新會員資料，含登記為店家帳號

3.訪客(visitor)(額外，未登入)：
- 瀏覽首頁
- 按下廣告分類欄位左右二側的箭頭切換內容顯示，或按"看更多列出所有內容"
- 瀏覽各項分類頁面
- 瀏覽各項商品頁面
- 將商品放進購物車
- 在商品或購物車頁面調整購買數量或移除品項
- 關鍵字搜尋出現符合項目
- 從底下輸入電子郵件地址，訂閱電子報
- 從訂閱電子報的通知信件退訂

## 版本歷程：
- 2020.05.20：第一版，完成所有核心與部分進階功能，並優化桌面板UI/UX

(2020.05.27專案口試)
- 2020.06.25：第二版，功能與版面微調，對已知錯誤修復與重新檢查，並增加自動化測試，其中較大更新如下：
1. [搜尋商品](https://github.com/BOBYZH/not-citiesocial/commit/b84b3f0144bf31df74a7e9d41208be04f109ee67)、[使用者訂單](https://github.com/BOBYZH/not-citiesocial/commit/cddd4b059cdacf77f2f0b930ea973223760120a6)、[商店商品](https://github.com/BOBYZH/not-citiesocial/commit/050da3b2644713572ae2a54f027de54fbe19f722)與[訂單項目](https://github.com/BOBYZH/not-citiesocial/commit/e0d0c4ad1f2bd860267076e634bbae97caa9d31a)：增加顯示的排序選項與項目計數
2. [將電子郵件寄送的相關代碼重構，重複的部分移到設定(/config)](https://github.com/BOBYZH/not-citiesocial/commit/1fc116ea5ce21c4ddfe9f606738165d6543805eb)：縮減代碼行數與複雜度，並方便後續檢閱與維護
3. 將取消訂閱的功能連結從[網站](https://github.com/BOBYZH/not-citiesocial/commit/0b274d17db8a4ecd99c6a3c0bb24641a8c6225cb)移到確認[信件](https://github.com/BOBYZH/not-citiesocial/commit/f49d3feaea1d407c684fb563cd4049777a9bef49)：避免使用者透過表單取消他人的訂閱紀錄
4. 整合[Travis CI](https://travis-ci.org/github/BOBYZH/not-citiesocial)：進度推送到GitHub通過測試後，即自動佈署到Heroku
5. 使用mocha、chai、sinon、supertest、nyc等套件，加入單元測試(unit test)與計算覆蓋率(coverage)：以[models](https://github.com/BOBYZH/not-citiesocial/commit/862ac371f884c53578350a98c427c89986fd31c0)、controllers(如[adminController](https://github.com/BOBYZH/not-citiesocial/commit/56351d8a18b99081dca5ed6885b442902c979fd3))為主，設計169項測試
