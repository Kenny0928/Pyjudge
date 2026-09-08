# 解題核心：條件累加器，只把 >= 60 的分數加入 total
n = int(input())
total = 0
for _ in range(n):
    score = int(input())
    if score >= 60:
        total += score
print(total)
