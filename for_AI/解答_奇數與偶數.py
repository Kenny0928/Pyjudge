# 解答：奇數與偶數
# 核心概念：使用 % 2 取餘數，並搭配 if/else 分支判斷
# 積木對照：
# 1. 詢問「請輸入數字」並等待，設變數 n 為回答
# 2. 如果 (n 除以 2 的餘數 = 0) 那麼說出 "Even"，否則說出 "Odd"

import sys

def main():
    line = sys.stdin.read().strip()
    if not line:
        return
    n = int(line)
    if n % 2 == 0:
        print("Even")
    else:
        print("Odd")

if __name__ == '__main__':
    main()

