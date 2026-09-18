# 149. 十進位轉二進位
# 方法：反覆除以 2 並記錄餘數，最後反轉餘數順序；0 為特例直接輸出 "0"。

import sys

n = int(sys.stdin.readline())

if n == 0:
    print(0)
else:
    result = ""
    while n > 0:
        result = str(n % 2) + result
        n //= 2
    print(result)
