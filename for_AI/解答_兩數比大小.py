# 解答：兩數比大小
# 核心概念：讀取兩整數，利用 if / elif / else 分支進行比較
# 積木對照：
# 1. 取得兩個變數 a 與 b
# 2. 如果 a > b 說出 "A > B"
#    否則如果 a < b 說出 "A < B"
#    否則說出 "A == B"

import sys

def main():
    tokens = sys.stdin.read().split()
    if len(tokens) < 2:
        return
    a = int(tokens[0])
    b = int(tokens[1])
    
    if a > b:
        print("A > B")
    elif a < b:
        print("A < B")
    else:
        print("A == B")

if __name__ == '__main__':
    main()

