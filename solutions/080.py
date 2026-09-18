# 解題核心：將清單由大到小排序，取排序後的第二個元素（允許重複值）。
import sys

values = list(map(int, sys.stdin.read().split()))
n = values[0]
numbers = values[1:1 + n]
numbers.sort(reverse=True)
print(numbers[1])
