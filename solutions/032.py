# 解題核心：讀取字串和次數，for 迴圈重複輸出 N 次
# 積木對照解法：
#   ① [設定 s = 回答]; [設定 n = 回答]
#   ② [重複 n 次] → [說出 s]
s = input()
n = int(input())
for _ in range(n):
    print(s)
