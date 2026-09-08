# 解題核心：三段區間用 if/elif/else 依序判斷，注意邊界值
# 積木對照解法：
#   ① [設定 H]
#   ② [如果 H < 150] → 前排
#      [否則如果 H <= 169] → 中排
#      [否則] → 後排
H = int(input())
if H < 150:
    print("前排")
elif H <= 169:
    print("中排")
else:
    print("後排")
