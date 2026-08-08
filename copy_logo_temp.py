import shutil
import os

src = r"C:\Users\navya shree g n\.gemini\antigravity-ide\brain\9c6ddf4d-c597-4375-b5ae-8b7d4be3e86a\media__1785592532437.jpg"
dst = r"E:\MGV Painters\logo.jpg"

try:
    if os.path.exists(src):
        shutil.copy(src, dst)
        print("LOGO_COPY_SUCCESS")
    else:
        print("LOGO_SRC_NOT_FOUND")
except Exception as e:
    print("ERROR:", e)
