# 解題核心：讀取 N 個整數，將每個數字加上 10 後依序輸出。
import sys

values = list(map(int, sys.stdin.read().split()))
n = values[0]
numbers = values[1:1 + n]
added = [x + 10 for x in numbers]
print(" ".join(map(str, added)))
