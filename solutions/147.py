# 147. 最小公倍數
# 方法：LCM(a, b) = a * b // GCD(a, b)

import sys
import math

data = sys.stdin.read().split()
a, b = int(data[0]), int(data[1])
print(a * b // math.gcd(a, b))
