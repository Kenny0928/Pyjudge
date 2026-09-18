# 解題核心：讀取 N、清單與 0-based 索引 idx，直接以 items[idx] 取值。
import sys

tokens = sys.stdin.read().split()
n = int(tokens[0])
items = tokens[1:1 + n]
idx = int(tokens[1 + n])
print(items[idx])
