# 解題核心：以 1 為累乘器，依序乘上 1 到 N；0! 因此自然得到 1。
# 積木對照：設結果為 1 → 重複走訪 1 到 N → 結果乘上目前數字 → 說出結果。
n = int(input())
result = 1
for value in range(1, n + 1):
    result *= value
print(result)
