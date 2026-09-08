# 解答：九九乘法表
# 核心概念：使用雙層巢狀迴圈，產生 9 行算式
# 積木對照：
# 1. 設變數 i 為 1
# 2. 重複 9 次：
#    清空本行文字 line
#    設變數 j 為 1
#    重複 9 次：
#       將 i*j 算式加入 line
#       變數 j 改變 1
#    說出 line
#    變數 i 改變 1

def main():
    for i in range(1, 10):
        row = [f"{i}*{j}={i*j}" for j in range(1, 10)]
        print(" ".join(row))

if __name__ == '__main__':
    main()

