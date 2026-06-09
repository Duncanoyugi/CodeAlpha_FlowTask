export interface CreateColumnDto {
  name: string;
  position?: number;
}

export interface UpdateColumnDto {
  name?: string;
  position?: number;
}

export interface ReorderColumnsDto {
  columnIds: string[]; // Array of column IDs in the desired order
}