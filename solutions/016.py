# 解答：搜尋目標數字
# 核心概念：線性走訪清單，遇到目標值時增加計數器

import sys


def main():
    tokens = sys.stdin.read().split()
    if len(tokens) < 2:
        return
    n, target = map(int, tokens[:2])
    nums = [int(value) for value in tokens[2:2 + n]]
    count = 0
    for value in nums:
        if value == target:
            count += 1
    print(count)


if __name__ == "__main__":
    main()
