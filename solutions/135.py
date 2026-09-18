# 解題核心：讀取 N 個整數，篩選出大於 0 的正數並依序輸出。
import sys

values = list(map(int, sys.stdin.read().split()))
n = values[0]
numbers = values[1:1 + n]
positives = [x for x in numbers if x > 0]
print(" ".join(map(str, positives)))
