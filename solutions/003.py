# 003. 最大公因數
# 難度：Easy
# 方法：輾轉相除法（歐幾里得算法）

def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

a, b = map(int, input().split())
print(gcd(a, b))
