# 解題核心：讀入 N 個項目後，直接以反向順序輸出。
import sys

data = sys.stdin.read().split('\n')
n = int(data[0].strip())
items = data[1].split()[:n]
print(' '.join(reversed(items)))
