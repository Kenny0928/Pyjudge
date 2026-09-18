# 解題核心：讀入清單那一行後用 split() 切開，再用 len() 計算項目數量。
import sys

lines = sys.stdin.read().split("\n")
items = lines[1].split()
print(len(items))
