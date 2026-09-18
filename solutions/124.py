# 解題核心：讀取清單長度 N，只要判斷 N 是否為 0 即可知道清單是否為空。
import sys

tokens = sys.stdin.read().split()
n = int(tokens[0])
print("true" if n == 0 else "false")
