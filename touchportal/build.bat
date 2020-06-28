del /s /q "../dist-tp"

mkdir "../dist-tp"
mkdir "../dist-tp/music_mate_14585"
copy "./entry.tp" "../dist-tp/music_mate_14585/"
copy "./musicmate_tp_logo.png" "../dist-tp/music_mate_14585/"

cd "../dist-tp"

powershell -Command "Compress-Archive -LiteralPath \"music_mate_14585\" -DestinationPath \"musicmate.zip\""
move ./musicmate.zip ./musicmate.tpp