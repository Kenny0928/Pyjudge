# 解題核心：讀取 N 與清單後，使用 append 在末尾加入新項目，再輸出整份清單。
import sys

tokens = sys.stdin.read().split()
n = int(tokens[0])
items = tokens[1:1 + n]
new_item = tokens[1 + n]
items.append(new_item)
print(" ".join(items))
