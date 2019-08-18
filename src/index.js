// import { app, BrowserWindow, Menu, shell } from "electron";
// import { autoUpdater } from "electron-updater";
// import { log } from "electron-log";
// can't get beble to wrok :(
const app = require("electron").app;
const BrowserWindow = require("electron").BrowserWindow;
const Menu = require("electron").Menu;
const shell = require("electron").shell;
const autoUpdater = require("electron-updater").autoUpdater;
const log = require("electron-log");

const userAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1";
let MenuBarState = false;
let instagramWindow = null;

const menuTemplate = [
  {
    label: "Instagram",
    submenu: [
      {
        label: "Share",
        click: async () => {
          await shell.openExternal(
            "https://github.com/Mik1337/instagram/blob/master/README.md"
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
          instagramWindow.setSize(375, 612);
        }
      },
      {
        label: "Tablet Sized",
        click: () => {
          instagramWindow.setSize(768, 1024);
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
          instagramWindow.reload();
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
            "https://help.instagram.com/165828726894770/"
          );
        }
      }
    ]
  }
];

const createWindow = () => {
  instagramWindow = new BrowserWindow({
    width: 375,
    height: 612,
    backgroundColor: "#F5F5F5",
    title: "Instagram",
    icon: `${__dirname}/assests/icon.png`,
    autoHideMenuBar: true,
    devTools: true,
    textAreasAreResizable: false,
    titleBarStyle: "hidden",
    transparent: true
  });
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  instagramWindow.webContents.on("before-input-event", (event, input) => {
    // Show menubar when left alt is pressed
    if (input.type === "keyDown" && input.code === "AltLeft") {
      MenuBarState = !MenuBarState;
      instagramWindow.setMenuBarVisibility(MenuBarState);
    }
    // When enter is pressed, send message
    if (input.type === "keyDown" && input.key === "Enter" && !input.shift) {
      try {
        // DM || Story
        instagramWindow.webContents.executeJavaScript(`
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
    instagramWindow.webContents.setIgnoreMenuShortcuts(
      !input.control && !input.meta
    );
  });
  instagramWindow.setMenuBarVisibility(MenuBarState);
  instagramWindow.loadURL("https://www.instagram.com/", { userAgent });
  instagramWindow.on("close", () => {
    instagramWindow = null;
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

// Auto Update handlers ^~^

const sendStatusToWindow = text => {
  log.info(text);
  if (instagramWindow) {
    instagramWindow.webContents.send("message", text);
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
