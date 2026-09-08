# 解答：矩陣行列總和
# 核心概念：讀取 M 列資料，逐列計算 sum 並輸出
# 積木對照：
# 1. 取得列數 m 與行數 n
# 2. 重複 m 次：
#    讀取本列 n 個數字的清單 row
#    計算 row 的總和 row_sum
#    說出 row_sum

import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    m = int(input_data[0])
    n = int(input_data[1])
    
    idx = 2
    for _ in range(m):
        row = [int(x) for x in input_data[idx:idx+n]]
        print(sum(row))
        idx += n

if __name__ == '__main__':
    main()

