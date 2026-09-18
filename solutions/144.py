# 144. 乘法表清單
# 核心概念：雙層迴圈依列（row-major）產生 1x1 到 NxN 的乘法結果，攤平成一維清單輸出。

import sys

n = int(sys.stdin.readline())

result = []
for i in range(1, n + 1):
    for j in range(1, n + 1):
        result.append(i * j)

print(' '.join(map(str, result)))
