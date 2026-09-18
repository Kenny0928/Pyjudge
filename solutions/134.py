# 解題核心：讀取 N 個整數，走訪清單並用 % 2 判斷奇數後累加。
import sys

values = list(map(int, sys.stdin.read().split()))
n = values[0]
numbers = values[1:1 + n]
total = sum(x for x in numbers if x % 2 != 0)
print(total)
