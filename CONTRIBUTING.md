So here's your guide anon.
1) Make a github account and open https://github.com/vg-mjg/mjg-repo
![989](https://user-images.githubusercontent.com/49875739/119966899-13a82980-bfac-11eb-9585-ed3dafa663e7.png)
2) Open the file you want to change, and press edit
![990](https://user-images.githubusercontent.com/49875739/119966900-13a82980-bfac-11eb-899a-cbb143090878.png)
3) Edit what you want
![991](https://user-images.githubusercontent.com/49875739/119966902-1440c000-bfac-11eb-8d03-dcd00cd232a7.png)
4) Explain what you did and press "Propose changes"
![992](https://user-images.githubusercontent.com/49875739/119966904-1440c000-bfac-11eb-9305-0fa64685107c.png)
5) Create pull request
![993](https://user-images.githubusercontent.com/49875739/119966908-14d95680-bfac-11eb-9469-a278d50a2f36.png)
6) Explain pull request
![994](https://user-images.githubusercontent.com/49875739/119966909-1571ed00-bfac-11eb-9a4a-f10d7e676403.png)
7) Wait for repoanons to merge into the main repo
![995](https://user-images.githubusercontent.com/49875739/119966911-1571ed00-bfac-11eb-9be5-5c4a21e29c3e.png)
8) ???
9) Profit!


A better way to do this is working on your own fork.
1) Check your repositories and open it (you have it if you did method A, or simply press the "fork" button on mjg-repo)
![996](https://user-images.githubusercontent.com/49875739/119966913-1571ed00-bfac-11eb-8a82-54510dc957a2.png)
2) Make some changes, then press contribute -> open pull request
![997](https://user-images.githubusercontent.com/49875739/119966915-160a8380-bfac-11eb-9851-9c5d84416faf.png)
3) Create pull request
![998](https://user-images.githubusercontent.com/49875739/119966918-160a8380-bfac-11eb-8e95-ba8751ba9814.png)
4) Explain pull request
![999](https://user-images.githubusercontent.com/49875739/119966896-1276fc80-bfac-11eb-8f64-3221860f2b49.png)


After method A or B you'll become official repoanon, which means you won't have to bother about making pull request as you'll have direct access to the repo. 
Which means you'll see something like pic related if you edit a file
![1000](https://user-images.githubusercontent.com/49875739/119968067-50c0eb80-bfad-11eb-9469-430812f26c54.png)
It's still a good idea to make pull requests if you do something big. 

If you're a brainlet there is https://desktop.github.com/ to make things easier.

## How to use the file server

If you want to provide larger media files along with your pull request (that is, larger than a random small image to embed on the repo), do it via [files.riichi.moe](https://files.riichi.moe). Go there and log in with your github account.
<img width="509" height="640" alt="image" src="https://github.com/user-attachments/assets/1f67430c-349b-45f8-9323-bda98f31d6c0" />

Once you authorize it, you will be granted write access to a new directory.
<img width="495" height="200" alt="image" src="https://github.com/user-attachments/assets/0cd83d30-c90e-49ab-a799-8412cd3b19bb" />

You could already upload your files here, but you'll make repoanon's lives easier by creating a directory structure that mimics the location of where within the `/mjg/` share you want your files to be.
<img width="665" height="359" alt="image" src="https://github.com/user-attachments/assets/6368213e-e8b2-4e76-8ce9-ffa99735697a" />

Upload your files by either drag&dropping or navigating to `🚀` and choosing `Upload`.
<img width="801" height="521" alt="image" src="https://github.com/user-attachments/assets/049bf88a-ba1e-4930-a2a3-7677ed12e8cd" />

Now you can reference URLs to these files or directories (or archives, by appending `?zip=utf8` to a directory URL) in the code portion of your pull request, as explained earlier.

**You must replace the `/pr/>name/` portion of the URL with `/mjg/`**. For example:
```diff
# instead of
- <img src="https://files.riichi.moe/pr/>name/emotes/fujitakana-4hahi.png" />
# change it to this
+ <img src="https://files.riichi.moe/mjg/emotes/fujitakana-4hahi.png" />
```

Once (you) become a repoanon, you will be granted direct access to `/mjg/`.

Good luck.
