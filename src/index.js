const { app, BrowserWindow, Menu, shell } = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

const userAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1";
let MenuBarState = false;
let ytMusicWindow = null;
let fullScreenState = true;

const menuTemplate = [
  {
    label: "YouTubeMusic",
    submenu: [
      {
        label: "Share",
        click: async () => {
          await shell.openExternal(
            "https://github.com/krishnamurthypranesh/youtubeMusic/blob/master/README.md"
          );
        }
      },
      {
        label: "Quit",
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: "View",
    submenu: [
      {
        label: "Phone Sized",
        click: () => {
          ytMusicWindow.setSize(375, 612);
        }
      },
      {
        label: "Tablet Sized",
        click: () => {
          ytMusicWindow.setSize(768, 612);
        }
      },
      {
        label: "Full Screen",
        click: () => {
          fullScreenState = !fullScreenState;
          ytMusicWindow.setFullScreen(fullScreenState);
        }
      }
    ]
  },
  {
    label: "Control",
    submenu: [
      {
        label: "Refresh",
        click: () => {
          ytMusicWindow.reload();
        }
      }
    ]
  },
  {
    label: "Report",
    submenu: [
      {
        label: "Be a snitch",
        click: async () => {
          await shell.openExternal(
            "https://support.google.com/youtubemusic/?hl=en#topic=6277001"
          );
        }
      }
    ]
  }
];

const createWindow = () => {
  ytMusicWindow = new BrowserWindow({
    width: 375,
    height: 612,
    backgroundColor: "#121111",
    title: "YouTubeMusic",
    icon: `${__dirname}/../icons/icon.png`,
    autoHideMenuBar: true,
    textAreasAreResizable: false,
    titleBarStyle: "default",
    transparent: true,
    resizable: true
  });
  ytMusicWindow.setMinimizable(true);

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  ytMusicWindow.webContents.on("before-input-event", (event, input) => {
    // exit full screen mode
    if (fullScreenState && input.code === "Escape") {
      fullScreenState = !fullScreenState;
      ytMusicWindow.setFullScreen(fullScreenState);
    }
    // open dev tools
    if (
      input.type === "keyDown" &&
      (input.shift || input.meta) &&
      input.key.toLowerCase() === "i"
    ) {
      ytMusicWindow.toggleDevTools();
    }
    if (
      (input.control || input.meta) &&
      (input.key.toLowerCase() === "q" || input.key.toLowerCase() === "w")
    ) {
      app.quit();
    }
    // Show menubar when left alt is pressed
    if (input.type === "keyDown" && input.code === "AltLeft") {
      MenuBarState = !MenuBarState;
      ytMusicWindow.setMenuBarVisibility(MenuBarState);
    }
    // When enter is pressed, send message
    if (input.type === "keyDown" && input.key === "Enter" && !input.shift) {
      try {
        // DM || Story
        ytMusicWindow.webContents.executeJavaScript(`
          elements = document.getElementsByClassName('_0mzm- sqdOP yWX7d');
          console.log(elements);
          if (elements.length) {
            Object.keys(elements)
              .filter(e => elements[e].className === '_0mzm- sqdOP yWX7d        ' || elements[e].className === '_0mzm- sqdOP yWX7d     y1rQx   ')
              .map(i => elements[i].click());
          }
        `);
      } catch (error) {
        console.error(`error desu: ${error}`);
      }
    }
  });
  ytMusicWindow.setMenuBarVisibility(MenuBarState);
  ytMusicWindow.loadURL("https://music.youtube.com/", { userAgent });
  ytMusicWindow.on("close", () => {
    ytMusicWindow = null;
  });
};
app.on("ready", createWindow);
app.on("window-all-closed", () => {
  // on macOS specific close process
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  // macOS specific close process
  if (win === null) {
    createWindow();
  }
});

// Auto Update handlers ^~^ probably not gonna finish this part

const sendStatusToWindow = text => {
  log.info(text);
  if (ytMusicWindow) {
    ytMusicWindow.webContents.send("message", text);
  }
};

autoUpdater.on("checking-for-update", () => {
  sendStatusToWindow("Checking for update...");
});

autoUpdater.on("update-available", info => {
  sendStatusToWindow("Update available.");
});

autoUpdater.on("update-not-available", info => {
  sendStatusToWindow("Update not available.");
});

autoUpdater.on("error", err => {
  sendStatusToWindow(`Error in auto-updater: ${err.toString()}`);
});

autoUpdater.on("download-progress", progressObj => {
  sendStatusToWindow(
    `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${
      progressObj.percent
    }% (${progressObj.transferred} + '/' + ${progressObj.total} + )`
  );
});

autoUpdater.on("update-downloaded", info => {
  sendStatusToWindow("Update downloaded; will install now");
  autoUpdater.quitAndInstall();
});
