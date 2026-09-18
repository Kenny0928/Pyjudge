# 解題核心：讀取 N 與清單後，使用 pop() 移除最後一個項目，再輸出剩下的清單。
import sys

tokens = sys.stdin.read().split()
n = int(tokens[0])
items = tokens[1:1 + n]
items.pop()
print(" ".join(items))
