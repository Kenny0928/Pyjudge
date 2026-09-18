# 解題核心：讀取 N 個整數，走訪清單並只累加偶數（含 0 與負偶數）。
import sys

tokens = sys.stdin.read().split()
n = int(tokens[0])
nums = list(map(int, tokens[1:1 + n]))
print(sum(x for x in nums if x % 2 == 0))
