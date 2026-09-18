# 解題核心：讀取 N 個項目與一個目標值，走訪清單找出目標第一次出現的
# 索引（0-based）；找不到則輸出 -1。
import sys

tokens = sys.stdin.read().split()
n = int(tokens[0])
items = tokens[1:1 + n]
target = tokens[1 + n]

result = -1
for i, v in enumerate(items):
    if v == target:
        result = i
        break

print(result)
