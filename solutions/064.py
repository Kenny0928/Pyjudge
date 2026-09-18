# 解題核心：以兩個變數維護前兩項，逐步遞推到第 N 項，避免遞迴造成重複計算。
n = int(input())
a, b = 1, 1
for _ in range(3, n + 1):
    a, b = b, a + b
print(b)
