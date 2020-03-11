# telemetry
Pi Day 2020

Before you begin:
After the memory card with Raspbian was flashed, put two files in the root folder, 'ssh' and 'wpa_supplicant.conf'. First will enable ssh, while the second one will connect to WiFi network. Make sure to make necessary adjustments in wpa_supplicant.conf.


Install procedures to follow:
sudo apt-get update
Sudo apt-get -y install npm
Sudo npm install -g npm@2.x
sudo apt-get install git


Download the code:
mkdir progs
cd progs
git clone https://github.com/Froimson/telemetry

cd telemetry
npm install

sudo node telemetry.js
