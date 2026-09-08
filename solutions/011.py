# 解答：奇數與偶數
# 核心概念：使用 % 2 取餘數，並搭配 if/else 分支判斷
# 積木對照：讀取 n；若 n 除以 2 的餘數為 0 就輸出 Even，否則輸出 Odd。

import sys


def main():
    line = sys.stdin.read().strip()
    if not line:
        return
    n = int(line)
    print("Even" if n % 2 == 0 else "Odd")


if __name__ == "__main__":
    main()
