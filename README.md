# sparta

SpartaDubTrack.create(video_id: 'haNzpiLYdEk', start_secs: 49, end_secs: 55, dub_track: File.new("public/das_ist_kreuzberg.wav", "r"))

app = Sparta.__container__.lookup('controller:application')
sTC = app.get('sTC')
