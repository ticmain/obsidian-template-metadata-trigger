/*import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

export default class TemplateAdderPlugin extends Plugin{
	
	  
		onload() {
		  this.registerEvent(
			this.app.metadataCache.on('changed', (file) => {
			  this.handleMetadataChange(file);
			})
		  );
		}
	  
		async handleMetadataChange(file) {
		  const fileCache = this.app.metadataCache.getFileCache(file);
		  const noteType = fileCache?.frontmatter?.noteType;
	  
		  if (noteType) {
			const fileContent = await this.app.vault.read(file);
			const updatedContent = `note type is: ${noteType}\n\n${fileContent}`;
			await this.app.vault.modify(file, updatedContent);
		  }
		}
	  
		onunload() {
		  console.log("Unloading Note Type Watcher plugin");
		}
};*/

/*import { Plugin } from 'obsidian';

export default class TemplateAdderPlugin extends Plugin {
    onload() {
        this.registerEvent(
            this.app.metadataCache.on('changed', (file) => {
                this.handleMetadataChange(file);
            })
        );
    }

    async handleMetadataChange(file) {
        const fileCache = this.app.metadataCache.getFileCache(file);
        const noteType = fileCache?.frontmatter?.noteType;

        if (noteType) {
            let fileContent = await this.app.vault.read(file);
            const noteTypeLine = `note type is: ${noteType}`;
            const metadataEndIndex = fileContent.indexOf('\n---', fileContent.indexOf('---') + 3);

            if (metadataEndIndex !== -1) {
                // Check if "note type is: " line already exists and update it
                const noteTypeLineRegex = /^note type is: ./*m;
                if (fileContent.match(noteTypeLineRegex)) {
                    fileContent = fileContent.replace(noteTypeLineRegex, noteTypeLine);
                } else {
                    // Insert the "note type is: {noteType}" line right after the metadata block
                    fileContent = fileContent.slice(0, metadataEndIndex + 4) + `\n${noteTypeLine}\n` + fileContent.slice(metadataEndIndex + 4);
                }
                await this.app.vault.modify(file, fileContent);
            }
        }
    }

    onunload() {
        console.log("Unloading Template Adder plugin");
    }
}; */
/*this one below works, but causes a loop

import { Plugin } from 'obsidian';

export default class TemplateAdderPlugin extends Plugin {
    onload() {
        this.registerEvent(
            this.app.metadataCache.on('changed', (file) => {
                this.handleMetadataChange(file);
            })
        );
    }

    async handleMetadataChange(file) {
        const fileCache = this.app.metadataCache.getFileCache(file);
        const noteType = fileCache?.frontmatter?.noteType;

        if (noteType) {
            let fileContent = await this.app.vault.read(file);
            let divPlaceholder = `<div class="type-template ${noteType}"></div>`; // Changed to `let`
            const metadataEndIndex = fileContent.indexOf('\n---', fileContent.indexOf('---') + 3);

            if (metadataEndIndex !== -1) {
                let insertionPoint = metadataEndIndex + 4; // Adjust to place after the metadata block
                if (fileContent.substring(insertionPoint, insertionPoint + 1) !== '\n') {
                    // Ensure there's a newline after the metadata block before inserting
                    divPlaceholder = '\n' + divPlaceholder;
                }
                // Check for existing div and replace or insert the new div placeholder
                const existingDivIndex = fileContent.indexOf('<div class="type-template');
                if (existingDivIndex !== -1) {
                    // Calculate where the existing div ends
                    const endOfExistingDiv = fileContent.indexOf('</div>', existingDivIndex) + 6; // Include length of '</div>'
                    fileContent = fileContent.substring(0, existingDivIndex) + divPlaceholder + fileContent.substring(endOfExistingDiv);
                } else {
                    // Insert new div placeholder
                    fileContent = fileContent.slice(0, insertionPoint) + divPlaceholder + '\n' + fileContent.slice(insertionPoint);
                }
                await this.app.vault.modify(file, fileContent);
            }
        }
    }

    onunload() {
        console.log("Unloading Template Adder plugin");
    }
};
The below works, now looking to preserve old settings if they change 
import { Plugin } from 'obsidian';

export default class TemplateAdderPlugin extends Plugin {
    onload() {
        this.registerEvent(
            this.app.metadataCache.on('changed', (file) => {
                this.handleMetadataChange(file);
            })
        );
    }

    async handleMetadataChange(file) {
        const fileCache = this.app.metadataCache.getFileCache(file);
        const noteType = fileCache?.frontmatter?.noteType;

        if (noteType) {
            let fileContent = await this.app.vault.read(file);
            const metadataEndIndex = fileContent.indexOf('\n---', fileContent.indexOf('---') + 3);
            if (metadataEndIndex !== -1) {
                const divRegex = /<div class="type-template ([^"]+)"><\/div>/;
                const existingDivMatch = fileContent.match(divRegex);
                let shouldUpdate = true;

                // Check if the existing div has the correct noteType
                if (existingDivMatch && existingDivMatch[1] === noteType) {
                    shouldUpdate = false; // The correct div already exists, no need to update
                }

                if (shouldUpdate) {
                    // Prepare the divPlaceholder with an ensured newline both before and after
                    let divPlaceholder = `\n <div class="type-template ${noteType}"></div> \n`;
                    let insertionPoint = metadataEndIndex + 4; // Adjust to place right after metadata block

                    // Check if there's already a newline immediately after the metadata block
                    if (fileContent[insertionPoint] === '\n') {
                        // If there's a newline, adjust divPlaceholder and insertionPoint not to duplicate the newline
                        divPlaceholder = `\n<div class="type-template ${noteType}"></div>\n`;
                    } else {
                        // If there isn't a newline, adjust the insertion point to add one more newline
                        insertionPoint += 1;
                    }

                    if (existingDivMatch) {
                        // Replace the existing, incorrect div by finding the whole line for the div
                        const startIndex = fileContent.lastIndexOf('\n', existingDivMatch.index) + 1;
                        const endIndex = fileContent.indexOf('\n', existingDivMatch.index + existingDivMatch[0].length);
                        fileContent = fileContent.substring(0, startIndex) + divPlaceholder.trim() + fileContent.substring(endIndex);
                    } else {
                        // Insert the new div placeholder, managing newlines appropriately
                        fileContent = fileContent.slice(0, insertionPoint) + divPlaceholder + fileContent.slice(insertionPoint);
                    }
                    await this.app.vault.modify(file, fileContent);
                }
            }
        }
    }

    onunload() {
        console.log("Unloading Template Adder plugin");
    }
};
this works for adding new divs and not repeating them, but does not add the previuos tag 
import { Plugin } from 'obsidian';

export default class TemplateAdderPlugin extends Plugin {
    onload() {
        this.registerEvent(
            this.app.metadataCache.on('changed', (file) => {
                this.handleMetadataChange(file);
            })
        );
    }

    async handleMetadataChange(file) {
        const fileCache = this.app.metadataCache.getFileCache(file);
        const noteType = fileCache?.frontmatter?.noteType;

        if (noteType) {
            let fileContent = await this.app.vault.read(file);
            const metadataEndIndex = fileContent.indexOf('\n---', fileContent.indexOf('---') + 3);
            if (metadataEndIndex !== -1) {
                // Matches all divs, capturing the "previous" class presence and the noteType
                const divRegex = /<div class="type-template(?: previous)? ([^"]+)"><\/div>/g;
                let modifiedContent = fileContent.substring(0, metadataEndIndex + 4);
                let shouldAddNewDiv = true;
                let divsToUpdate = [];
                let match;

                // Collect divs to update if not marked as previous, except the current noteType to be added last
                while ((match = divRegex.exec(fileContent)) !== null) {
                    if (match[1] === noteType && match.index > metadataEndIndex) {
                        shouldAddNewDiv = false; // Found a div for the current noteType after metadata
                    } else if (match.index > metadataEndIndex) {
                        divsToUpdate.push(match[0]);
                    }
                }

                // Update collected divs to "previous"
                divsToUpdate.forEach(div => {
                    const updatedDiv = div.replace('type-template', 'type-template previous');
                    modifiedContent = modifiedContent.replace(div, updatedDiv);
                });

                // Append rest of fileContent in case there's content beyond divs to maintain
                modifiedContent += fileContent.substring(metadataEndIndex + 4);

                if (shouldAddNewDiv) {
                    // Insert the new div for the current noteType
                    let divPlaceholder = `\n<div class="type-template ${noteType}"></div>\n`;
                    modifiedContent = modifiedContent.slice(0, metadataEndIndex + 4) + divPlaceholder + modifiedContent.slice(metadataEndIndex + 4);
                }

                // Apply changes if there are any
                if (modifiedContent !== fileContent) {
                    await this.app.vault.modify(file, modifiedContent);
                }
            }
        }
    }

    onunload() {
        console.log("Unloading Template Adder plugin");
    }
};
the below works great. next going to see if I can remove the old previous class if a type is reselected
import { Plugin } from 'obsidian';

export default class TemplateAdderPlugin extends Plugin {
    onload() {
        this.registerEvent(
            this.app.metadataCache.on('changed', (file) => {
                this.handleMetadataChange(file);
            })
        );
    }

    async handleMetadataChange(file) {
        const fileCache = this.app.metadataCache.getFileCache(file);
        const noteType = fileCache?.frontmatter?.noteType;

        if (noteType) {
            let fileContent = await this.app.vault.read(file);
            const metadataBlockEnd = fileContent.indexOf('\n---', fileContent.indexOf('---') + 3) + 4;
            if (metadataBlockEnd > 3) { // Checks that the metadata block was found
                const existingContent = fileContent.substring(metadataBlockEnd);
                const existingDivRegex = /<div class="type-template( previous)? ([^"]+)"><\/div>/g;
                
                let newContent = '';
                let lastDivFound = false;
                let existingDivsModified = existingContent.replace(existingDivRegex, (match, p1, p2) => {
                    if (p2.trim() === noteType && !lastDivFound) {
                        lastDivFound = true; // This is the last div for the current noteType, keep it as is
                        return match;
                    } else if (!p1) {
                        return match.replace('type-template', 'type-template previous'); // Add "previous" only if it's not already there
                    }
                    return match; // Return unmodified if already marked as previous
                });

                // If no div for the current noteType was found, append one at the start of the content after the metadata block
                if (!lastDivFound) {
                    newContent = `\n<div class="type-template ${noteType}"></div>\n` + existingDivsModified;
                } else {
                    newContent = existingDivsModified; // Use the modified content directly
                }

                // Combine with the part before the metadata block
                let finalContent = fileContent.substring(0, metadataBlockEnd) + newContent;

                // Check if content needs updating to prevent unnecessary writes
                if (finalContent !== fileContent) {
                    await this.app.vault.modify(file, finalContent);
                }
            }
        }
    }

    onunload() {
        console.log("Unloading Template Adder plugin");
    }
};
ok. this works. now working to get the template part code inside the divs 
import { Plugin } from 'obsidian';

export default class TemplateAdderPlugin extends Plugin {
    onload() {
        this.registerEvent(
            this.app.metadataCache.on('changed', (file) => {
                this.handleMetadataChange(file);
            })
        );
    }

    async handleMetadataChange(file) {
        const fileCache = this.app.metadataCache.getFileCache(file);
        const noteType = fileCache?.frontmatter?.noteType;

        if (noteType) {
            let fileContent = await this.app.vault.read(file);
            const metadataBlockEnd = fileContent.indexOf('\n---', fileContent.indexOf('---') + 3) + 4;
            if (metadataBlockEnd > 3) { // Ensure the metadata block was found
                const contentAfterMetadata = fileContent.substring(metadataBlockEnd);
                // Match divs with and without the "previous" class, capturing the class presence and noteType
                const divRegex = /<div class="type-template(?: previous)? ([^"]+)"><\/div>/g;
                
                let newContent = '';
                let foundMatchingDiv = false;
                let divsAfterMetadata = contentAfterMetadata.replace(divRegex, (match, capturedNoteType) => {
                    if (capturedNoteType.trim() === noteType) {
                        foundMatchingDiv = true; // Found a div matching the current noteType
                        // Remove "previous" class if present, since this noteType is selected again
                        return `<div class="type-template ${noteType}"></div>`;
                    }
                    // Ensure all other divs are marked as "previous"
                    return match.includes('previous') ? match : match.replace('type-template', 'type-template previous');
                });

                if (!foundMatchingDiv) {
                    // Append a new div for the current noteType if none was found
                    newContent = `\n<div class="type-template ${noteType}"></div>\n` + divsAfterMetadata;
                } else {
                    newContent = divsAfterMetadata; // Use the modified content directly
                }

                // Combine with the part before the metadata block
                let finalContent = fileContent.substring(0, metadataBlockEnd) + newContent;

                // Check if content needs updating to prevent unnecessary writes
                if (finalContent !== fileContent) {
                    await this.app.vault.modify(file, finalContent);
                }
            }
        }
    }

    onunload() {
        console.log("Unloading Template Adder plugin");
    }
};

The above script works as expected, but if you have content in the middle it doesnt work
import { Plugin } from 'obsidian';

export default class TemplateAdderPlugin extends Plugin {
    onload() {
        this.registerEvent(
            this.app.metadataCache.on('changed', (file) => {
                this.handleMetadataChange(file);
            })
        );
    }

    async handleMetadataChange(file) {
        const fileCache = this.app.metadataCache.getFileCache(file);
        const noteType = fileCache?.frontmatter?.noteType;

        if (noteType) {
            let fileContent = await this.app.vault.read(file);
            const metadataBlockEnd = fileContent.indexOf('\n---', fileContent.indexOf('---') + 3) + 4;
            if (metadataBlockEnd > 3) { // Ensure the metadata block was found
                // Modified regex to capture inner content of the div
                const divRegex = /<div class="type-template(?: previous)? ([^"]+)">([\s\S]*?)<\/div>/g;
                
                let newContent = '';
                let foundMatchingDiv = false;
                let divsAfterMetadata = fileContent.substring(metadataBlockEnd).replace(divRegex, (match, capturedNoteType, innerContent) => {
                    if (capturedNoteType.trim() === noteType && !foundMatchingDiv) {
                        foundMatchingDiv = true; // Found a div matching the current noteType
                        // Reactivate this div by removing "previous" class, if present, and preserve its content
                        return `<div class="type-template ${noteType}">${innerContent}</div>`;
                    }
                    // Mark other divs as "previous" but keep their content
                    return match.includes('previous') ? match : `<div class="type-template previous ${capturedNoteType}">${innerContent}</div>`;
                });

                if (!foundMatchingDiv) {
                    // If no active div for the current noteType was found, append a new one
                    newContent = `\n<div class="type-template ${noteType}"></div>\n` + divsAfterMetadata;
                } else {
                    newContent = divsAfterMetadata;
                }

                // Combine with the part before the metadata block
                let finalContent = fileContent.substring(0, metadataBlockEnd) + newContent;

                // Update the file content if changes have been made
                if (finalContent !== fileContent) {
                    await this.app.vault.modify(file, finalContent);
                }
            }
        }
    }

    onunload() {
        console.log("Unloading Template Adder plugin");
    }
};
the above Works now we're going to add content the div when it's createD but not if it already exists 
import { Plugin } from 'obsidian';

export default class TemplateAdderPlugin extends Plugin {
    onload() {
        this.registerEvent(
            this.app.metadataCache.on('changed', (file) => {
                this.handleMetadataChange(file);
            })
        );
    }

    async handleMetadataChange(file) {
        const fileCache = this.app.metadataCache.getFileCache(file);
        const noteType = fileCache?.frontmatter?.noteType;

        if (noteType) {
            let fileContent = await this.app.vault.read(file);
            const metadataBlockEnd = fileContent.indexOf('\n---', fileContent.indexOf('---') + 3) + 4;
            if (metadataBlockEnd > 3) { // Ensure the metadata block was found
                // Modified regex to capture inner content of the div
                const divRegex = /<div class="type-template(?: previous)? ([^"]+)">([\s\S]*?)<\/div>/g;
                
                let foundMatchingDiv = false;
                let divsAfterMetadata = fileContent.substring(metadataBlockEnd).replace(divRegex, (match, capturedNoteType, innerContent) => {
                    if (capturedNoteType.trim() === noteType && !foundMatchingDiv) {
                        foundMatchingDiv = true; // Found a div matching the current noteType, preserve its content
                        return `<div class="type-template ${noteType}">${innerContent}</div>`;
                    }
                    // Mark other divs as "previous" but keep their content
                    return match.includes('previous') ? match : `<div class="type-template previous ${capturedNoteType}">${innerContent}</div>`;
                });

                let newContent;
                if (!foundMatchingDiv) {
                    // If no active div for the current noteType was found, append a new one with default text
                    const innerNewContent = "this is new content"
                    const dataViewContent = "\n```datviewjs \nthis.app.commands.executeCommandById('templater-obsidian:x-eCortex_Operations/xUtilities/Templates/Goal Template.md');\n```";
                    //commandContent =  this.app.commands.executeCommandById('templater-obsidian:x-eCortex_Operations/xUtilities/Templates/Goal Template.md');
                   // console.log(commandContent);
                    //newContent = `\n<div class="type-template ${noteType}">` + dataViewContent +`</div>\n` + divsAfterMetadata;
                    newContent = dataViewContent;
                } else {
                    newContent = divsAfterMetadata;
                }

                // Combine with the part before the metadata block
                let finalContent = fileContent.substring(0, metadataBlockEnd) + newContent;

                // Update the file content if changes have been made
                if (finalContent !== fileContent) {
                    await this.app.vault.modify(file, finalContent);
                }
            }
        }
    }

    onunload() {
        console.log("Unloading Template Adder plugin");
    }
};

The above Workspace, now we're looking to add templater content below 
import { Plugin } from 'obsidian';

export default class TemplateAdderPlugin extends Plugin {
    onload() {
        this.registerEvent(
            this.app.metadataCache.on('changed', (file) => {
                this.handleMetadataChange(file);
            })
        );

        // Define the reload page command
        this.addCommand({
            id: 'reload-page',
            name: 'Reload page',
            callback: () => {
                this.app.workspace.activeLeaf.rebuildView();
            }
        });
    }

    async handleMetadataChange(file) {
        const fileCache = this.app.metadataCache.getFileCache(file);
        const noteType = fileCache?.frontmatter?.noteType;

        if (noteType) {
            let fileContent = await this.app.vault.read(file);
            const metadataBlockEnd = fileContent.indexOf('\n---', fileContent.indexOf('---') + 3) + 4;
            if (metadataBlockEnd > 3) { // Ensure the metadata block was found
                
                const templaterCommand = `\n\`\`\`dataviewjs\nthis.app.commands.executeCommandById('templater-obsidian:x-eCortex_Operations/xUtilities/Templates/Goal Template.md');\n\`\`\`\n`;
                const alreadyHasCommand = fileContent.includes(templaterCommand.trim());

                let foundMatchingDiv = false;
                let modifiedContentAfterMetadata = fileContent.substring(metadataBlockEnd).replace(
                    /<div class="type-template( previous)? ([^"]+)">([\s\S]*?)<\/div>/g,
                    (match, previous, capturedNoteType, innerContent) => {
                        if (capturedNoteType.trim() === noteType) {
                            foundMatchingDiv = true;
                            return `<div class="type-template ${noteType}">${innerContent}</div>`;
                        }
                        return match;
                    }
                );

                let finalContent;
                if (!foundMatchingDiv && !alreadyHasCommand) {
                    finalContent = fileContent.substring(0, metadataBlockEnd) + templaterCommand + modifiedContentAfterMetadata;
                } else {
                    finalContent = fileContent.substring(0, metadataBlockEnd) + modifiedContentAfterMetadata;
                }

                if (finalContent !== fileContent) {
                    await this.app.vault.modify(file, finalContent);
                    // Additional logic to decide when to call the refresh
                    if (!foundMatchingDiv && !alreadyHasCommand) {
                        // Execute the reload page command after updating the content
                        this.app.commands.executeCommandById('reload-page');
                        //console.log("refresh happened");
                    }
                }
            }
        }
    }

    ronunload() {
        console.log("Unloading Template Adder plugin");
    }
}
below this works! but we lost the adding/removing of the "previous" class on the divs
import { Plugin } from 'obsidian';

export default class TemplateAdderPlugin extends Plugin {
    lastNoteType: string = "";

    onload() {
        this.registerEvent(
            this.app.metadataCache.on('changed', async (file) => {
                const fileCache = this.app.metadataCache.getFileCache(file);
                const currentNoteType = fileCache?.frontmatter?.noteType;

                if (currentNoteType && this.lastNoteType !== currentNoteType) {
                    this.lastNoteType = currentNoteType; // Update the lastNoteType
                    await this.processNoteTypeChange(file, currentNoteType);
                }
            })
        );
    }

    async processNoteTypeChange(file, noteType) {
        let fileContent = await this.app.vault.read(file);
        const metadataBlockEnd = fileContent.indexOf('\n---', fileContent.indexOf('---') + 3) + 4;
        if (metadataBlockEnd <= 3) return; // Exit early if metadata block not found

        // Define the DataviewJS block to insert
        const templaterCommand = `\n\`\`\`dataviewjs\nthis.app.commands.executeCommandById('templater-obsidian:x-eCortex_Operations/xUtilities/Templates/Goal Template.md');\n\`\`\`\n`;

        let foundMatchingDiv = false;
        let modifiedContentAfterMetadata = fileContent.substring(metadataBlockEnd).replace(
            /<div class="type-template( previous)? ([^"]+)">([\s\S]*?)<\/div>/g,
            (match, previous, capturedNoteType, innerContent) => {
                if (capturedNoteType.trim() === noteType) {
                    foundMatchingDiv = true; // Found a div matching the current noteType
                    return `<div class="type-template ${noteType}">${innerContent}</div>`;
                }
                // Mark other divs as "previous" but keep their content
                return `<div class="type-template previous ${capturedNoteType}">${innerContent}</div>`;
            }
        );

        if (!foundMatchingDiv && !fileContent.includes(templaterCommand)) {
            // If the specific div for the new noteType isn't found and the DataviewJS block isn't already there
            // Append the DataviewJS block to the end of the file content
            await this.app.vault.modify(file, fileContent + templaterCommand);
            // Perform a brief pause to ensure the file modification is saved
            await new Promise(resolve => setTimeout(resolve, 500));
            // Refresh the view
            this.app.workspace.activeLeaf.rebuildView();
            // Wait a bit for the refresh to presumably complete, then remove the DataviewJS block
            setTimeout(async () => {
                let updatedContent = await this.app.vault.read(file);
                updatedContent = updatedContent.replace(templaterCommand, ""); // Remove the DataviewJS block
                await this.app.vault.modify(file, updatedContent);
            }, 1000); // Adjust delay as needed
        }
    }

    onunload() {
        console.log("Unloading Template Adder plugin");
    }
} but we lost the adding/removing of the "previous" class on the divs 

below brings back the "previous" class functionality

import { Plugin } from 'obsidian';

export default class TemplateAdderPlugin extends Plugin {
    lastNoteType: string = "";

    onload() {
        this.registerEvent(
            this.app.metadataCache.on('changed', async (file) => {
                const fileCache = this.app.metadataCache.getFileCache(file);
                const currentNoteType = fileCache?.frontmatter?.noteType;

                if (currentNoteType && this.lastNoteType !== currentNoteType) {
                    this.lastNoteType = currentNoteType; // Update the lastNoteType
                    await this.processNoteTypeChange(file, currentNoteType);
                }
            })
        );
    }

    async processNoteTypeChange(file, noteType) {
        let fileContent = await this.app.vault.read(file);
        const metadataBlockEnd = fileContent.indexOf('\n---', fileContent.indexOf('---') + 3) + 4;
        if (metadataBlockEnd <= 3) return; // Exit early if metadata block not found

        const templaterCommand = `\n\`\`\`dataviewjs\nthis.app.commands.executeCommandById('templater-obsidian:x-eCortex_Operations/xUtilities/Templates/Goal Template.md');\n\`\`\`\n`;
        let insertDataviewBlock = !fileContent.includes(templaterCommand);
        let foundMatchingDiv = false;

        // Update divs, setting the current noteType div as active and others as previous
        let modifiedContentAfterMetadata = fileContent.substring(metadataBlockEnd).replace(
            /<div class="type-template( previous)? ([^"]+)">([\s\S]*?)<\/div>/g,
            (match, previous, capturedNoteType, innerContent) => {
                if (capturedNoteType.trim() === noteType) {
                    foundMatchingDiv = true; // Found a div matching the current noteType
                    // Remove "previous" class if it exists
                    return `<div class="type-template ${noteType}">${innerContent}</div>`;
                } else if (!previous) {
                    // Add "previous" class to other noteType divs
                    return `<div class="type-template previous ${capturedNoteType}">${innerContent}</div>`;
                }
                return match; // Return match unmodified if it already has the "previous" class
            }
        );

        let finalContent = fileContent.substring(0, metadataBlockEnd) + modifiedContentAfterMetadata;
        if (insertDataviewBlock && !foundMatchingDiv) {
            finalContent += templaterCommand; // Append the DataviewJS block if needed
        }

        if (finalContent !== fileContent) {
            await this.app.vault.modify(file, finalContent);
            if (insertDataviewBlock && !foundMatchingDiv) {
                // Wait briefly to ensure the file modification is saved
                setTimeout(() => {
                    this.app.workspace.activeLeaf.rebuildView(); // Refresh the view
                    // Remove the DataviewJS block after the refresh
                    setTimeout(async () => {
                        let updatedContent = await this.app.vault.read(file);
                        updatedContent = updatedContent.replace(templaterCommand, "");
                        await this.app.vault.modify(file, updatedContent);
                    }, 1000); // Adjust delay as needed
                }, 500);
            }
        }
    }

    onunload() {
        console.log("Unloading Template Adder plugin");
    }
}
the above Works. now we we are working on making the dataviewjs block dynamic
import { Plugin } from 'obsidian';

export default class TemplateAdderPlugin extends Plugin {
    onload() {
        this.registerEvent(
            this.app.metadataCache.on('changed', async (file) => {
                const fileCache = this.app.metadataCache.getFileCache(file);
                const currentNoteType = fileCache?.frontmatter?.noteType;

                if (currentNoteType && this.lastNoteType !== currentNoteType) {
                    this.lastNoteType = currentNoteType; // Update the lastNoteType
                    await this.processNoteTypeChange(file, currentNoteType);
                }
            })
        );
    }

    async processNoteTypeChange(file, noteType) {
        let fileContent = await this.app.vault.read(file);
        const metadataBlockEnd = fileContent.indexOf('\n---', fileContent.indexOf('---') + 3) + 4;
        if (metadataBlockEnd <= 3) return; // Exit early if metadata block not found
        
        // Declare templaterCommand outside of the if statement so it's scoped correctly
         let templaterCommand;
        
        
        const templateLocation = "x-eCortex_Operations/xUtilities/Templates";
       // Dynamically construct the Templater command string
        const templaterCommandString = `templater-obsidian:${templateLocation}/${noteType} Template.md`;

                // Check if the Templater command exists
        const commandExists = this.app.commands.commands[templaterCommandString] !== undefined;
        if (commandExists) {
            templaterCommand = `\n\`\`\`dataviewjs\nthis.app.commands.executeCommandById('templater-obsidian:${templateLocation}/${noteType} Template.md');\n\`\`\`\n`;
            console.log(`Command ${templaterCommandString} exists. Proceeding with operations.`);
            // Dynamically construct the DataviewJS block with the current noteType
            
        } else {
            console.warn(`Command ${templaterCommandString} does not exist. Aborting related operations.`);
            // Possibly skip adding the DataviewJS block or handle differently
            templaterCommand = `\n\`\`\`dataviewjs\nthis.app.commands.executeCommandById('templater-obsidian:${templateLocation}/General Template.md');\n\`\`\`\n`;
        }
       

        let insertDataviewBlock = !fileContent.includes(templaterCommand);
        let foundMatchingDiv = false;

        // Update divs and insert or remove the "previous" class as needed
        let modifiedContentAfterMetadata = fileContent.substring(metadataBlockEnd).replace(
            /```{cssBlockStart class="type-template( previous)? ([^"]+)"}```([\s\S]*?)```{cssBlockEnd} ```/g,
            (match, previous, capturedNoteType, innerContent) => {
                if (capturedNoteType.trim() === noteType) {
                    foundMatchingDiv = true; // Found a div matching the current noteType
                    return `\`\`\`{cssBlockStart class="type-template ${noteType}"}\`\`\`${innerContent}\`\`\`{cssBlockEnd} \`\`\``;
                } else if (!previous) {
                    return `\`\`\`{cssBlockStart class="type-template previous ${capturedNoteType}"}\`\`\`${innerContent}\`\`\`{cssBlockEnd} \`\`\``;
                }
                return match;
            }
        );

        let finalContent = fileContent.substring(0, metadataBlockEnd) + modifiedContentAfterMetadata;
        if (insertDataviewBlock && !foundMatchingDiv) {
            finalContent += templaterCommand; // Append the dynamically constructed DataviewJS block if needed
            console.log(templaterCommand);
        }

        if (finalContent !== fileContent) {
            await this.app.vault.modify(file, finalContent);
            if (insertDataviewBlock && !foundMatchingDiv) {
                setTimeout(() => {
                    this.app.workspace.activeLeaf.rebuildView(); // Refresh the view
                    setTimeout(async () => {
                        let updatedContent = await this.app.vault.read(file);
                        updatedContent = updatedContent.replace(templaterCommand, ""); // Clean up by removing the DataviewJS block
                        await this.app.vault.modify(file, updatedContent);
                    }, 1000);
                }, 500);
            }
        }
    }

    onunload() {
        console.log("Unloading Template Adder plugin");
    }
}
the above works almost, but puts the content above the metadata fields instead of below. code below trying to fix that.
import { Plugin } from 'obsidian';

export default class TemplateAdderPlugin extends Plugin {
    onload() {
        this.registerEvent(
            this.app.metadataCache.on('changed', async (file) => {
                const fileCache = this.app.metadataCache.getFileCache(file);
                const currentNoteType = fileCache?.frontmatter?.noteType;

                if (currentNoteType && this.lastNoteType !== currentNoteType) {
                    this.lastNoteType = currentNoteType; // Update the lastNoteType
                    await this.processNoteTypeChange(file, currentNoteType);
                }
            })
        );
    }

    async processNoteTypeChange(file, noteType) {
        let fileContent = await this.app.vault.read(file);
        // Determine the end of the metadata block
        const metadataBlockEnd = fileContent.indexOf('\n---', fileContent.indexOf('---') + 3) + 4;
        if (metadataBlockEnd <= 3) return; // Exit early if metadata block not found
        
        // Attempt to focus on the active note editor
        this.focusOnActiveEditor();

        const templateLocation = "x-eCortex_Operations/xUtilities/Templates";
        const templaterCommandString = `templater-obsidian:${templateLocation}/${noteType} Template.md`;

        // Check if the Templater command exists
        const commandExists = this.app.commands.commands[templaterCommandString] !== undefined;

        let templaterCommand;
        if (commandExists) {
            templaterCommand = `\n\`\`\`dataviewjs\nthis.app.commands.executeCommandById('${templaterCommandString}');\n\`\`\`\n`;
        } else {
            // Use a general template if the specific noteType template does not exist
            templaterCommand = `\n\`\`\`dataviewjs\nthis.app.commands.executeCommandById('templater-obsidian:${templateLocation}/General Template.md');\n\`\`\`\n`;
        }

        let insertDataviewBlock = !fileContent.includes(templaterCommand);
        let foundMatchingDiv = false;

        // Use your original regex for matching and updating existing blocks
        let modifiedContentAfterMetadata = fileContent.substring(metadataBlockEnd).replace(
            /```{cssBlockStart class="type-template( previous)? ([^"]+)"}```([\s\S]*?)```{cssBlockEnd} ```/g,
            (match, previous, capturedNoteType, innerContent) => {
                if (capturedNoteType.trim() === noteType) {
                    foundMatchingDiv = true; // Found a div matching the current noteType
                    return `\`\`\`{cssBlockStart class="type-template ${noteType}"}\`\`\`${innerContent}\`\`\`{cssBlockEnd} \`\`\``;
                } else if (!previous) {
                    return `\`\`\`{cssBlockStart class="type-template previous ${capturedNoteType}"}\`\`\`${innerContent}\`\`\`{cssBlockEnd} \`\`\``;
                }
                return match;
            }
        );

        let finalContent = fileContent.substring(0, metadataBlockEnd) + modifiedContentAfterMetadata;
        if (insertDataviewBlock && !foundMatchingDiv) {
            finalContent += templaterCommand; // Append the dynamically constructed DataviewJS block if needed
        }

        if (finalContent !== fileContent) {
            await this.app.vault.modify(file, finalContent);
            if (insertDataviewBlock && !foundMatchingDiv) {
                setTimeout(() => {
                    this.app.workspace.activeLeaf.rebuildView(); // Refresh the view
                    setTimeout(async () => {
                        let updatedContent = await this.app.vault.read(file);
                        updatedContent = updatedContent.replace(templaterCommand, ""); // Clean up by removing the DataviewJS block
                        await this.app.vault.modify(file, updatedContent);
                    }, 1000); //eric just changed this from 1000 to 2000 on 2/26 at 1210p
                }, 500);
            }
        }
    }

    focusOnActiveEditor() {
        const activeLeaf = this.app.workspace.activeLeaf;
        if (activeLeaf && activeLeaf.view.getViewType() === 'markdown') {
            const editor = activeLeaf.view.sourceMode.cmEditor;
            editor.focus(); // Focus on the editor
            // Optionally, set the cursor to a specific position
            // editor.setCursor(editor.lineCount(), 0); // Move cursor to the end
        }
    }

    onunload() {
        console.log("Unloading Template Adder plugin");
    }
}
///above works now trying to make the templates directory finding dynamic
*/

