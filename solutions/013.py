# 解答：從 1 數到 N
# 核心概念：使用 for 迴圈與 range(1, n + 1)
# 積木對照：將 number 設為 1；重複 N 次，輸出 number 後將它增加 1。

import sys


def main():
    line = sys.stdin.read().strip()
    if not line:
        return
    n = int(line)
    for number in range(1, n + 1):
        print(number)


if __name__ == "__main__":
    main()
