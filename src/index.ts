import { app, BrowserWindow, Menu, shell, session, protocol, net } from 'electron';
import contextMenu from 'electron-context-menu';
import registerIpcMain from './register-ipc-main';
import path from "path";

contextMenu({
    showInspectElement: false,
    showSelectAll: false,
    showCopyImage: false,
    showSaveImage: false
});

if (require('electron-squirrel-startup')) {
    app.quit();
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        minWidth: 400,
        width: 800,
        minHeight: 300,
        height: 600,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
        },
        icon: path.join(__dirname, "assets", "logo.png")
    });
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    mainWindow.setMenu(new Menu());
    mainWindow.webContents.setWindowOpenHandler((data) => {
        shell.openExternal(data.url);
        return { action: "deny" };
    });
    registerIpcMain(mainWindow);
};

app.on('ready', () => {
    createWindow();
    protocol.handle("static", (request) => {
        const fileUrl = request.url.replace("static://", "");
        const filePath = path.join(app.getAppPath(), ".webpack/renderer", fileUrl);
        return net.fetch(`file:///${filePath}`);
    });
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});