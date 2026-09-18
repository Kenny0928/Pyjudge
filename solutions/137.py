# 解題核心：讀取 N 個整數，將每個數字乘以 2 後依序輸出。
import sys

values = list(map(int, sys.stdin.read().split()))
n = values[0]
numbers = values[1:1 + n]
doubled = [x * 2 for x in numbers]
print(" ".join(map(str, doubled)))