import { Plugin } from 'obsidian';

export default class TemplateAdderPlugin extends Plugin {

    templaterSettingsLocation: string = ""; // Class property to hold the templates location

    onload() {
        this.app.workspace.onLayoutReady(() => { //get the location of the templates directory
            this.getTemplatertemplaterSettingsLocation().then(location => {
                if (location) {
                    this.templaterSettingsLocation = location; // Set the class property
                    console.log("Templates location set:", this.templaterSettingsLocation);
                    // Now you can use this.templaterSettingsLocation in other parts of your plugin
                }
            });
        });

        this.registerEvent(
            this.app.metadataCache.on('changed', async (file) => {
                const fileCache = this.app.metadataCache.getFileCache(file);
                const currentNoteType = fileCache?.frontmatter?.noteType;

                if (currentNoteType && this.lastNoteType !== currentNoteType) {
                    this.lastNoteType = currentNoteType; // Update the lastNoteType
                    await this.processNoteTypeChange(file, currentNoteType);
                }
            })
        );
    }

    async getTemplatertemplaterSettingsLocation(): Promise<string | null> {
        const templaterPlugin = this.app.plugins.getPlugin('templater-obsidian');
        
        if (!templaterPlugin) {
            console.error('Templater plugin is not loaded.');
            return null;
        }

        const templaterSettingsLocation = templaterPlugin.settings?.templates_folder;
        
        if (templaterSettingsLocation) {
            console.log('Templater template location:', templaterSettingsLocation);
            return templaterSettingsLocation;
        } else {
            console.error('Unable to retrieve Templater template location.');
            return null;
        }
    }
        
