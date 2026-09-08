# 解答：班級成績統計
# 核心概念：同時維護總和累加器與及格計數器
# 積木對照：
# 1. 取得人數 n 與成績清單 scores
# 2. 設變數 total 為 0, 設變數 pass_count 為 0
# 3. 走訪 scores 的每一項 score:
#    變數 total 改變 score
#    如果 score >= 60 那麼變數 pass_count 改變 1
# 4. 說出 total 除以 n 的商數 (整數除法)
# 5. 說出 pass_count

import sys

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    scores = [int(x) for x in tokens[1:1+n]]
    
    total = sum(scores)
    pass_count = sum(1 for s in scores if s >= 60)
    
    avg = total // n
    print(avg)
    print(pass_count)

if __name__ == '__main__':
    main()

