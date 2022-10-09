This is a Fork of https://github.com/ottokiksmaler/gear360_modding

I only updated Gallery and added 360 Viewer and Delete functionality.

Please see ottokiksmaler for more detailed commands and modding information.



Features of this mod:
- Gallery is shown by default instead of the settings.
- Gallery css updated
- 360 Viewer on click of thumbnail. Tested on Chrome desktop (works better) and mobile.
- Added Delete button
- Added Button to kill the gallery process (maybe it will save battery, not really sure)
- **Telnet disabled
- **FTP disabled
- **Does not do the ISO commands of the original mod, but only the NR commands

Current issues/TODO:
No stitching available
Video thumbnail is slow as it tries to load part of the video. There is currently no thumbnail generator for video.
360 preview for Video is buggy. Only works for 30fps and SAM videos.



Instructions:

- Download the file (https://github.com/niluss/gear360_gallery_mod/raw/master/gear360_mods_SD.zip) and extract it to the root directory of the microSD card (so that it contains ```DCIM``` and ```mods``` directories and ```info.tg```, ```mod.sh``` and ```nx_cs.adj``` files). 
- Put the card in the camera and power on the camera.
- You should see the blue light above the Power button light up for a second.
- Double-click the [Power] button on the camera. You should see a top light cycle green-orange-green to indicate it's working now.
- Select connecting to iOS (long press Menu, then menu again to change to iOS and then click main shooting [OK] button).
- Connect to the Wi-Fi access point created by the camera (Gear 360), the password is shown on the camera screen.
- Open the browser and go to http://192.168.43.1:8888 (assuming your camera is also using 192.168.43.1 as the IP, it seems all are, but you can check yout IP from GUI or from the command line by typing ```ipconfig``` on Windows or ```ifconfig``` or ```ip addr ls``` on Linux.

On file G360POWE_G360POW.sh, you can add the line ```st key click wifi``` to the end of the script automatically start the Wi-Fi.