    async processNoteTypeChange(file, noteType) {
        let fileContent = await this.app.vault.read(file);
        // Determine the end of the metadata block
        let metadataBlockEnd = fileContent.indexOf('\n---', fileContent.indexOf('---') + 3) + 4;
        if (metadataBlockEnd <= 3) return; // Exit early if metadata block not found
        
        // Look for a heading immediately following the metadata block
        // This regex looks for any text that starts with "#" and is followed by any characters until a newline
        const headingRegex = /\n# .+\n/;
        const contentAfterMetadata = fileContent.substring(metadataBlockEnd);
        const headingMatch = headingRegex.exec(contentAfterMetadata);

        if (headingMatch) {
            // Adjust metadataBlockEnd to include the heading
            metadataBlockEnd += headingMatch.index + headingMatch[0].length;
        }           
        
        // Attempt to focus on the active note editor
        this.focusOnActiveEditor();

        //const templateLocation = "x-eCortex_Operations/xUtilities/Templates";
        const templateLocation = `${this.templaterSettingsLocation}`;
        console.log("set template location: " + templateLocation);
        const templaterCommandString = `templater-obsidian:${templateLocation}/${noteType} Template.md`;

        // Check if the Templater command exists
        const commandExists = this.app.commands.commands[templaterCommandString] !== undefined;

        let templaterCommand;
        if (commandExists) {
            templaterCommand = `\n\`\`\`dataviewjs\nthis.app.commands.executeCommandById('${templaterCommandString}');\n\`\`\`\n`;
        } else {
            // Use a general template if the specific noteType template does not exist
            templaterCommand = `\n\`\`\`dataviewjs\nthis.app.commands.executeCommandById('templater-obsidian:${templateLocation}/General Template.md');\n\`\`\`\n`;
        }

        let insertDataviewBlock = !fileContent.includes(templaterCommand);
        let foundMatchingDiv = false;

        // Use your original regex for matching and updating existing blocks
        let modifiedContentAfterMetadata = fileContent.substring(metadataBlockEnd).replace(
            /```{cssBlockStart class="type-template( previous)? ([^"]+)"}```([\s\S]*?)```{cssBlockEnd} ```/g,
            (match, previous, capturedNoteType, innerContent) => {
                if (capturedNoteType.trim() === noteType) {
                    foundMatchingDiv = true; // Found a div matching the current noteType
                    return `\`\`\`{cssBlockStart class="type-template ${noteType}"}\`\`\`${innerContent}\`\`\`{cssBlockEnd} \`\`\``;
                } else if (!previous) {
                    return `\`\`\`{cssBlockStart class="type-template previous ${capturedNoteType}"}\`\`\`${innerContent}\`\`\`{cssBlockEnd} \`\`\``;
                }
                return match;
            }
        );

        let finalContent = fileContent.substring(0, metadataBlockEnd) + modifiedContentAfterMetadata;
        if (insertDataviewBlock && !foundMatchingDiv) {
            finalContent += templaterCommand; // Append the dynamically constructed DataviewJS block if needed
        }

        if (finalContent !== fileContent) {
            await this.app.vault.modify(file, finalContent);
            if (insertDataviewBlock && !foundMatchingDiv) {
                setTimeout(() => {
                    this.app.workspace.activeLeaf.rebuildView(); // Refresh the view
                    setTimeout(async () => {
                        let updatedContent = await this.app.vault.read(file);
                        updatedContent = updatedContent.replace(templaterCommand, ""); // Clean up by removing the DataviewJS block
                        await this.app.vault.modify(file, updatedContent);
                    }, 1000); //eric just changed this from 1000 to 2000 on 2/26 at 1210p
                }, 500);
            }
        }
    }

    focusOnActiveEditor() {
        const activeLeaf = this.app.workspace.activeLeaf;
        if (activeLeaf && activeLeaf.view.getViewType() === 'markdown') {
            const editor = activeLeaf.view.sourceMode.cmEditor;
            editor.focus(); // Focus on the editor
            // Optionally, set the cursor to a specific position
            // editor.setCursor(editor.lineCount(), 0); // Move cursor to the end
        }
    }

    onunload() {
        console.log("Unloading Template Adder plugin");
    }
}