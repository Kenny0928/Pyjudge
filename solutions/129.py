# 解題核心：讀取 N 個整數，使用 sort() 由小到大排序後以空白分隔輸出。
import sys

tokens = sys.stdin.read().split()
n = int(tokens[0])
nums = list(map(int, tokens[1:1 + n]))
nums.sort()
print(" ".join(map(str, nums)))
