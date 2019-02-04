from picamera import PiCamera
from signal import pause

camera = PiCamera()
camera.resolution = (1920, 1080)
camera.start_preview()

pause();
