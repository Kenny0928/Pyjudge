# 解題核心：讀取 N 個整數，使用 sort(reverse=True) 由大到小排序後以
# 空白分隔輸出。
import sys

tokens = sys.stdin.read().split()
n = int(tokens[0])
nums = list(map(int, tokens[1:1 + n]))
nums.sort(reverse=True)
print(" ".join(map(str, nums)))
