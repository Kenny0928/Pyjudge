# 150. 二進位轉十進位
# 方法：由左到右走訪每個位元，目前結果乘以 2 再加上該位元值。

import sys

binary = sys.stdin.readline().strip()

result = 0
for ch in binary:
    result = result * 2 + int(ch)

print(result)
