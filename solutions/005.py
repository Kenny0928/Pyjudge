# 005. 費氏數列第 N 項
# 難度：Easy
# 方法：迭代（避免遞迴爆 stack）

n = int(input())
a, b = 1, 1
for _ in range(n - 1):
    a, b = b, a + b
print(a)
