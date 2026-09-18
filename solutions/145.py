# 145. 矩陣轉置
# 核心概念：讀入 R x C 矩陣，交換列與行索引（matrix[i][j] -> transposed[j][i]），輸出 C 列 R 行的結果。

import sys


def main():
    data = sys.stdin.read().split()
    idx = 0
    r = int(data[idx]); idx += 1
    c = int(data[idx]); idx += 1

    matrix = []
    for _ in range(r):
        row = [int(x) for x in data[idx:idx + c]]
        idx += c
        matrix.append(row)

    lines = []
    for j in range(c):
        col = [str(matrix[i][j]) for i in range(r)]
        lines.append(' '.join(col))

    print('\n'.join(lines))


main()
