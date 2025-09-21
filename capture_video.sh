while true; do
    timestamp=$(date +%Y%m%d_%H%M%S)
    # record 10 seconds
    ffmpeg -y -i http://192.168.0.103:8080/video -t 10 ~/Desktop/Videos/$timestamp.mp4
    # move finished video to ready folder
    mv ~/Desktop/Videos/$timestamp.mp4 ~/Desktop/ready/
done
