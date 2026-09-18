# 解題核心：讀取 N 個項目與一個目標項目，計算目標項目在清單中出現的次數（區分大小寫的完全比對）。
import sys

tokens = sys.stdin.read().split()
n = int(tokens[0])
items = tokens[1:1 + n]
target = tokens[1 + n]
print(items.count(target))
