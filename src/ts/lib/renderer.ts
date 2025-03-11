import { U } from 'Lib';

class Renderer {

	send (...args: any[]) {
		args = args || [];

		const cmd = args[0];
		const electron = U.Common.getElectron();
		const currentWindow = electron.currentWindow();
		const winId = Number(currentWindow?.windowId) || 0;

		args.shift();
		args = args.map((it: any) => {
			if (('undefined' == typeof(it)) || (it === null)) {
				it = '';
			};
			return it;
		});

		return electron.Api(winId, cmd, U.Common.objectCopy(args));
	};

	on (event: string, callBack: any) {
		this.remove(event);
		U.Common.getElectron().on(event, (...args: any[]) => callBack.apply(this, args));
	};

	remove (event: string) {
		U.Common.getElectron().removeAllListeners(event);
	};
    // Function to dock the window to the left
    dockWindowToLeft() {
        ipcRenderer.send('dockWindow', 'left');
    }
};

// Example usage: Add an event listener to a button (or any other UI element) to trigger the docking
document.getElementById('dock-left-btn')?.addEventListener('click', () => {
    const renderer = new Renderer();
    renderer.dockWindowToLeft();
});

export default new Renderer();
