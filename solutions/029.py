# 解題核心：四段溫度區間，用 if/elif/elif/else 依序判斷
# 積木對照解法：
#   ① [設定 T]
#   ② T < 10 → 羽絨衣 / T < 20 → 外套 / T < 30 → 長袖 / else → 短袖
T = int(input())
if T < 10:
    print("穿羽絨衣")
elif T < 20:
    print("穿外套")
elif T < 30:
    print("穿長袖")
else:
    print("穿短袖")
