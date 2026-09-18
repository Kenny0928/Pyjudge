# 解題核心：讀取 N 與清單後，使用 pop(0) 移除第一個項目，再輸出剩下的清單。
import sys

tokens = sys.stdin.read().split()
n = int(tokens[0])
items = tokens[1:1 + n]
items.pop(0)
print(" ".join(items))
