# 146. 兩正整數的最大公因數
# 方法：輾轉相除法（歐幾里得算法）

import sys


def gcd(a, b):
    while b:
        a, b = b, a % b
    return a


data = sys.stdin.read().split()
a, b = int(data[0]), int(data[1])
print(gcd(a, b))
