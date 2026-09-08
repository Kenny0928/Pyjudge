# 解答：1 加到 N 的總和
# 核心概念：累加器模式 total = 0 與 for 迴圈
# 積木對照：
# 1. 設變數 total 為 0
# 2. 設變數 i 為 1
# 3. 重複 N 次：
#    變數 total 改變 i
#    變數 i 改變 1
# 4. 說出 total

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

if __name__ == '__main__':
    main()

