
export const TOOL_CONDITIONS = [
  { value: "good", label: "Baik" },
  { value: "damaged", label: "Rusak" },
  { value: "missing", label: "Hilang" },
];

export const TOOL_CATEGORIES = [
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
  { value: "jaringan", label: "Jaringan" },
  { value: "utility", label: "Utility" },
];

export const ACCEPTED_DOC_TYPES = [
  // PDF
  'application/pdf',
  // Microsoft Word
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Microsoft Excel
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Microsoft PowerPoint
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Text files
  'text/plain',
  'text/csv',
  // OpenDocument formats
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  // RTF
  'application/rtf',
  // ZIP (for some document formats)
  'application/zip',
  'application/x-zip-compressed'
];

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml'
];