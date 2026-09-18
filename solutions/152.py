# 152. 異位構詞判斷
# 方法：忽略英文字母大小寫，將兩字串排序後比較是否完全相同。

import sys

lines = sys.stdin.read().split('\n')
a = lines[0].strip()
b = lines[1].strip() if len(lines) > 1 else ""

print('true' if sorted(a.lower()) == sorted(b.lower()) else 'false')
