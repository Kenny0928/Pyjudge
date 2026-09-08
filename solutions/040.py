# 解題核心：% 10 取個位數，// 10 縮小數字，while 直到 n == 0
n = int(input())
result = 0
while n > 0:
    result = result * 10 + n % 10
    n //= 10
print(result)
