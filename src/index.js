import { app, BrowserWindow, Menu, MenuItem } from "electron";

const userAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1";
const createWindow = () => {
  let instagramWindow = new BrowserWindow({
    width: 375,
    height: 612,
    backgroundColor: "#F5F5F5",
    title: "Instagram",
    icon: `${__dirname}/assests/logo.png`,
    autoHideMenuBar: true,
    devTools: true,
    textAreasAreResizable: false,
    titleBarStyle: "hidden",
    transparent: true
  });
  instagramWindow.webContents.on("before-input-event", (event, input) => {
    // When enter is pressed, send message
    console.log(input);
    if (input.type === "keyUp" && input.key == "Enter" && !input.shift) {
      try {
        // no callback required ig
        instagramWindow.webContents.executeJavaScript(`
        elements = document.getElementsByClassName('_0mzm- sqdOP yWX7d');
        if (elements.length) {
          Object.keys(elements).filter(i => elements[i].className === '_0mzm- sqdOP yWX7d        ').map(index => elements[index].click());
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
  instagramWindow.setMenuBarVisibility(false);
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
