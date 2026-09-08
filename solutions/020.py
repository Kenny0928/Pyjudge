# 解答：矩陣行列總和
# 核心概念：讀取 M 列資料，逐列計算總和並輸出

import sys


def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    m, n = map(int, tokens[:2])
    index = 2
    for _ in range(m):
        row = [int(value) for value in tokens[index:index + n]]
        print(sum(row))
        index += n


if __name__ == "__main__":
    main()
