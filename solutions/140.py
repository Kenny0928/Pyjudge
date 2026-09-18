# 解題核心：讀取 N 個不含空白的字串，計算每個字串的長度並依序輸出。
import sys

tokens = sys.stdin.read().split()
n = int(tokens[0])
words = tokens[1:1 + n]
lengths = [len(w) for w in words]
print(" ".join(map(str, lengths)))
