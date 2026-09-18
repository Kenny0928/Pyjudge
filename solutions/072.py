# 解題核心：排序後依 N 的奇偶，取正中間一個數字或中間兩個數字的平均值。
import sys

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1 + n]))
nums.sort()
if n % 2 == 1:
    median = nums[n // 2]
else:
    median = (nums[n // 2 - 1] + nums[n // 2]) / 2
print(f"{median:.2f}")
