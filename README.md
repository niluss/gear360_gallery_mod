This is a Fork of https://github.com/ottokiksmaler/gear360_modding for the Samsung Gear 360

I only updated Gallery and added 360 Viewer and Delete functionality.

Please see ottokiksmaler for more detailed commands and modding information.


Latest Updates (Nov 15, 2022):
- Fixed pinch zoom on mobile
- mild vignette fix
- Added open360.htm file. You can use this to open unstitched files locally. See details on Instructions


Features of this mod:
- Added open360.htm to open unstitched local files.
- Gallery is shown by default instead of the settings.
- Gallery css updated
- 360 Viewer on click of thumbnail for photos and videos. This is done via browsers OpenGL GLSL shaders (version 3), so no stitching needed. Tested on Chrome desktop (works better) and mobile.
- To close 360 view, click X on top right. It maybe hard to see, but there is!
- Download of file by clicking the Filename instead of thumbnail. No stitching done on downloaded file.
- Added Delete button
- Added Button to kill the gallery process (maybe it will save battery, not really sure)
- Connect to the Wi-Fi access point is auto started upon double-clicking Power button. (Disable by removing/commenting line ```st key click wifi``` On file G360POWE_G360POW.sh
- **Telnet disabled
- **FTP disabled
- **Does not do the ISO commands of the original mod, but only the NR commands



If you'd like to donate, I'd appreciate it -> [DONATE HERE :)](https://www.paypal.com/donate/?business=SAD76KF74JL3U&no_recurring=1&item_name=I+hope+I+made+your+day+today%21&currency_code=USD)



Limitations:
- No stitching available
- Video thumbnail is slow as it tries to load part of the video. There is currently no thumbnail generator for video.
- 360 preview for Video is buggy depending on the browser. Only works for 30fps and SAM videos.

Current issues:
- No playback controls



Instructions:

- Download the file (https://github.com/niluss/gear360_gallery_mod/raw/master/gear360_mods_SD.zip) and extract it to the root directory of the microSD card (so that it contains ```DCIM``` and ```mods``` directories and ```info.tg```, ```mod.sh``` and ```nx_cs.adj``` files). 
- Put the card in the camera and power on the camera.
- You should see the blue light above the Power button light up for a second.
- Double-click the [Power] button on the camera. You should see a top light cycle green-orange-green to indicate it's working now.
- Select connecting to iOS (long press Menu, then menu again to change to iOS and then click main shooting [OK] button).
- Connect to the Wi-Fi access point created by the camera (Gear 360), the password is shown on the camera screen.
- Open the browser and go to http://192.168.43.1:8888 (assuming your camera is also using 192.168.43.1 as the IP, it seems all are, but you can check yout IP from GUI or from the command line by typing ```ipconfig``` on Windows or ```ifconfig``` or ```ip addr ls``` on Linux.


Instructions to use open360.htm to view unstitched files locally:
- Copy the contents of www directory into your device pc/mobile
- Copy your unstitched files from the Gear 360 to your pc/mobile
- Install an http server (like Servez on windows, or HTTP File Server on Android)
- Start the http server and browse the open360.htm via the browser.
- Tap the icon on the page, and open a 360 image or video to view. It will show the same 360 viewer.


For devs:
- See https://github.com/niluss/gear360_gallery_mod/blob/master/src/mods/www/gallery-3d.js for the shader implementation. This all guesswork. But basically a pixel's angle from Z-axis is directly proportional to how far it should be from the center of the raw image. And vertex shader just tries to push vertices on the outer edges to move forward same to camera direction to make them more visible.
- 360 Viewer is done by the use of three.js. Checkout https://github.com/mrdoob/three.js/ for more info.
- Used https://hammerjs.github.io/ for pinch zoom/in

