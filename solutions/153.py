# 153. 最長單字
# 方法：依空白切割成單字，逐一比較長度；只有嚴格更長時才更新，
# 因此若有並列最長的情況，會保留最早出現的那一個。

import sys

line = sys.stdin.readline().rstrip('\n')
words = line.split()

best = words[0]
for w in words[1:]:
    if len(w) > len(best):
        best = w

print(best)
