# 解題核心：用累加器從 1 走訪到 N，逐一加總。
# 積木對照：要求輸入 N → 設定總和為 0 → 重複 N 次「總和 = 總和 + 計數」→ 說出總和。
n = int(input())
total = 0
for i in range(1, n + 1):
    total += i
print(total)
