# 解答：清單中的最大值
# 核心概念：以第一個元素初始化最大值，再走訪其餘元素比較更新

import sys


def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(value) for value in tokens[1:n + 1]]
    max_value = nums[0]
    for value in nums[1:]:
        if value > max_value:
            max_value = value
    print(max_value)


if __name__ == "__main__":
    main()
