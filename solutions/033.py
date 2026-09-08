# 解題核心：讀取 N 筆整數，total 從 0 開始累加每筆輸入
# 積木對照解法：
#   ① [設定 total = 0]; [設定 n]
#   ② [重複 n 次] → [設定 x = 輸入]; [將 total 改變 x]
#   ③ [說出 total]
n = int(input())
total = 0
for _ in range(n):
    total += int(input())
print(total)
