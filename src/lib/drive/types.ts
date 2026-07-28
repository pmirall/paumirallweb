/**
 * Interfaz del adaptador de Google Drive, en solo lectura. El resto del sistema
 * no sabe si detrás hay Drive de verdad o la versión falsa. La aplicación nunca
 * sube, modifica ni borra nada en Drive. Ver ADR 0006.
 */
export type DriveFolder = {
  driveId: string
  name: string
  parentDriveId: string | null
  createdTime: string
}

export type DriveFile = {
  driveId: string
  name: string
  mimeType: string
  bytes: number
  parentDriveId: string
  modifiedTime: string
}

export type DriveListing = {
  folders: DriveFolder[]
  files: DriveFile[]
}

export interface DriveAdapter {
  /** Contenido directo de una carpeta: subcarpetas y archivos. */
  list(folderDriveId: string): Promise<DriveListing>
  /** Abre el flujo de un archivo para descargarlo. Nunca expone la URL de Drive. */
  openStream(fileDriveId: string): Promise<ReadableStream<Uint8Array>>
}
