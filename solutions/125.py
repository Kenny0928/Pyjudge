# 解題核心：清單固定為 [1, 2, 3, 4, 5]，使用切片 base[m:n] 取出從索引 m
# 到索引 n（不含）之間的子清單，再以空白分隔輸出。
import sys

tokens = sys.stdin.read().split()
m = int(tokens[0])
n = int(tokens[1])
base = [1, 2, 3, 4, 5]
sub = base[m:n]
print(" ".join(map(str, sub)))
