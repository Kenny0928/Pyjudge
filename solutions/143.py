# 解題核心：讀取 R 列，每列先讀 C 再讀 C 個項目（一律視為文字），依序攤平成一維清單輸出。
import sys

tokens = sys.stdin.read().split()
pos = 0
r = int(tokens[pos]); pos += 1
result = []
for _ in range(r):
    c = int(tokens[pos]); pos += 1
    for _ in range(c):
        result.append(tokens[pos]); pos += 1
print(" ".join(result))
