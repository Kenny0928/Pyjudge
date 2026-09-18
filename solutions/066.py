# 解題核心：累加所有數字後除以 N，並固定以兩位小數格式輸出。
import sys

data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:1 + n]))
avg = sum(nums) / n
print(f"{avg:.2f}")
