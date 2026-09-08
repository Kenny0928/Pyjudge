# 解答：直角三角形星星塔
# 核心概念：使用 for 迴圈走訪 1 到 N，每行印出對應數量的星號
# 積木對照：
# 1. 設變數 i 為 1
# 2. 重複 N 次：
#    說出 由 i 個 "*" 組成的字串
#    變數 i 改變 1

import sys

def main():
    line = sys.stdin.read().strip()
    if not line:
        return
    n = int(line)
    for i in range(1, n + 1):
        print('*' * i)

if __name__ == '__main__':
    main()

