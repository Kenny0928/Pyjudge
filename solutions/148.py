# 148. 質因數分解
# 方法：試除法，從 2 開始不斷嘗試除盡目前的因數，最後若剩餘值大於 1 則其本身也是質因數。

import sys

a = int(sys.stdin.readline())

factors = []
n = a
d = 2
while d * d <= n:
    while n % d == 0:
        factors.append(d)
        n //= d
    d += 1
if n > 1:
    factors.append(n)

print(' '.join(map(str, factors)))
