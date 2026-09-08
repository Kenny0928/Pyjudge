# 解題核心：while 迴圈，saved < target 時繼續累加，days 計次
daily = int(input())
target = int(input())
days = 0
saved = 0
while saved < target:
    saved += daily
    days += 1
print(days)
