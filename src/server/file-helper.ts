import * as fs from "fs";

type WriteObjProps = {
  faces: number[][];
  vertices: number[][];
};

export function createFileStream(name: string, folder: string = "./target") {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
    console.log(`Folder created at: ${folder}`);
  }
  const os = fs.createWriteStream(`${folder}/${name}`);
  return os;
}

export function writeOBJ(p: WriteObjProps, os: fs.WriteStream) {
  //write obj file
  for (const pos of p.vertices) {
    os.write("v " + pos.join(" ") + "\n");
  }
  for (const face of p.faces) {
    os.write("f " + face.map((i) => i + 1).join(" ") + "\n");
  }
}
