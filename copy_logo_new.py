import shutil
import os

src = r"C:\Users\navya shree g n\.gemini\antigravity-ide\brain\1b6bf8d0-cab5-44d6-8a7c-c39eb5d54108\media__1785571809009.jpg"
dst = r"e:\MGV Painters\logo.jpg"

try:
    if os.path.exists(src):
        shutil.copy(src, dst)
        print("LOGO_COPY_SUCCESS")
    else:
        print("LOGO_SRC_NOT_FOUND")
except Exception as e:
    print("ERROR:", e)
