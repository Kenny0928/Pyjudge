# 解題核心：讀取 N 與清單內容後，直接用索引 0 取得第一個項目。
import sys

tokens = sys.stdin.read().split()
n = int(tokens[0])
items = tokens[1:1 + n]
print(items[0])
