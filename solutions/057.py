# 解題核心：比較 A 與 B，較大者（相等時取該值）即為答案。
import sys

values = list(map(int, sys.stdin.read().split()))
a, b = values[0], values[1]
print(a if a >= b else b)
