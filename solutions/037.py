# 解題核心：讀第一個值作初始最小值，逐步比較並更新
n = int(input())
min_val = int(input())
for _ in range(n - 1):
    x = int(input())
    if x < min_val:
        min_val = x
print(min_val)
