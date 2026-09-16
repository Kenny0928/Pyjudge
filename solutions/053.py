# 解題核心：以第一個元素初始化目前最小值，再走訪其餘元素更新答案。
import sys

values = list(map(int, sys.stdin.read().split()))
n = values[0]
numbers = values[1:1 + n]
minimum = numbers[0]
for number in numbers[1:]:
    if number < minimum:
        minimum = number
print(minimum)
