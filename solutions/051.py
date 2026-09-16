# 解題核心：逐字走訪 S，遇到和 C 相同的字元就讓計數器加一。
import sys

lines = sys.stdin.read().splitlines()
text = lines[0]
target = lines[1]
count = 0
for char in text:
    if char == target:
        count += 1
print(count)
