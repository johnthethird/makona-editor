tell application "iTerm"
  activate
  set myterm to (make new terminal)
  tell myterm
    activate current session
    launch session "Default Session"
    tell the last session
      --write text "DISABLE_AUTO_TITLE=true title Grunt"
      write text "cd ~/Code/makona-editor \n grunt server"
    end tell

    launch session "Default Session"
    tell the last session
      --write text "export DISABLE_AUTO_TITLE=true"
      --set name to "RailTail"
      write text "cd ~/Code/Kaleo3 \n taillog"
    end tell


  end tell
end tell