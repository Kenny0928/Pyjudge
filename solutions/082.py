# 解題核心：依烹煮優先順序逐一取出訂單編號中對應數字的所有出現次數，串接成新字串。
import sys

lines = sys.stdin.read().splitlines()
idx = 0
n = int(lines[idx]); idx += 1
order_code = lines[idx]; idx += 1
m = int(lines[idx]); idx += 1
priority = lines[idx]; idx += 1

result_parts = []
for ch in priority:
    result_parts.append(ch * order_code.count(ch))

print("".join(result_parts))
