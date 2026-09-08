# 解答：搜尋目標數字
# 核心概念：線性走訪清單並結合計數器
# 積木對照：
# 1. 取得目標數字 k 與清單 nums
# 2. 設變數 count 為 0
# 3. 走訪清單中每一項 item：
#    如果 item == k 那麼變數 count 改變 1
# 4. 說出 count

import sys

def main():
    tokens = sys.stdin.read().split()
    if len(tokens) < 2:
        return
    n = int(tokens[0])
    k = int(tokens[1])
    nums = [int(x) for x in tokens[2:2+n]]
    
    count = 0
    for x in nums:
        if x == k:
            count += 1
            
    print(count)

if __name__ == '__main__':
    main()

