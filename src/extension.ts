// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CommandsRegistration } from './utils/commandsRegistration';
import { ResourceTreeProvider } from './providers/resourceTreeProvider';
import { ProvidersRegistration } from './utils/providersRegistration';
import { ResourcesContainer } from './models/resources/resourcesContainer';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	console.log('DOTNET RESOURCE MANAGER ACTIVATED');


	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (workspaceFolders === undefined || workspaceFolders.length === 0 || workspaceFolders[0] === undefined) {
		// vscode.window.showErrorMessage("No workspace folder found. Please open a folder in order to use the extension.");
		return;
	}

	// 	const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(workspaceFolders[0], "**/*.*"));

	// 	watcher.onDidChange(uri => { ... }); // listen to files being changed
	// watcher.onDidCreate(uri => { ... }); // listen to files/folders being created
	// watcher.onDidDelete(uri => { ... }); // listen to files/folders getting deleted

	// watcher.dispose(); // dispose after usage


	const providersRegistration = new ProvidersRegistration(context);
	await providersRegistration.resourceEditor();

	const commandsRegistration = new CommandsRegistration(context);
	commandsRegistration.createResourceFiles();
	commandsRegistration.setDefaultCreateDirectory();

	const provider = new ResourceTreeProvider();
	vscode.window.registerTreeDataProvider(
		'resourceFilesView',
		provider
	);

}

// This method is called when your extension is deactivated
export function deactivate() { }
