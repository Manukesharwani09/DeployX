import fs from "fs";
import path from "path";

export const getAllFiles = (folderPath: string)=>{
    let response: string[] = [];

    const allFilesandFolders = fs.readdirSync(folderPath);

    allFilesandFolders.forEach((file)=>{
        const fullPath = path.join(folderPath, file);
        if(fs.statSync(fullPath).isDirectory()){
            response = response.concat(getAllFiles(fullPath));
        } else {
            response.push(fullPath);
        }
    });

    return response;
}