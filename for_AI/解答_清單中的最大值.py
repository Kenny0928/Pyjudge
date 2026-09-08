# 解答：清單中的最大值
# 核心概念：讀取清單，將第一個元素設為初始最大值，走訪比較並更新
# 積木對照：
# 1. 取得清單 nums
# 2. 設變數 max_val 為清單的第一項
# 3. 走訪清單中每一項 item：
#    如果 item > max_val 那麼設 max_val 為 item
# 4. 說出 max_val

import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:n+1]]
    
    max_val = nums[0]
    for x in nums[1:]:
        if x > max_val:
            max_val = x
            
    print(max_val)

if __name__ == '__main__':
    main()

