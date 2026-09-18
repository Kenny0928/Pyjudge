# 151. N 的次方檢查
# 方法：base == 1 時只有 num == 1 成立（1 的任何次方恆為 1）；
# 其餘情況反覆將 num 除以 base，最後若能剛好除到 1 代表 num 是 base 的整數次方。
# num == 1 一定成立，因為任何 base 的 0 次方都是 1（迴圈直接跳過，剩餘值仍是 1）。

import sys

data = sys.stdin.read().split()
num, base = int(data[0]), int(data[1])

if base == 1:
    result = (num == 1)
else:
    n = num
    while n % base == 0:
        n //= base
    result = (n == 1)

print('true' if result else 'false')
