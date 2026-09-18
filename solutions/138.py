# 解題核心：讀取 N 個整數，將每個數字平方後依序輸出。
import sys

values = list(map(int, sys.stdin.read().split()))
n = values[0]
numbers = values[1:1 + n]
squared = [x * x for x in numbers]
print(" ".join(map(str, squared)))
