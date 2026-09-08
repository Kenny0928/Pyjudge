# 解題核心：單一門檻 if/else 判斷，60 分以上為通過
# 積木對照解法：
#   ① [設定 score = 回答]
#   ② [如果 score >= 60] → [說出 "通過"]
#      [否則] → [說出 "再努力"]
score = int(input())
if score >= 60:
    print("通過")
else:
    print("再努力")
