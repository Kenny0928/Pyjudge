# 解題核心：讀取 N 與清單內容後，用索引 -1 取得最後一個項目。
import sys

tokens = sys.stdin.read().split()
n = int(tokens[0])
items = tokens[1:1 + n]
print(items[-1])
