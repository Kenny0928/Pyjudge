# 解題核心：讀取 N、清單、插入位置 idx 與新項目後，使用 list.insert 插入並輸出新清單。
import sys

tokens = sys.stdin.read().split()
n = int(tokens[0])
items = tokens[1:1 + n]
idx = int(tokens[1 + n])
item = tokens[2 + n]
items.insert(idx, item)
print(" ".join(items))
