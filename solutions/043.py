# 解題核心：讀入清單後，以索引 0 和 -1 取得首尾元素並相加。
import sys

values = list(map(int, sys.stdin.read().split()))
numbers = values[1:]
print(numbers[0] + numbers[-1])
