# 004. 質數判斷
# 難度：Medium
# 方法：試除法，只試到 sqrt(n)

import math

def is_prime(n):
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    for i in range(3, int(math.sqrt(n)) + 1, 2):
        if n % i == 0:
            return False
    return True

t = int(input())
for _ in range(t):
    n = int(input())
    print("Yes" if is_prime(n) else "No")
