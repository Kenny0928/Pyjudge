# 解答：1 加到 N 的總和
# 核心概念：使用 total = 0 與 for 迴圈完成累加
# 積木對照：將 total 設為 0；從 1 到 N 逐一加入 total，最後輸出 total。

import sys


def main():
    line = sys.stdin.read().strip()
    if not line:
        return
    n = int(line)
    total = 0
    for number in range(1, n + 1):
        total += number
    print(total)


if __name__ == "__main__":
    main()
