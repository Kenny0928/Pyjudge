# 解題核心：只需要檢查到 sqrt(N)，只要找到一個因數就不是質數。
n = int(input())
is_prime = n >= 2
i = 2
while i * i <= n:
    if n % i == 0:
        is_prime = False
        break
    i += 1
print("true" if is_prime else "false")
