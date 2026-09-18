# 解題核心：以第一個元素初始化目前最大值，再走訪其餘元素更新答案。
import sys

values = list(map(int, sys.stdin.read().split()))
n = values[0]
numbers = values[1:1 + n]
maximum = numbers[0]
for number in numbers[1:]:
    if number > maximum:
        maximum = number
print(maximum)
