# 解答：兩數比大小
# 核心概念：使用 if/elif/else 比較兩個整數
# 積木對照：取得 a、b；依序判斷 a > b、a < b，否則兩數相等。

import sys


def main():
    tokens = sys.stdin.read().split()
    if len(tokens) < 2:
        return
    a, b = map(int, tokens[:2])
    if a > b:
        print("A > B")
    elif a < b:
        print("A < B")
    else:
        print("A == B")


if __name__ == "__main__":
    main()
