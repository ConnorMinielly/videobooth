from picamera import PiCamera

camera = PiCamera()
camera.resolution = (1920, 1080)
camera.start_preview()
