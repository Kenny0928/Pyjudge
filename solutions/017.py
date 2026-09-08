# 解答：班級成績統計
# 核心概念：同時維護總和累加器與及格人數計數器

import sys


def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    scores = [int(value) for value in tokens[1:n + 1]]
    total = sum(scores)
    pass_count = sum(1 for score in scores if score >= 60)
    print(total // n)
    print(pass_count)


if __name__ == "__main__":
    main()
