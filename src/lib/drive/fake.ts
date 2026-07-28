import type { DriveAdapter, DriveListing } from './types'

/**
 * Adaptador falso de Drive para desarrollo y pruebas. Reproduce las tres formas
 * que conviven en el Drive real: sesiones sueltas con nombre y fecha, carpetas
 * de cliente que dentro llevan años y sesiones, y carpetas de evento. Con nombres
 * tan irregulares como los de verdad, para que la cola se pruebe contra lo que
 * hay. Ver docs/drive-inventario.md.
 */
const ROOT = '02-sesiones'

const FOLDERS: Record<string, DriveListing> = {
  [ROOT]: {
    folders: [
      { driveId: 'f-marlene', name: 'Marlene.25.07.01', parentDriveId: ROOT, createdTime: '2025-07-01T10:00:00Z' },
      { driveId: 'f-perales', name: 'Perales.25.11.07', parentDriveId: ROOT, createdTime: '2025-11-07T10:00:00Z' },
      { driveId: 'f-jorge', name: 'Jorge.24.13.02', parentDriveId: ROOT, createdTime: '2024-02-13T10:00:00Z' },
      { driveId: 'f-pepo', name: 'Pepo', parentDriveId: ROOT, createdTime: '2023-09-14T22:03:17Z' },
      { driveId: 'f-toro', name: 'ElToroRugby.24.06.15', parentDriveId: ROOT, createdTime: '2024-06-15T10:00:00Z' },
    ],
    files: [],
  },
  'f-perales': {
    folders: [],
    files: [
      { driveId: 'file-p1', name: 'DSC00671.jpg', mimeType: 'image/jpeg', bytes: 15_000_000, parentDriveId: 'f-perales', modifiedTime: '2025-11-07T12:00:00Z' },
      { driveId: 'file-p2', name: 'DSC00672.jpg', mimeType: 'image/jpeg', bytes: 14_200_000, parentDriveId: 'f-perales', modifiedTime: '2025-11-07T12:01:00Z' },
      { driveId: 'file-p3', name: 'edicion.psd', mimeType: 'image/vnd.adobe.photoshop', bytes: 22_000_000, parentDriveId: 'f-perales', modifiedTime: '2025-11-08T09:00:00Z' },
    ],
  },
  'f-pepo': {
    folders: [{ driveId: 'f-pepo-2026', name: '2026', parentDriveId: 'f-pepo', createdTime: '2026-01-01T10:00:00Z' }],
    files: [],
  },
  'f-pepo-2026': {
    folders: [
      { driveId: 'f-pepo-group', name: 'Group.21.06.26', parentDriveId: 'f-pepo-2026', createdTime: '2026-06-21T10:00:00Z' },
      { driveId: 'f-pepo-int', name: 'Intensive 06.06.26', parentDriveId: 'f-pepo-2026', createdTime: '2026-06-06T10:00:00Z' },
    ],
    files: [],
  },
}

const EMPTY: DriveListing = { folders: [], files: [] }

export class FakeDriveAdapter implements DriveAdapter {
  async list(folderDriveId: string): Promise<DriveListing> {
    return FOLDERS[folderDriveId] ?? EMPTY
  }

  async openStream(): Promise<ReadableStream<Uint8Array>> {
    // Un flujo mínimo con contenido de marcador, suficiente para las pruebas.
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('archivo de prueba'))
        controller.close()
      },
    })
  }
}

export const rootFolderId = ROOT
