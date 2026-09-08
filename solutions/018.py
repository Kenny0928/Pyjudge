# 解答：直角三角形星星塔
# 核心概念：使用行號決定該行要輸出的星號數量

import sys


def main():
    line = sys.stdin.read().strip()
    if not line:
        return
    n = int(line)
    for row in range(1, n + 1):
        print("*" * row)


if __name__ == "__main__":
    main()
