# 解題核心：讀取 N、清單、0-based 索引 idx 與新項目後，以索引賦值修改該位置的元素。
import sys

tokens = sys.stdin.read().split()
n = int(tokens[0])
items = tokens[1:1 + n]
idx = int(tokens[1 + n])
item = tokens[2 + n]
items[idx] = item
print(" ".join(items))
