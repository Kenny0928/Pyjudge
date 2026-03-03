# 007. 兩數之和
# 難度：Medium
# 方法：雜湊表，O(n)

n, t = map(int, input().split())
nums = list(map(int, input().split()))

seen = {}
for i, x in enumerate(nums):
    complement = t - x
    if complement in seen:
        print(seen[complement], i)
        break
    seen[x] = i
