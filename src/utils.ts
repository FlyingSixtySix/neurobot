import fs from 'fs';
import path from 'path';
import { BotInteraction } from './classes/BotInteraction';

export function listFiles(dir: string, includeExactPath = false, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        let filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            listFiles(filePath, includeExactPath, fileList);
        } else {
            filePath = filePath
                .replaceAll('\\', '/');
            if (!includeExactPath) {
                filePath = filePath
                    .replace(`${import.meta.dir}/`, '');
            }
            fileList.push(filePath);
        }
    });

    return fileList;
}

export async function getInteractions(dir: string): Promise<BotInteraction[]> {
    const files = listFiles(dir);

    const interactionPaths = files.map(file => path.join(import.meta.dir, file));

    const interactions: BotInteraction[] = [];

    for (const file of interactionPaths) {
        const interaction = (await import(file)).default;

        // if interaction is not a BotInteraction, warn and skip
        if (!('data' in interaction) || !('execute' in interaction)) {
            console.warn(`File ${file} is not a BotInteraction`);
            continue;
        }

        interactions.push(interaction.data.toJSON());
    }

    return interactions;
}
