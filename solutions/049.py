# 解題核心：讀取 N 個整數，走訪清單並累加每個元素。
import sys

values = list(map(int, sys.stdin.read().split()))
n = values[0]
numbers = values[1:1 + n]
print(sum(numbers))
